/**
 * Stripe オンボーディングリンク生成 API
 * POST /api/stripe-connect/create-account-link
 *
 * オンボーディングが途中の場合に再開リンクを生成する
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { createAccountLink } from '@/lib/stripe/connect';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Stripe アカウントが見つかりません。先にアカウントを作成してください。' },
        { status: 404 }
      );
    }

    const url = await createAccountLink(userData.stripeConnectAccountId);

    return NextResponse.json({
      onboardingUrl: url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-account-link] エラー: ${message}`);
    return NextResponse.json(
      { error: `リンク生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
