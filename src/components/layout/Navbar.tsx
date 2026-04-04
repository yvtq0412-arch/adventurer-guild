'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { user, member, loading, signOut } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Guild</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <Link href="/quests" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition">
                  依頼掲示板
                </Link>
                {member?.role !== 'adventurer' && (
                  <Link href="/my-quests" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition">
                    依頼する
                  </Link>
                )}
                {member?.role !== 'client' && (
                  <Link href="/my-adventures" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition">
                    受注する
                  </Link>
                )}
                <Link href="/wallet" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition">
                  金庫
                </Link>
                <Link href="/invoices" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition">
                  請求書
                </Link>
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 text-xs font-medium">
                      {member?.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <button onClick={signOut} className="text-sm text-gray-400 hover:text-red-500 transition">
                    ログアウト
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                    TOP
                  </Link>
                  <Link href="/quests" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                    依頼を探す
                  </Link>
                  <Link href="/my-quests" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                    依頼する
                  </Link>
                  <Link href="/my-adventures" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                    受注する
                  </Link>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                    Guildについて
                  </Link>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm transition">
                    ログイン
                  </Link>
                  <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    無料登録
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
