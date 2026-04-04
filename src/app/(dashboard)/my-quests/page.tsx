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
  { label: '支払い待ち', statuses: ['PENDING'] },
  { label: '募集中', statuses: ['ESCROWED'] },
  { label: '作業中', statuses: ['WORK_IN_PROGRESS'] },
  { label: '確認待ち', statuses: ['COMPLETED'] },
  { label: '完了', statuses: ['DISTRIBUTED', 'APPROVED'] },
  { label: 'キャンセル', statuses: ['CANCELLED', 'REFUNDED'] },
];

export default function MyQuestsPage() {
  const { user, getIdToken } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchMyQuests() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'quests'),
          where('clientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setQuests(snapshot.docs.map((doc) => doc.data() as Quest));
      } catch (err) {
        console.error('依頼取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyQuests();
  }, [user]);

  const filteredQuests = STATUS_TABS[activeTab].statuses.length === 0
    ? quests
    : quests.filter((q) => STATUS_TABS[activeTab].statuses.includes(q.status));

  async function handleApprove(questId: string) {
    setActionLoading(questId);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/quests/${questId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('承認しました。報酬を分配中です。');
      setQuests((prev) => prev.map((q) => q.questId === questId ? { ...q, status: 'DISTRIBUTED' as QuestStatus } : q));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '承認に失敗しました');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(questId: string) {
    setActionLoading(questId);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/payments/cancel-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questId, reason: 'クライアントによるキャンセル' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setQuests((prev) => prev.map((q) => q.questId === questId ? { ...q, status: 'CANCELLED' as QuestStatus } : q));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'キャンセルに失敗しました');
    } finally {
      setActionLoading(null);
    }
  }

  const formatYen = (amount: number) => `¥${amount.toLocaleString()}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">発注依頼</h1>
          <p className="text-sm text-gray-500 mt-1">あなたが作成した依頼の管理</p>
        </div>
        <Link href="/quests/new" className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
          + 新しい依頼
        </Link>
      </div>

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

      {/* 依頼一覧 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400 mb-4">まだ依頼がありません</p>
          <Link href="/quests/new" className="text-indigo-500 hover:text-indigo-600 text-sm font-medium">
            最初の依頼を作成する →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuests.map((quest) => {
            const categoryInfo = getQuestCategoryInfo(quest.category);
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
                    <div className="text-lg font-bold text-gray-900">{formatYen(quest.totalAmount)}</div>
                    <div className="text-xs text-gray-400">報酬 {formatYen(quest.adventurerReward)}</div>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                  {quest.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleApprove(quest.questId)}
                      disabled={actionLoading === quest.questId}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      {actionLoading === quest.questId ? '処理中...' : '承認して報酬を分配'}
                    </button>
                  )}
                  {(quest.status === 'ESCROWED' || quest.status === 'WORK_IN_PROGRESS') && (
                    <button
                      onClick={() => handleCancel(quest.questId)}
                      disabled={actionLoading === quest.questId}
                      className="bg-white hover:bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      {actionLoading === quest.questId ? '処理中...' : 'キャンセル'}
                    </button>
                  )}
                  {quest.status === 'PENDING' && (
                    <Link
                      href={`/quests/${quest.questId}`}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                    >
                      支払いに進む
                    </Link>
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
    </div>
  );
}
