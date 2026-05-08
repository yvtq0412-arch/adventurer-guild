'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuestStatusBadge } from '@/components/quest/QuestStatusBadge';
import { getQuestCategoryInfo } from '@/constants/quest-categories';
import type { Quest, QuestStatus } from '@/types/quest';

const STATUS_TABS: { label: string; statuses: QuestStatus[] }[] = [
  { label: 'すべて', statuses: [] },
  { label: '作業中', statuses: ['WORK_IN_PROGRESS'] },
  { label: '確認待ち', statuses: ['COMPLETED'] },
  { label: '報酬受取済', statuses: ['DISTRIBUTED', 'APPROVED'] },
  { label: 'キャンセル', statuses: ['CANCELLED', 'REFUNDED'] },
];

export default function MyAdventuresPage() {
  const { user, member, getIdToken } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchMyAdventures() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'quests'),
          where('adventurerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setQuests(snapshot.docs.map((doc) => doc.data() as Quest));
      } catch (err) {
        console.error('受注履歴取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyAdventures();
  }, [user]);

  const filteredQuests = STATUS_TABS[activeTab].statuses.length === 0
    ? quests
    : quests.filter((q) => STATUS_TABS[activeTab].statuses.includes(q.status));

  async function handleComplete(questId: string) {
    setActionLoading(questId);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('完了報告を送信しました。クライアントの承認をお待ちください。');
      setQuests((prev) => prev.map((q) => q.questId === questId ? { ...q, status: 'COMPLETED' as QuestStatus } : q));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '完了報告に失敗しました');
    } finally {
      setActionLoading(null);
    }
  }

  const formatYen = (amount: number) => `¥${amount.toLocaleString()}`;

  // Stripe未設定の場合の警告
  const needsStripeSetup = member && !member.stripeOnboardingComplete;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">受注一覧</h1>
          <p className="text-sm text-gray-500 mt-1">あなたが受けた依頼の管理</p>
        </div>
        <Link href="/quests" className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition border border-gray-200">
          依頼を探す
        </Link>
      </div>

      {/* Stripe未設定の警告 */}
      {needsStripeSetup && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-orange-800">出金設定が未完了です</div>
            <div className="text-xs text-orange-600 mt-0.5">報酬を受け取るにはStripeアカウントの設定が必要です</div>
          </div>
          <Link href="/wallet" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
            設定する
          </Link>
        </div>
      )}

      {message && (
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg p-3 mb-6 text-sm">
          {message}
        </div>
      )}

      {/* ステータスタブ */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-6">
        {STATUS_TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === i
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.statuses.length === 0 && <span className="ml-1 text-xs opacity-70">({quests.length})</span>}
            {tab.statuses.length > 0 && (
              <span className="ml-1 text-xs opacity-70">
                ({quests.filter((q) => tab.statuses.includes(q.status)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 受注一覧 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">⚔️</div>
          <p className="text-gray-400 mb-4">まだ受注した依頼がありません</p>
          <Link href="/quests" className="text-indigo-500 hover:text-indigo-600 text-sm font-medium">
            依頼サービス一覧で探す →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuests.map((quest) => {
            const categoryInfo = getQuestCategoryInfo(quest.category);
            const withholdingAmount = quest.withholdingTaxAmount || 0;
            const netReward = quest.adventurerReward - withholdingAmount;

            return (
              <div key={quest.questId} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                        {categoryInfo?.icon} {categoryInfo?.label}
                      </span>
                      <QuestStatusBadge status={quest.status} />
                    </div>
                    <Link href={`/quests/${quest.questId}`} className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition">
                      {quest.title}
                    </Link>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">{quest.description}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-lg font-bold text-emerald-600">{formatYen(quest.adventurerReward)}</div>
                    {withholdingAmount > 0 && (
                      <div className="text-xs text-gray-400">
                        源泉徴収後 {formatYen(netReward)}
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                  {quest.status === 'WORK_IN_PROGRESS' && (
                    <button
                      onClick={() => handleComplete(quest.questId)}
                      disabled={actionLoading === quest.questId}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      {actionLoading === quest.questId ? '送信中...' : '完了報告を送信'}
                    </button>
                  )}
                  {quest.status === 'COMPLETED' && (
                    <span className="text-sm text-gray-400 px-4 py-2">
                      クライアントの承認待ち...
                    </span>
                  )}
                  {quest.status === 'DISTRIBUTED' && (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 px-4 py-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      報酬受取済
                    </span>
                  )}
                  <Link
                    href={`/quests/${quest.questId}`}
                    className="text-gray-400 hover:text-gray-600 text-sm px-4 py-2 rounded-lg transition"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 実績サマリー */}
      {quests.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">実績サマリー</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {quests.filter((q) => q.status === 'DISTRIBUTED').length}
              </div>
              <div className="text-xs text-gray-400 mt-1">完了した依頼</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">
                {formatYen(
                  quests
                    .filter((q) => q.status === 'DISTRIBUTED')
                    .reduce((sum, q) => sum + q.adventurerReward, 0)
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">累計報酬</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {quests.filter((q) => q.status === 'WORK_IN_PROGRESS').length}
              </div>
              <div className="text-xs text-gray-400 mt-1">進行中の依頼</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
