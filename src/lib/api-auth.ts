/**
 * API Route 認証ヘルパー
 * リクエストからFirebase Auth トークンを検証する
 */

import { adminAuth } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

/** 認証済みユーザー情報 */
export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

/**
 * リクエストから認証トークンを検証してユーザー情報を返す
 *
 * @param request NextRequest
 * @returns ユーザー情報（未認証の場合はnull）
 */
export async function verifyAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/**
 * 認証必須のAPIルートラッパー
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: '認証が必要です。ギルド証を提示してください。' },
    { status: 401 }
  );
}
