'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, getUserDocument, signOut, ensureUserDocument } from '@/lib/firebase/auth';
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
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // ドキュメントがなければ自動作成（Googleログイン初回など）
        let memberDoc = await getUserDocument(firebaseUser.uid);
        if (!memberDoc) {
          memberDoc = await ensureUserDocument(firebaseUser);
        }
        setMember(memberDoc);
      } else {
        setMember(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
