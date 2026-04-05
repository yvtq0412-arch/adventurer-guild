/**
 * Stripe Identity VerificationSession 作成
 * POST /api/identity/create-session
 *
 * ログイン中のユーザーに対して本人確認セッションを作成する。
 * フロントエンドはclientSecretを使ってStripe.jsのUIを起動する。
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  // 認証チェック
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.replace('Bearer ', '');

  if (!idToken) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
  }

  // 既にverified済みなら再作成不要
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }

  const userData = userDoc.data()!;
  if (userData.identityStatus === 'verified') {
    return NextResponse.json({ error: '既に本人確認済みです' }, { status: 400 });
  }

  try {
    // VerificationSession作成
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: uid },
      options: {
        document: {
          // 日本の運転免許証・パスポートを許可
          allowed_types: ['driving_license', 'passport'],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    // Firestoreにsessionidを保存し、状態をpendingに
    await adminDb.collection('users').doc(uid).update({
      identityStatus: 'pending',
      stripeVerificationSessionId: session.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー';
    console.error(`[Identity] VerificationSession作成エラー: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
