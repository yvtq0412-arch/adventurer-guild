/**
 * キャプチャ＆分��� API
 * POST /api/payments/capture-and-distribute
 *
 * クエスト完了承認後、エスクローをキャプチャし冒険者に報酬を分配する
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { captureAndDistribute } from '@/lib/stripe/escrow';

const RequestSchema = z.object({
  questId: z.string().min(1),
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

  const { questId } = parsed.data;

  try {
    // クエスト取得・権限チェック
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json(
        { error: 'クエストが見つかりません' },
        { status: 404 }
      );
    }

    const quest = questDoc.data()!;

    // 依頼者のみが承認後の分配を実行できる
    if (quest.clientId !== user.uid) {
      return NextResponse.json(
        { error: 'このクエストの依頼者ではありません' },
        { status: 403 }
      );
    }

    if (quest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `分配にはAPPROVEDステータスが必要です (現在: ${quest.status})` },
        { status: 409 }
      );
    }

    // キャプチャ＆分配実行
    const { chargeId, transferId } = await captureAndDistribute(questId);

    return NextResponse.json({
      message: '報酬分配が完了しました',
      chargeId,
      transferId,
      distributed: {
        adventurerReward: quest.adventurerReward,
        guildFee: quest.guildFee,
        withholdingTaxAmount: quest.withholdingTaxAmount || 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[capture-and-distribute] エラー: ${message}`);
    return NextResponse.json(
      { error: `報酬分配に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
