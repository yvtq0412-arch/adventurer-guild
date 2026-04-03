/**
 * Firebase Admin SDK 初期化
 * サーバーサイド（API Routes）でのみ使用
 * セキュリティルールをバイパスして直接Firestoreを操作する
 */

import { initializeApp, getApps, cert, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;
let _adminStorage: Storage | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  if (getApps().length > 0) {
    _adminApp = getApp();
    return _adminApp;
  }

  _adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return _adminApp;
}

/** Firestore (Admin) - セキュリティルールバイパス */
export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_adminDb) _adminDb = getFirestore(getAdminApp());
    return (_adminDb as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Firebase Auth (Admin) - トークン検証用 */
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
    return (_adminAuth as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/** Firebase Storage (Admin) - PDF保存用 */
export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_, prop) {
    if (!_adminStorage) _adminStorage = getStorage(getAdminApp());
    return (_adminStorage as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default getAdminApp;
