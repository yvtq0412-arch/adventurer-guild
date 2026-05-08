/**
 * Stripe Express アカウント作成 API
 * POST /api/stripe-connect/create-account
 *
 * 冒険者が報酬を受け取るための Stripe Express アカウントを作成する
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { createExpressAccount, createAccountLink } from '@/lib/stripe/connect';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 既にアカウントがある場合はオンボーディングリンクのみ返す
    if (userData.stripeConnectAccountId) {
      const url = await createAccountLink(userData.stripeConnectAccountId);
      return NextResponse.json({
        accountId: userData.stripeConnectAccountId,
        onboardingUrl: url,
        message: '既存のアカウントのオンボーディングリンクを生成しました',
      });
    }

    // 新規 Express アカウント作成
    const accountId = await createExpressAccount(
      user.uid,
      userData.email
    );

    // オンボーディングリンク生成
    const onboardingUrl = await createAccountLink(accountId);

    return NextResponse.json({
      accountId,
      onboardingUrl,
      message: '出品者ウォレット（Stripe Express アカウント）を作成しました',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-account] エラー: ${message}`);
    return NextResponse.json(
      { error: `アカウント作成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
