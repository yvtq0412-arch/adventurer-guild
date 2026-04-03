/**
 * クエストキャンセル・返金 API
 * POST /api/payments/cancel-quest
 *
 * エスクロー済みクエストのキャンセルと返金を処理する
 * - ESCROWED: 全額返金
 * - WORK_IN_PROGRESS: 部分返金（90%返金、10%ギルド保持）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { cancelAndRefund } from '@/lib/stripe/escrow';

const RequestSchema = z.object({
  questId: z.string().min(1),
  reason: z.string().min(1).max(500),
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

  const { questId, reason } = parsed.data;

  try {
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json(
        { error: 'クエストが見つかりません' },
        { status: 404 }
      );
    }

    const quest = questDoc.data()!;

    // 依頼者のみキャンセル可能
    if (quest.clientId !== user.uid) {
      return NextResponse.json(
        { error: 'このクエストの依頼者ではありません' },
        { status: 403 }
      );
    }

    // ステータスに応じた返金ポリシー決定
    let refundPolicy: 'full_refund' | 'partial_refund';

    switch (quest.status) {
      case 'ESCROWED':
        refundPolicy = 'full_refund';
        break;
      case 'WORK_IN_PROGRESS':
        refundPolicy = 'partial_refund';
        break;
      default:
        return NextResponse.json(
          {
            error: `このステータスではキャンセルできません (現在: ${quest.status})`,
            hint: 'ESCROWED または WORK_IN_PROGRESS の場合のみキャンセル可能です',
          },
          { status: 409 }
        );
    }

    const result = await cancelAndRefund(questId, refundPolicy);

    return NextResponse.json({
      message:
        refundPolicy === 'full_refund'
          ? '全額返金を実行しました'
          : '部分返金を実行しました（ギルド維持費10%は保持）',
      ...result,
      reason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[cancel-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `キャンセル処理に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
