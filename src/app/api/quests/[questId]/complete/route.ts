/**
 * クエスト完了報告 API
 * POST /api/quests/[questId]/complete
 *
 * 冒険者が作業完了を報告する
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { executeTransition } from '@/lib/quest-state-machine';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { questId } = await params;

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const questRef = adminDb.collection('quests').doc(questId);
      const questDoc = await transaction.get(questRef);

      if (!questDoc.exists) {
        return NextResponse.json(
          { error: 'クエストが見つかりません' },
          { status: 404 }
        );
      }

      const quest = questDoc.data()!;

      // 担当冒険者のみ完了報告可能
      if (quest.adventurerId !== user.uid) {
        return NextResponse.json(
          { error: 'このクエストの担当冒険者ではありません' },
          { status: 403 }
        );
      }

      const { nextStatus } = executeTransition(
        quest.status,
        'report_completion',
        'adventurer'
      );

      transaction.update(questRef, {
        status: nextStatus,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({
          from: quest.status,
          to: nextStatus,
          changedBy: user.uid,
          changedAt: new Date(),
          reason: '冒険者が作業完了を報告',
        }),
      });

      return NextResponse.json({
        message: 'クエスト完了を報告しました。依頼者の承認をお待ちください。',
        questId,
        status: nextStatus,
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[complete-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `完了報告に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
