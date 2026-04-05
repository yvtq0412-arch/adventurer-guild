'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCategoriesByType, isWithholdingRequired } from '@/constants/quest-categories';
import { PREFECTURES } from '@/constants/areas';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { TermsAgreementModal } from '@/components/terms/TermsAgreementModal';
import type { QuestCategory, QuestType } from '@/types/quest';

export default function NewQuestPage() {
  const router = useRouter();
  const { getIdToken, member } = useAuth();

  const [questType, setQuestType] = useState<QuestType>('personal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('yard_work');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const categories = getCategoriesByType(questType);

  function handleTypeChange(type: QuestType) {
    setQuestType(type);
    const firstCat = getCategoriesByType(type)[0];
    if (firstCat) setCategory(firstCat.id);
  }

  async function doSubmit() {
    setError('');
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('認証が必要です');

      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questType,
          category,
          prefecture,
          city,
          totalAmount,
          deadline: deadline || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '依頼作成に失敗しました');
      router.push(`/quests/${data.questId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 規約未同意の場合はモーダルを表示
    if (!member?.termsAgreedAt) {
      setShowTermsModal(true);
      return;
    }
    doSubmit();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">新しい依頼を作成</h1>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 個人/企業 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">依頼タイプ</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleTypeChange('personal')}
              className={`p-4 rounded-xl border text-center transition ${questType === 'personal' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-sm font-semibold">個人の依頼</div>
              <div className="text-xs text-gray-400 mt-0.5">生活のお困りごと</div>
            </button>
            <button type="button" onClick={() => handleTypeChange('business')}
              className={`p-4 rounded-xl border text-center transition ${questType === 'business' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              <div className="text-2xl mb-1">🏢</div>
              <div className="text-sm font-semibold">企業の依頼</div>
              <div className="text-xs text-gray-400 mt-0.5">事業に関わる作業</div>
            </button>
          </div>
        </div>

        {/* タイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">依頼タイトル</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
            placeholder={questType === 'personal' ? '例: 庭の草取りをお願いしたい' : '例: 倉庫の棚卸し作業スタッフ募集'} />
        </div>

        {/* 作業場所 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作業場所
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select value={prefecture} onChange={(e) => { setPrefecture(e.target.value); setCity(''); }} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white">
              <option value="">都道府県を選択</option>
              {PREFECTURES.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
              placeholder="市区町村（例: 渋谷区）" />
          </div>
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                className={`p-2.5 rounded-lg border text-center transition ${category === cat.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <div className="text-lg">{cat.icon}</div>
                <div className="text-xs mt-1 leading-tight">{cat.label}</div>
              </button>
            ))}
          </div>
          {isWithholdingRequired(category) && (
            <p className="text-xs text-orange-500 mt-2">※ このカテゴリは源泉徴収の対象です</p>
          )}
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">依頼内容</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} maxLength={5000}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm resize-none"
            placeholder={questType === 'personal'
              ? '例: 庭の草取りと落ち葉の袋詰め（45ℓ袋×3袋分）をお願いします'
              : '例: 倉庫内の商品をカテゴリ別に仕分け・棚入れ（約200点）をお願いします'} />
          {/* 時間指定キーワード検出警告 */}
          {/\d+\s*時(間|〜|から|まで)|終日|丸\d+日|〜\d+時|\d+時〜/.test(description) && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
              <span className="text-amber-500 text-base flex-shrink-0">⚠️</span>
              <div className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">時間指定の表現が含まれています。</span>
                「○時から○時まで作業」のような記載は、労働基準法上の<span className="font-semibold">雇用契約と見なされる恐れ</span>があります。
                作業内容・量（例：「草取り 45ℓ袋×2袋分」「棚入れ 約200点」）で記載するようにしてください。
              </div>
            </div>
          )}
          {/* 常時表示の注意書き */}
          <p className="text-xs text-gray-400 mt-1.5">
            💡 依頼内容は<span className="font-medium">作業の内容・量</span>で記載してください。「○時から○時まで」のような時間指定のみの記載はお避けください。
          </p>
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">依頼金額（税込）</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
            <input type="number" value={totalAmount || ''} onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
              required min={50} max={99999999}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
              placeholder="5,000" />
          </div>
        </div>

        {totalAmount >= 50 && (
          <PaymentBreakdown totalAmount={totalAmount} isWithholdingApplicable={isWithholdingRequired(category)} />
        )}

        {/* 納期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">希望日時（任意）</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm" />
        </div>

        <button type="submit" disabled={loading || totalAmount < 50 || !prefecture || !city}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-medium transition text-sm">
          {loading ? '作成中...' : '依頼を登録する'}
        </button>
      </form>

      {showTermsModal && (
        <TermsAgreementModal
          mode="post"
          onAgreed={() => {
            setShowTermsModal(false);
            doSubmit();
          }}
          onCancel={() => setShowTermsModal(false)}
        />
      )}
    </div>
  );
}
