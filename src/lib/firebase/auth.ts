/**
 * Firebase Auth ヘルパー
 * クライアント側の認証ユーティリティ
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';
import type { GuildMember } from '@/types/user';

const googleProvider = new GoogleAuthProvider();
// ログイン済みアカウントも含めて毎回アカウント選択画面を表示
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** メール/パスワードでサインアップ */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(credential.user, displayName);
  return credential.user;
}

/** メール/パスワードでサインイン */
export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Googleでサインイン */
export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  // 初回ログインの場合はユーザードキュメント作成
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(
      credential.user,
      credential.user.displayName || '冒険者',
    );
  }
  return credential.user;
}

/** サインアウト */
export async function signOut() {
  return firebaseSignOut(auth);
}

/** ユーザードキュメントを作成 */
async function createUserDocument(user: User, displayName: string) {
  const memberData: Omit<GuildMember, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: user.uid,
    displayName,
    email: user.email || '',
    avatarUrl: user.photoURL || undefined,
    phoneVerified: false,
    identityStatus: 'unverified',
    stripeOnboardingComplete: false,
    isQualifiedInvoiceIssuer: false,
    withholdingTaxApplicable: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), memberData);
}

/** ユーザードキュメントを取得 */
export async function getUserDocument(uid: string): Promise<GuildMember | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as GuildMember;
}

/** 認証状態の変更を監視 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
