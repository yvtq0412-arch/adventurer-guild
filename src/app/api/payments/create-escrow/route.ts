/**
 * エスクロー作成 API
 * POST /api/payments/create-escrow
 *
 * クエスト発注時に依頼者の支払いをエスクロー（仮払い）する
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { createEscrowHold } from '@/lib/stripe/escrow';
import { calculateGuildSplit, validateAmount } from '@/lib/guild-economics';
import { createCustomer } from '@/lib/stripe/connect';
import { FieldValue } from 'firebase-admin/firestore';

const RequestSchema = z.object({
  questId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // 認証チェック
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  // リクエストバリデーション
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
    // クエスト取得
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json(
        { error: 'クエストが見つかりません' },
        { status: 404 }
      );
    }

    const quest = questDoc.data()!;

    // 権限チェック: 依頼者のみ
    if (quest.clientId !== user.uid) {
      return NextResponse.json(
        { error: 'このクエストの依頼者ではありません' },
        { status: 403 }
      );
    }

    // ステータスチェック
    if (quest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `このクエストは既にエスクロー済みです (ステータス: ${quest.status})` },
        { status: 409 }
      );
    }

    // 金額バリデーション
    validateAmount(quest.totalAmount);

    // Stripe Customer 確認/作成
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data()!;
    let customerId = userData.stripeCustomerId;

    if (!customerId) {
      customerId = await createCustomer(
        user.uid,
        userData.email,
        userData.displayName
      );
    }

    // エスクロー作成
    const { clientSecret, paymentIntentId } = await createEscrowHold(
      questId,
      quest.totalAmount,
      customerId
    );

    // クエストに PaymentIntent ID を記録
    await adminDb.collection('quests').doc(questId).update({
      paymentIntentId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 分配内訳を計算
    const { guildFee, adventurerReward } = calculateGuildSplit(quest.totalAmount);

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      escrowVault: {
        totalAmount: quest.totalAmount,
        guildFee,
        adventurerReward,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-escrow] エラー: ${message}`);
    return NextResponse.json(
      { error: `エスクロー作成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
