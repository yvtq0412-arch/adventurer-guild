/**
 * Firebase Auth ヘルパー
 * クライアント側の認証ユーティリティ
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';
import type { GuildMember, GuildRole } from '@/types/user';

const googleProvider = new GoogleAuthProvider();

/** メール/パスワードでサインアップ */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: GuildRole
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(credential.user, displayName, role);
  return credential.user;
}

/** メール/パスワードでサインイン */
export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Googleでサインイン（リダイレクト開始）
 *  呼び出し後はGoogleの認証画面にリダイレクトされる。
 *  認証後のリダイレクト先で handleGoogleRedirectResult() を呼び出すこと。
 */
export async function signInWithGoogle(role?: GuildRole) {
  // roleをsessionStorageに保存し、リダイレクト後に参照できるようにする
  if (role) {
    sessionStorage.setItem('pendingGoogleRole', role);
  }
  await signInWithRedirect(auth, googleProvider);
}

/** Googleリダイレクト後の結果を処理する
 *  useAuthProvider の useEffect 内で呼び出す。
 *  新規ユーザーであればFirestoreにドキュメントを作成する。
 */
export async function handleGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (!result) return null;

  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    const role = (sessionStorage.getItem('pendingGoogleRole') as GuildRole | null) || 'adventurer';
    sessionStorage.removeItem('pendingGoogleRole');
    await createUserDocument(
      result.user,
      result.user.displayName || '冒険者',
      role
    );
  } else {
    sessionStorage.removeItem('pendingGoogleRole');
  }

  return result.user;
}

/** サインアウト */
export async function signOut() {
  return firebaseSignOut(auth);
}

/** ユーザードキュメントを作成 */
async function createUserDocument(
  user: User,
  displayName: string,
  role: GuildRole
) {
  const memberData: Omit<GuildMember, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: user.uid,
    displayName,
    email: user.email || '',
    role,
    avatarUrl: user.photoURL || undefined,
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
