'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthChange, ensureUserDocument, signOut } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/client';
import type { GuildMember } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  member: GuildMember | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  member: null,
  loading: true,
  signOut: async () => {},
  getIdToken: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<GuildMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      // 前のFirestoreリスナーを解除
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Firestoreドキュメントをリアルタイム監視
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            setMember(snapshot.data() as GuildMember);
          } else {
            // ドキュメントがなければ自動作成（Googleログイン初回など）
            await ensureUserDocument(firebaseUser);
            // ensureUserDocument後はonSnapshotが自動的に更新を受け取る
          }
          setLoading(false);
        });
      } else {
        setMember(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setMember(null);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken(true); // 強制リフレッシュで常に有効なトークンを取得
  }, [user]);

  return {
    user,
    member,
    loading,
    signOut: handleSignOut,
    getIdToken,
  };
}
