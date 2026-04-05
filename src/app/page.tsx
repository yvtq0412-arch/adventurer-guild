'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div>
      {/* ヒーロー */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            手数料15%〜（ランクで最低10%） - 透明な料金体系
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            スキルと依頼を
            <br />
            <span className="text-indigo-500">安全につなぐ</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            エスクロー決済で双方が安心。報酬は作業完了後に自動分配。
            インボイス対応で個人も企業も安心して取引できます。
          </p>

          {!loading && !user && (
            <div className="flex justify-center gap-3">
              <Link
                href="/register"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-base font-medium transition shadow-sm"
              >
                無料で始める
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-xl text-base font-medium transition border border-gray-200"
              >
                ログイン
              </Link>
            </div>
          )}

          {!loading && user && (
            <Link
              href="/quests"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-base font-medium transition shadow-sm"
            >
              依頼掲示板を見る
            </Link>
          )}
        </div>
      </section>

      {/* 報酬分配の図解 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <div className="flex h-3 rounded-full overflow-hidden mb-6">
            <div className="bg-emerald-500 rounded-l-full" style={{ width: '85%' }} />
            <div className="bg-indigo-500 rounded-r-full" style={{ width: '15%' }} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">依頼金額</div>
              <div className="text-2xl font-bold text-gray-900">¥100,000</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-xs text-emerald-500 uppercase tracking-wider mb-1">ワーカー報酬</div>
              <div className="text-2xl font-bold text-emerald-600">¥85,000</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="text-xs text-indigo-500 uppercase tracking-wider mb-1">プラットフォーム手数料</div>
              <div className="text-2xl font-bold text-indigo-600">¥15,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">安心して取引できる仕組み</h2>
          <p className="text-gray-500">シンプルで透明性の高い決済フロー</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">エスクロー決済</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              依頼金額をプラットフォームが一時預かり。作業完了・承認後に報酬を自動分配します。
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">透明な手数料15%〜</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              報酬の85%〜90%がワーカーへ。ランクが上がるほど手数料が下がります。隠れた追加料金はありません。
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">インボイス対応</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              適格請求書を自動生成。源泉徴収にも対応し、個人・法人どちらも安心です。
            </p>
          </div>
        </div>
      </section>

      {/* フロー */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">かんたん4ステップ</h2>
        </div>
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: '1', title: '依頼を作成', desc: '金額とカテゴリを設定' },
            { step: '2', title: '仮払い', desc: 'エスクローで安全に預託' },
            { step: '3', title: '作業・納品', desc: 'ワーカーが対応' },
            { step: '4', title: '承認・分配', desc: '報酬を自動送金' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                {item.step}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{item.title}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* もっと詳しく */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">サービスの仕組みや手数料についてもっと詳しく知りたい方は</p>
        <Link href="/about" className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-medium text-sm transition">
          Guildについて詳しく見る
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-100 mt-8 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">Guild - エスクロー決済プラットフォーム</div>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="text-gray-400 hover:text-gray-600 transition">Guildについて</Link>
            <Link href="/quests" className="text-gray-400 hover:text-gray-600 transition">依頼掲示板</Link>
            <Link href="/register" className="text-gray-400 hover:text-gray-600 transition">無料登録</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
