/**
 * Firebase Client SDK 初期化
 * ブラウザ側で使用するFirebaseインスタンス
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Firebase App (シングルトン) */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/** Firebase Auth */
export const auth = getAuth(app);

/** Firestore */
export const db = getFirestore(app);

/** Firebase Storage */
export const storage = getStorage(app);

export default app;
