/**
 * インボイス取得 API
 * GET /api/invoices/[invoiceId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { invoiceId } = await params;

  try {
    const invoiceDoc = await adminDb.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'インボイスが見つかりません' },
        { status: 404 }
      );
    }

    const invoice = invoiceDoc.data()!;

    // 発行者または受領者のみ閲覧可能
    if (invoice.recipientId !== user.uid && invoice.issuerId !== user.uid) {
      return NextResponse.json(
        { error: 'このインボイスの閲覧権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json(invoice);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[get-invoice] エラー: ${message}`);
    return NextResponse.json(
      { error: `インボイス取得に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
