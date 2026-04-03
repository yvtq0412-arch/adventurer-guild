/**
 * Stripe Express ダッシュボードリンク API
 * POST /api/stripe-connect/dashboard-link
 *
 * 冒険者が自分の Stripe Express ダッシュボードにアクセスするためのリンク
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { createDashboardLink } from '@/lib/stripe/connect';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Stripe アカウントが見つかりません' },
        { status: 404 }
      );
    }

    if (!userData.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: 'オンボーディングが完了していません' },
        { status: 400 }
      );
    }

    const url = await createDashboardLink(userData.stripeConnectAccountId);

    return NextResponse.json({ dashboardUrl: url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[dashboard-link] エラー: ${message}`);
    return NextResponse.json(
      { error: `ダッシュボードリンク生成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
