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

/** チェック項目の定義 */
interface CheckItem {
  id: string;
  label: string;
  termsRef?: string; // 利用規約の条文番号
}

const POST_CHECKS: CheckItem[] = [
  { id: 'escrow', label: '依頼作成時に報酬全額をエスクロー（仮払い）すること', termsRef: '第5条' },
  { id: 'fee', label: '取引金額の10%（ランクにより変動）がギルド手数料として差し引かれること', termsRef: '第7条' },
  { id: 'cancel', label: '作業開始後のキャンセルは10%を差し引いた返金となること', termsRef: '第8条' },
  { id: 'direct', label: 'Guildを介さない直接取引は禁止されていること', termsRef: '第10条' },
  { id: 'prohibited', label: '法令に違反する依頼（人の送迎、医療行為、無資格工事等）を投稿しないこと', termsRef: '第10条' },
  { id: 'labor', label: '時間拘束型の依頼（○時〜○時まで作業）は労働契約リスクがあるため、作業量・成果物で記載すること', termsRef: '第10条' },
  { id: 'license', label: '資格・免許が必要な作業については、受注者の資格確認は依頼者の責任で行うこと', termsRef: '第10条の2' },
  { id: 'terms', label: '利用規約およびプライバシーポリシーの全文を読み、内容を理解しました' },
];

const ACCEPT_CHECKS: CheckItem[] = [
  { id: 'duty', label: '受注した作業を誠実に完了する義務があること', termsRef: '第6条' },
  { id: 'stripe', label: '報酬の受け取りにStripe Connectの設定が必要なこと', termsRef: '第7条' },
  { id: 'withholding', label: '一部カテゴリでは源泉徴収税が控除されること', termsRef: '第7条' },
  { id: 'direct', label: 'Guildを介さない直接取引は禁止されていること', termsRef: '第10条' },
  { id: 'prohibited', label: '法令に違反する依頼と知りつつ受注しないこと（人の送迎、医療行為、無資格工事等）', termsRef: '第10条' },
  { id: 'license', label: '資格・免許が必要な作業について、虚偽の資格申告を行った場合は損害賠償・永久BANの対象となること', termsRef: '第10条の2' },
  { id: 'report', label: '悪質な行為に対して通報された場合、即座にアカウントが停止される可能性があること', termsRef: '第11条' },
  { id: 'terms', label: '利用規約およびプライバシーポリシーの全文を読み、内容を理解しました' },
];

export function TermsAgreementModal({ mode, onAgreed, onCancel }: Props) {
  const { user } = useAuth();
  const checks = mode === 'post' ? POST_CHECKS : ACCEPT_CHECKS;
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allChecked = checks.every((c) => checkedIds.has(c.id));

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAgree() {
    if (!allChecked || !user) return;
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

  const title = mode === 'post' ? '依頼を作成する前に' : 'クエスト（依頼）を受注する前に';
  const desc = mode === 'post'
    ? '依頼の作成・エスクロー決済を利用するには、以下の各項目を確認のうえ、すべてにチェックを入れてください。'
    : 'クエスト（依頼）の受注・報酬の受け取りを行うには、以下の各項目を確認のうえ、すべてにチェックを入れてください。';

  const checkedCount = checkedIds.size;
  const totalCount = checks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-400">{checkedCount}/{totalCount} 確認済み</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>

        {/* チェック項目一覧（スクロール可能） */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {checks.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  isChecked
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-0.5 w-4 h-4 accent-indigo-500 shrink-0 rounded"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm leading-relaxed ${isChecked ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {item.termsRef && (
                    <span className="text-[10px] text-gray-400 ml-1">（{item.termsRef}）</span>
                  )}
                </div>
              </label>
            );
          })}

          <Link
            href="/terms"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 transition mt-2"
          >
            利用規約全文を読む
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* プログレスバー + フッター */}
        <div className="shrink-0 border-t border-gray-100">
          {/* プログレス */}
          <div className="px-6 pt-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
            {!allChecked && (
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                残り{totalCount - checkedCount}項目にチェックしてください
              </p>
            )}
            {allChecked && (
              <p className="text-xs text-indigo-500 mt-1.5 text-center font-medium">
                すべての項目を確認しました
              </p>
            )}
          </div>

          <div className="px-6 pb-6 pt-3 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition"
            >
              キャンセル
            </button>
            <button
              onClick={handleAgree}
              disabled={!allChecked || loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              {loading ? '処理中...' : '同意して続ける'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
