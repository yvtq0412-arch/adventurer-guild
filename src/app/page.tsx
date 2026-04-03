'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-stone-950" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            <span className="text-amber-400">冒険者</span>
            <span className="text-white">ギルド</span>
          </h1>
          <p className="text-xl sm:text-2xl text-stone-300 mb-4 max-w-2xl mx-auto">
            スキルを持つ冒険者と、依頼を持つクライアントをつなぐ
          </p>
          <p className="text-lg text-amber-400/80 mb-12">
            透明な手数料10% - エスクロー決済で安心取引
          </p>

          {!loading && !user && (
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-amber-600/25"
              >
                ギルドに登録する
              </Link>
              <Link
                href="/login"
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-8 py-4 rounded-xl text-lg font-semibold transition border border-stone-700"
              >
                ログイン
              </Link>
            </div>
          )}

          {!loading && user && (
            <Link
              href="/quests"
              className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-amber-600/25"
            >
              依頼掲示板を見る
            </Link>
          )}
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-stone-800/40 border border-stone-700/50 rounded-2xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-amber-400 mb-3">
              エスクロー決済
            </h3>
            <p className="text-stone-400">
              依頼金額はギルドが一時預かり。作業完了・承認後に報酬を分配。
              双方が安心して取引できます。
            </p>
          </div>

          <div className="bg-stone-800/40 border border-stone-700/50 rounded-2xl p-8">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-amber-400 mb-3">
              透明な手数料10%
            </h3>
            <p className="text-stone-400">
              ギルド維持費として一律10%。報酬の90%が冒険者へ。
              隠れた追加料金はありません。
            </p>
          </div>

          <div className="bg-stone-800/40 border border-stone-700/50 rounded-2xl p-8">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="text-xl font-semibold text-amber-400 mb-3">
              インボイス対応
            </h3>
            <p className="text-stone-400">
              適格請求書を自動生成。源泉徴収にも対応。
              個人・企業どちらも安心の税務対応。
            </p>
          </div>
        </div>
      </section>

      {/* 手数料説明セクション */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          報酬分配の仕組み
        </h2>
        <div className="bg-stone-800/40 border border-stone-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex h-8 rounded-full overflow-hidden">
                <div className="bg-green-500 flex items-center justify-center text-sm font-semibold" style={{ width: '90%' }}>
                  冒険者 90%
                </div>
                <div className="bg-amber-600 flex items-center justify-center text-xs font-semibold" style={{ width: '10%' }}>
                  10%
                </div>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-stone-900/50 rounded-lg p-4">
              <div className="text-stone-500 text-sm">依頼金額</div>
              <div className="text-2xl font-bold text-white">¥100,000</div>
            </div>
            <div className="bg-stone-900/50 rounded-lg p-4">
              <div className="text-stone-500 text-sm">冒険者報酬</div>
              <div className="text-2xl font-bold text-green-400">¥90,000</div>
            </div>
            <div className="bg-stone-900/50 rounded-lg p-4">
              <div className="text-stone-500 text-sm">ギルド維持費</div>
              <div className="text-2xl font-bold text-amber-400">¥10,000</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
