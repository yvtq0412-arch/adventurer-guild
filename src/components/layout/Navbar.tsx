'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        isActive
          ? 'text-indigo-600 bg-indigo-50 font-medium'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, member, loading, signOut } = useAuth();
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  }

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
                {member?.role !== 'adventurer' && (
                  <NavLink href="/my-quests">依頼する</NavLink>
                )}
                {member?.role !== 'client' && (
                  <NavLink href="/quests">受注する</NavLink>
                )}
                {member?.role !== 'client' && (
                  <NavLink href="/my-adventures">受注一覧</NavLink>
                )}
                <NavLink href="/wallet">金庫</NavLink>
                <NavLink href="/invoices">請求書</NavLink>
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
                <div className="flex items-center gap-1">
                  <Link href="/" className={`px-3 py-2 rounded-lg text-sm transition ${
                    isActive('/') && pathname === '/' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    TOP
                  </Link>
                  <Link href="/my-quests" className={`px-3 py-2 rounded-lg text-sm transition ${
                    isActive('/my-quests') ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    依頼する
                  </Link>
                  <Link href="/quests" className={`px-3 py-2 rounded-lg text-sm transition ${
                    isActive('/quests') ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    受注する
                  </Link>
                  <Link href="/about" className={`px-3 py-2 rounded-lg text-sm transition ${
                    isActive('/about') ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    Guildについて
                  </Link>
                  <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
                    <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">
                      ログイン
                    </Link>
                    <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                      無料登録
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
