/**
 * Firebase Admin SDK 初期化
 * サーバーサイド（API Routes）でのみ使用
 * セキュリティルールをバイパスして直接Firestoreを操作する
 */

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = getAdminApp();

/** Firestore (Admin) - セキュリティルールバイパス */
export const adminDb = getFirestore(adminApp);

/** Firebase Auth (Admin) - トークン検証用 */
export const adminAuth = getAuth(adminApp);

/** Firebase Storage (Admin) - PDF保存用 */
export const adminStorage = getStorage(adminApp);

export default adminApp;
