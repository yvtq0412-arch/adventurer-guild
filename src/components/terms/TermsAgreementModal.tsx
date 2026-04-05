'use client';

import { useState } from 'react';
import Link from 'next/link';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  /** 'post' = 依頼する / 'accept' = 受注する */
  mode: 'post' | 'accept';
  onAgreed: () => void;
  onCancel: () => void;
}

export function TermsAgreementModal({ mode, onAgreed, onCancel }: Props) {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAgree() {
    if (!checked || !user) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        termsAgreedAt: serverTimestamp(),
      });
      onAgreed();
    } catch {
      setError('同意の保存に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  const title = mode === 'post' ? '依頼を作成する前に' : 'クエストを受注する前に';
  const desc = mode === 'post'
    ? '依頼の作成・エスクロー決済を利用するには、利用規約への同意が必要です。'
    : 'クエストの受注・報酬の受け取りを行うには、利用規約への同意が必要です。';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>

        {/* 規約サマリー */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">同意する主な内容</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {mode === 'post' ? (
              <>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>依頼作成時に報酬全額をエスクロー（仮払い）すること</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>取引金額の10%（ランクにより変動）がギルド手数料として差し引かれること</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>作業開始後のキャンセルは10%を差し引いた返金となること</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>Guildを介さない直接取引は禁止されていること</li>
              </>
            ) : (
              <>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>受注した作業を誠実に完了する義務があること</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>報酬の受け取りにStripe Connectの設定が必要なこと</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>一部カテゴリでは源泉徴収税が控除されること</li>
                <li className="flex gap-2"><span className="text-indigo-500 shrink-0">✓</span>Guildを介さない直接取引は禁止されていること</li>
              </>
            )}
          </ul>

          <Link
            href="/terms"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 transition mt-1"
          >
            利用規約全文を読む
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          {/* チェックボックス */}
          <label className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-indigo-500 shrink-0"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              利用規約およびプライバシーポリシーを読み、内容に同意します
            </span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* フッター */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleAgree}
            disabled={!checked || loading}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
          >
            {loading ? '処理中...' : '同意して続ける'}
          </button>
        </div>
      </div>
    </div>
  );
}
