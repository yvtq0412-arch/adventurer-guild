'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { QUEST_CATEGORIES } from '@/constants/quest-categories';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { isWithholdingRequired } from '@/constants/quest-categories';
import type { QuestCategory } from '@/types/quest';

export default function NewQuestPage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('yard_work');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          category,
          totalAmount,
          deadline: deadline || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'クエスト作成に失敗しました');
      }

      router.push(`/quests/${data.questId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-400 mb-8">新しい依頼を作成</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトル */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">依頼タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
            placeholder="例: 庭の草取りをお願いしたい"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm text-stone-400 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {QUEST_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-2 rounded-lg border text-center transition text-sm ${
                  category === cat.id
                    ? 'border-amber-500 bg-amber-900/30 text-amber-400'
                    : 'border-stone-600 bg-stone-900 text-stone-400 hover:border-stone-500'
                }`}
              >
                <div>{cat.icon}</div>
                <div className="text-xs mt-1">{cat.label}</div>
              </button>
            ))}
          </div>
          {isWithholdingRequired(category) && (
            <p className="text-xs text-orange-400 mt-2">
              ※ このカテゴリは源泉徴収の対象です
            </p>
          )}
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">依頼内容</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            maxLength={5000}
            className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition resize-none"
            placeholder="依頼の詳細を記入してください..."
          />
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">
            依頼金額（税込）
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500">¥</span>
            <input
              type="number"
              value={totalAmount || ''}
              onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
              required
              min={50}
              max={99999999}
              className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-8 pr-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
              placeholder="50,000"
            />
          </div>
        </div>

        {/* 報酬分配プレビュー */}
        {totalAmount >= 50 && (
          <PaymentBreakdown
            totalAmount={totalAmount}
            isWithholdingApplicable={isWithholdingRequired(category)}
          />
        )}

        {/* 納期 */}
        <div>
          <label className="block text-sm text-stone-400 mb-1">
            納期（任意）
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || totalAmount < 50}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-white py-4 rounded-lg font-semibold text-lg transition"
        >
          {loading ? '作成中...' : '依頼を掲示板に登録する'}
        </button>
      </form>
    </div>
  );
}
