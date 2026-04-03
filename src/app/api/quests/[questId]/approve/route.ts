/**
 * クエスト承認 API
 * POST /api/quests/[questId]/approve
 *
 * 依頼者がクエスト完了を承認し、報酬分配をトリガーする
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { executeTransition } from '@/lib/quest-state-machine';
import { captureAndDistribute } from '@/lib/stripe/escrow';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { questId } = await params;

  try {
    // まずステータスを APPROVED に変更
    await adminDb.runTransaction(async (transaction) => {
      const questRef = adminDb.collection('quests').doc(questId);
      const questDoc = await transaction.get(questRef);

      if (!questDoc.exists) {
        throw new Error('クエストが見つかりません');
      }

      const quest = questDoc.data()!;

      if (quest.clientId !== user.uid) {
        throw new Error('このクエストの依頼者ではありません');
      }

      const { nextStatus } = executeTransition(
        quest.status,
        'approve_completion',
        'client'
      );

      transaction.update(questRef, {
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({
          from: quest.status,
          to: nextStatus,
          changedBy: user.uid,
          changedAt: new Date(),
          reason: '依頼者がクエスト完了を承認',
        }),
      });
    });

    // 報酬分配実行（別トランザクション）
    const { chargeId, transferId } = await captureAndDistribute(questId);

    return NextResponse.json({
      message: 'クエスト完了を承認し、報酬を分配しました！',
      questId,
      chargeId,
      transferId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[approve-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `承認処理に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
