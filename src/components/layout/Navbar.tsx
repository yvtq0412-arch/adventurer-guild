'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, member, loading, signOut } = useAuth();

  return (
    <nav className="border-b border-amber-800/30 bg-stone-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏰</span>
            <span className="text-xl font-bold text-amber-400">
              冒険者ギルド
            </span>
          </Link>

          {/* ナビゲーション */}
          <div className="hidden sm:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/quests"
                  className="text-stone-300 hover:text-amber-400 transition"
                >
                  依頼掲示板
                </Link>
                {member?.role !== 'client' && (
                  <Link
                    href="/my-adventures"
                    className="text-stone-300 hover:text-amber-400 transition"
                  >
                    冒険記録
                  </Link>
                )}
                {member?.role !== 'adventurer' && (
                  <Link
                    href="/my-quests"
                    className="text-stone-300 hover:text-amber-400 transition"
                  >
                    発注依頼
                  </Link>
                )}
                <Link
                  href="/wallet"
                  className="text-stone-300 hover:text-amber-400 transition"
                >
                  金庫
                </Link>
                <Link
                  href="/invoices"
                  className="text-stone-300 hover:text-amber-400 transition"
                >
                  請求書
                </Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-stone-700">
                  <span className="text-sm text-stone-400">
                    {member?.displayName || 'Loading...'}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-sm text-stone-500 hover:text-red-400 transition"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-stone-300 hover:text-amber-400 transition"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition font-medium"
                  >
                    ギルド登録
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
