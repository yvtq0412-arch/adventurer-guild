/**
 * 本人確認ステータス同期 API
 * POST /api/identity/sync-status
 *
 * Stripe Identity VerificationSession のステータスを取得し、
 * Firestoreの identityStatus と同期する。
 *
 * Webhookが届かなかった場合のフォールバック。
 * プロフィールページ表示時に自動呼び出しされる。
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { IdentityStatus } from '@/types/user';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const sessionId = userData.stripeVerificationSessionId;

    // セッションIDがない場合はまだ本人確認を開始していない
    if (!sessionId) {
      return NextResponse.json({
        identityStatus: 'unverified',
        message: '本人確認セッションが開始されていません',
      });
    }

    // 既にverifiedなら同期不要
    if (userData.identityStatus === 'verified') {
      return NextResponse.json({
        identityStatus: 'verified',
        message: '本人確認済みです',
      });
    }

    // Stripeから最新ステータスを取得
    const session = await stripe.identity.verificationSessions.retrieve(sessionId);

    let newStatus: IdentityStatus;
    switch (session.status) {
      case 'verified':
        newStatus = 'verified';
        break;
      case 'requires_input':
        newStatus = 'failed';
        break;
      case 'processing':
        newStatus = 'pending';
        break;
      case 'canceled':
        newStatus = 'failed';
        break;
      default:
        newStatus = 'pending';
    }

    // Firestoreが古い場合のみ更新
    if (userData.identityStatus !== newStatus) {
      await adminDb.collection('users').doc(user.uid).update({
        identityStatus: newStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`[Identity Sync] ステータス更新: ${userData.identityStatus} → ${newStatus} (userId=${user.uid})`);
    }

    return NextResponse.json({
      identityStatus: newStatus,
      stripeStatus: session.status,
      message: newStatus === 'verified' ? '本人確認済みです' : `ステータス: ${newStatus}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Identity Sync] エラー: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
