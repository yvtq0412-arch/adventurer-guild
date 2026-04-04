/**
 * クエスト受諾 API
 * POST /api/quests/[questId]/accept
 *
 * 冒険者がクエストを受諾する
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

      // 依頼者は自分のクエストを受諾できない
      if (quest.clientId === user.uid) {
        return NextResponse.json(
          { error: '自分の依頼は受諾できません' },
          { status: 403 }
        );
      }

      // 冒険者の Stripe Connect 確認
      const adventurerDoc = await transaction.get(
        adminDb.collection('users').doc(user.uid)
      );
      const adventurerData = adventurerDoc.data();

      if (!adventurerData?.stripeOnboardingComplete) {
        return NextResponse.json(
          { error: 'Stripe アカウントのオンボーディングを完了してください' },
          { status: 400 }
        );
      }

      // ギルドカードの確認（承認済みのみ受注可能）
      const guildCardDoc = await transaction.get(
        adminDb.collection('guild_cards').doc(user.uid)
      );
      if (!guildCardDoc.exists || guildCardDoc.data()?.status !== 'APPROVED') {
        return NextResponse.json(
          {
            error: 'クエストを受注するにはギルドカードが必要です。まずギルドカードを申請・取得してください。',
            redirectTo: '/guild-card/apply',
          },
          { status: 403 }
        );
      }

      // ステートマシンで遷移を検証
      const { nextStatus } = executeTransition(
        quest.status,
        'accept_quest',
        'adventurer'
      );

      transaction.update(questRef, {
        status: nextStatus,
        adventurerId: user.uid,
        updatedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({
          from: quest.status,
          to: nextStatus,
          changedBy: user.uid,
          changedAt: new Date(),
          reason: '冒険者がクエストを受諾',
        }),
      });

      return NextResponse.json({
        message: 'クエストを受諾しました。冒険の始まりです！',
        questId,
        status: nextStatus,
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[accept-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `クエスト受諾に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
