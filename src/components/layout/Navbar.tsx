'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

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

function UserAvatar() {
  const { user, member, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.photoURL || member?.avatarUrl;
  const displayName = member?.displayName || user?.displayName || '';
  const initial = displayName.charAt(0) || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-indigo-300 transition focus:outline-none"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={36}
            height={36}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-sm font-semibold">{initial}</span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>

          {/* メニュー */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              アカウント設定
            </Link>
            <Link
              href="/guild-card/apply"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
              出品者プロフィール
            </Link>
          </div>

          {/* ログアウト */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { user, member, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ページ遷移でメニューを閉じる
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  }

  const avatarUrl = user?.photoURL || member?.avatarUrl;
  const displayName = member?.displayName || user?.displayName || '';

  return (
    <>
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Guild</span>
            </Link>

            {/* === デスクトップメニュー === */}
            <div className="hidden sm:flex items-center gap-1">
              {user ? (
                <>
                  <Link href="/" className={`px-3 py-2 rounded-lg text-sm transition ${
                    pathname === '/' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}>TOP</Link>
                  <Link href="/services" className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/services') && !pathname.startsWith('/services/new') ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}>🛒 サービスを探す</Link>
                  <Link href="/services/new" className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/services/new') ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}>✨ 出品する</Link>
                  <NavLink href="/my-adventures">取引一覧</NavLink>
                  <NavLink href="/wallet">ウォレット</NavLink>
                  <NavLink href="/invoices">請求書</NavLink>
                  <div className="ml-1 pl-1 border-l border-gray-200 flex items-center gap-1">
                    <NavLink href="/guide">📖 ガイド</NavLink>
                    <NavLink href="/about">ℹ️ About</NavLink>
                  </div>
                  <div className="ml-2 pl-2 border-l border-gray-200">
                    <UserAvatar />
                  </div>
                </>
              ) : (
                !loading && (
                  <div className="flex items-center gap-1">
                    <Link href="/" className={`px-3 py-2 rounded-lg text-sm transition ${
                      pathname === '/' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}>TOP</Link>
                    <Link href="/services" className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive('/services') ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}>🛒 サービスを探す</Link>
                    <Link href="/guide" className={`px-3 py-2 rounded-lg text-sm transition ${
                      isActive('/guide') ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}>📖 ご利用ガイド</Link>
                    <Link href="/about" className={`px-3 py-2 rounded-lg text-sm transition ${
                      isActive('/about') ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}>ℹ️ Guildについて</Link>
                    <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
                      <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition">ログイン</Link>
                      <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">無料登録</Link>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* === モバイルハンバーガーボタン === */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              aria-label="メニュー"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* === モバイルメニューパネル === */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 top-16 z-40">
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />

          {/* メニューパネル */}
          <div className="relative bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">

              {/* メインアクション */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link href="/services" className={`py-3 rounded-xl text-center text-sm font-semibold transition ${
                  isActive('/services') && !pathname.startsWith('/services/new') ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                }`}>🛒 サービスを探す</Link>
                <Link href="/services/new" className={`py-3 rounded-xl text-center text-sm font-semibold transition ${
                  isActive('/services/new') ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                }`}>✨ 出品する</Link>
              </div>

              {user ? (
                <>
                  {/* ユーザー情報 */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-sm font-semibold">{displayName.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* ナビリンク */}
                  {[
                    { href: '/', label: 'TOP', icon: '🏠' },
                    { href: '/my-adventures', label: '取引一覧', icon: '📜' },
                    { href: '/wallet', label: 'ウォレット', icon: '💰' },
                    { href: '/invoices', label: '請求書', icon: '📄' },
                    { href: '/profile', label: 'アカウント設定', icon: '⚙️' },
                    { href: '/guild-card/apply', label: '出品者プロフィール', icon: '🪪' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive(item.href) ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 my-2" />

                  {[
                    { href: '/guide', label: 'ご利用ガイド', icon: '📖' },
                    { href: '/about', label: 'Guildについて', icon: 'ℹ️' },
                    { href: '/prohibited', label: '禁止サービスガイドライン', icon: '🚫' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive(item.href) ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 my-2" />

                  <button
                    onClick={() => { setMobileOpen(false); signOut(); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <span className="text-base">🚪</span>
                    ログアウト
                  </button>
                </>
              ) : (
                !loading && (
                  <>
                    {[
                      { href: '/', label: 'TOP', icon: '🏠' },
                      { href: '/guide', label: 'ご利用ガイド', icon: '📖' },
                      { href: '/about', label: 'Guildについて', icon: 'ℹ️' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                        isActive(item.href) ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 my-2" />

                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" className="py-2.5 text-center text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition">
                        ログイン
                      </Link>
                      <Link href="/register" className="py-2.5 text-center text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition">
                        無料登録
                      </Link>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
