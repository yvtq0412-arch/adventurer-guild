/**
 * 評価投稿 API
 * POST /api/quests/[questId]/rate
 *
 * - 依頼者 → 冒険者 を評価（direction: 'adventurer_review'）
 * - 冒険者 → 依頼者 を評価（direction: 'client_review'）
 *
 * 前提条件:
 *   - クエストが DISTRIBUTED 状態であること
 *   - 呼び出し者がそのクエストの依頼者または冒険者であること
 *   - 同じ direction の評価が未投稿であること（冪等性）
 *
 * 冒険者評価後の処理:
 *   - guild_cards/{adventurerId} の averageRating / ratingCount / rankPoints / rank を更新
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { calcRankPoints, calcRank } from '@/lib/guild-rank';
import type { ReviewDirection } from '@/types/review';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { questId } = await params;

  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 });
  }

  const rating = Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 300) : undefined;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '評価は1〜5の整数で指定してください' }, { status: 400 });
  }

  try {
    const questRef = adminDb.collection('quests').doc(questId);
    const questDoc = await questRef.get();

    if (!questDoc.exists) {
      return NextResponse.json({ error: 'クエストが見つかりません' }, { status: 404 });
    }

    const quest = questDoc.data()!;

    // DISTRIBUTED のみ評価可
    if (quest.status !== 'DISTRIBUTED') {
      return NextResponse.json(
        { error: '報酬分配完了後のクエストのみ評価できます' },
        { status: 403 }
      );
    }

    const isClient = quest.clientId === user.uid;
    const isAdventurer = quest.adventurerId === user.uid;

    if (!isClient && !isAdventurer) {
      return NextResponse.json(
        { error: 'このクエストの当事者ではありません' },
        { status: 403 }
      );
    }

    // direction を決定
    const direction: ReviewDirection = isClient ? 'adventurer_review' : 'client_review';
    const revieweeId: string = isClient ? quest.adventurerId : quest.clientId;
    const reviewId = `${questId}_${direction}`;

    // 重複チェック
    const existingReview = await adminDb.collection('reviews').doc(reviewId).get();
    if (existingReview.exists) {
      return NextResponse.json({ error: 'すでに評価済みです' }, { status: 409 });
    }

    // トランザクション: レビュー保存 + GuildCard 更新（冒険者評価のみ）
    await adminDb.runTransaction(async (tx) => {
      const reviewRef = adminDb.collection('reviews').doc(reviewId);

      tx.set(reviewRef, {
        reviewId,
        questId,
        direction,
        reviewerId: user.uid,
        revieweeId,
        rating,
        ...(comment ? { comment } : {}),
        createdAt: FieldValue.serverTimestamp(),
      });

      // 冒険者評価の場合、GuildCard の統計を更新
      if (direction === 'adventurer_review') {
        const cardRef = adminDb.collection('guild_cards').doc(revieweeId);
        const cardDoc = await tx.get(cardRef);

        if (cardDoc.exists) {
          const card = cardDoc.data()!;
          const oldCount: number = card.ratingCount ?? 0;
          const oldAvg: number = card.averageRating ?? 0;
          const newCount = oldCount + 1;
          // 加重平均で更新
          const newAvg = Math.round(((oldAvg * oldCount + rating) / newCount) * 10) / 10;

          const completedQuestsCount: number = card.completedQuestsCount ?? 0;
          const totalEarnings: number = card.totalEarnings ?? 0;

          const newRankPoints = calcRankPoints({
            completedQuestsCount,
            totalEarnings,
            averageRating: newAvg,
            ratingCount: newCount,
          });

          const newRank = calcRank({
            completedQuestsCount,
            rankPoints: newRankPoints,
            averageRating: newAvg,
          });

          tx.update(cardRef, {
            averageRating: newAvg,
            ratingCount: newCount,
            rankPoints: newRankPoints,
            rank: newRank,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    });

    return NextResponse.json({
      message: '評価を送信しました。ありがとうございます！',
      reviewId,
      direction,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[rate-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `評価の送信に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}

/** 自分の評価済み状況を取得 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { questId } = await params;

  try {
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json({ error: 'クエストが見つかりません' }, { status: 404 });
    }

    const quest = questDoc.data()!;
    const isClient = quest.clientId === user.uid;
    const isAdventurer = quest.adventurerId === user.uid;

    if (!isClient && !isAdventurer) {
      return NextResponse.json({ hasReviewed: false, counterpartHasReviewed: false });
    }

    const myDirection: ReviewDirection = isClient ? 'adventurer_review' : 'client_review';
    const counterDirection: ReviewDirection = isClient ? 'client_review' : 'adventurer_review';

    const [myReview, counterReview] = await Promise.all([
      adminDb.collection('reviews').doc(`${questId}_${myDirection}`).get(),
      adminDb.collection('reviews').doc(`${questId}_${counterDirection}`).get(),
    ]);

    return NextResponse.json({
      hasReviewed: myReview.exists,
      counterpartHasReviewed: counterReview.exists,
      myReview: myReview.exists ? myReview.data() : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
