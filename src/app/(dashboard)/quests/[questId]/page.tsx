'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuestStatusBadge } from '@/components/quest/QuestStatusBadge';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { getQuestCategoryInfo, isWithholdingRequired } from '@/constants/quest-categories';
import { getAvailableActions } from '@/lib/quest-state-machine';
import type { Quest } from '@/types/quest';
import type { ActorRole } from '@/lib/quest-state-machine';

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.questId as string;
  const { user, member, getIdToken } = useAuth();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchQuest() {
      try {
        const questDoc = await getDoc(doc(db, 'quests', questId));
        if (questDoc.exists()) {
          setQuest(questDoc.data() as Quest);
        }
      } catch (err) {
        console.error('クエスト取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuest();
  }, [questId]);

  async function handleAction(endpoint: string, body?: object) {
    setActionLoading(true);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message || '操作が完了しました');
      // リロード
      const questDoc = await getDoc(doc(db, 'quests', questId));
      if (questDoc.exists()) setQuest(questDoc.data() as Quest);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '操作に失敗しました');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-stone-500">読み込み中...</div>;
  }

  if (!quest) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-stone-500">クエストが見つかりません</p>
      </div>
    );
  }

  const categoryInfo = getQuestCategoryInfo(quest.category);
  const isClient = user?.uid === quest.clientId;
  const isAdventurer = user?.uid === quest.adventurerId;

  // 現在のユーザーの役割を判定
  let actorRole: ActorRole | undefined;
  if (isClient) actorRole = 'client';
  else if (isAdventurer) actorRole = 'adventurer';

  const availableActions = actorRole
    ? getAvailableActions(quest.status, actorRole)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryInfo?.icon}</span>
          <span className="text-sm text-stone-500 bg-stone-800 px-2 py-0.5 rounded">
            {categoryInfo?.label}
          </span>
          <QuestStatusBadge status={quest.status} />
        </div>
        <h1 className="text-3xl font-bold text-white">{quest.title}</h1>
      </div>

      {/* メッセージ */}
      {message && (
        <div className="bg-amber-900/30 border border-amber-700 text-amber-300 rounded-lg p-3 mb-6">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-amber-400 mb-3">依頼内容</h2>
            <p className="text-stone-300 whitespace-pre-wrap">{quest.description}</p>
          </div>

          {/* アクションボタン */}
          {availableActions.length > 0 && (
            <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-amber-400 mb-4">
                アクション
              </h2>
              <div className="space-y-3">
                {availableActions.map((action) => {
                  let endpoint = '';
                  let body: object = {};
                  let buttonClass = 'bg-stone-700 hover:bg-stone-600 text-white';

                  switch (action.action) {
                    case 'accept_quest':
                      endpoint = `/api/quests/${questId}/accept`;
                      buttonClass = 'bg-green-600 hover:bg-green-500 text-white';
                      break;
                    case 'report_completion':
                      endpoint = `/api/quests/${questId}/complete`;
                      buttonClass = 'bg-blue-600 hover:bg-blue-500 text-white';
                      break;
                    case 'approve_completion':
                      endpoint = `/api/quests/${questId}/approve`;
                      buttonClass = 'bg-amber-600 hover:bg-amber-500 text-white';
                      break;
                    case 'cancel_before_acceptance':
                    case 'cancel_during_work':
                      endpoint = '/api/payments/cancel-quest';
                      body = { questId, reason: 'クライアントによるキャンセル' };
                      buttonClass = 'bg-red-600/80 hover:bg-red-500 text-white';
                      break;
                    default:
                      return null;
                  }

                  return (
                    <button
                      key={action.action}
                      onClick={() => handleAction(endpoint, body)}
                      disabled={actionLoading}
                      className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 ${buttonClass}`}
                    >
                      {actionLoading ? '処理中...' : action.description}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          <PaymentBreakdown
            totalAmount={quest.totalAmount}
            isWithholdingApplicable={isWithholdingRequired(quest.category)}
          />

          {quest.deadline && (
            <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-4">
              <div className="text-sm text-stone-500">納期</div>
              <div className="text-white font-medium">
                {new Date(quest.deadline.seconds * 1000).toLocaleDateString('ja-JP')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
