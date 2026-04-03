/**
 * インボイス生成 API
 * POST /api/invoices/generate
 *
 * クエスト完了後に適格請求書を生成する
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { generateInvoice } from '@/lib/invoice-generator';

const RequestSchema = z.object({
  questId: z.string().min(1),
  transactionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '不正なリクエスト', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { questId, transactionId } = parsed.data;

  try {
    // クエストの依頼者のみインボイス生成可能
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json(
        { error: 'クエストが見つかりません' },
        { status: 404 }
      );
    }

    const quest = questDoc.data()!;
    if (quest.clientId !== user.uid) {
      return NextResponse.json(
        { error: '依頼者のみインボイスを生成できます' },
        { status: 403 }
      );
    }

    if (quest.status !== 'DISTRIBUTED') {
      return NextResponse.json(
        { error: '報酬分配完了後のみインボイスを生成できます' },
        { status: 409 }
      );
    }

    const invoiceId = await generateInvoice(questId, transactionId);

    return NextResponse.json({
      invoiceId,
      message: '適格請求書を発行しました',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[generate-invoice] エラー: ${message}`);
    return NextResponse.json(
      { error: `インボイス生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
