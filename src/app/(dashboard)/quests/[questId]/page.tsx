'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuestStatusBadge } from '@/components/quest/QuestStatusBadge';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { ChatPanel } from '@/components/chat/ChatPanel';
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
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function loadQuest() {
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

  useEffect(() => {
    loadQuest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setMessageType('success');
      await loadQuest();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '操作に失敗しました');
      setMessageType('error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-gray-500">クエストが見つかりません</p>
        <Link href="/quests" className="text-indigo-500 hover:text-indigo-600 text-sm mt-4 inline-block">
          ← 一覧に戻る
        </Link>
      </div>
    );
  }

  const categoryInfo = getQuestCategoryInfo(quest.category);
  const isClient = user?.uid === quest.clientId;
  const isAdventurer = user?.uid === quest.adventurerId;

  let actorRole: ActorRole | undefined;
  if (isClient) actorRole = 'client';
  else if (isAdventurer) actorRole = 'adventurer';

  const availableActions = actorRole
    ? getAvailableActions(quest.status, actorRole)
    : [];

  // チャットが利用可能かどうか（受注者が確定している状態）
  const chatAvailable = !!quest.adventurerId && [
    'WORK_IN_PROGRESS',
    'COMPLETED',
    'APPROVED',
    'DISTRIBUTED',
    'DISPUTED',
  ].includes(quest.status);

  // ESCROWEDでも依頼者が先に話しかけられるように（受注前チャット）
  const chatVisibleStatuses = ['ESCROWED', 'WORK_IN_PROGRESS', 'COMPLETED', 'APPROVED', 'DISTRIBUTED', 'DISPUTED'];
  const showChat = (isClient || isAdventurer) && chatVisibleStatuses.includes(quest.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/quests" className="hover:text-indigo-500 transition">受注する</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{quest.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
              {categoryInfo?.icon} {categoryInfo?.label || quest.category}
            </span>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
              {quest.questType === 'personal' ? '🏠 個人' : '🏢 企業'}
            </span>
          </div>
          <QuestStatusBadge status={quest.status} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{quest.title}</h1>

        {(quest.prefecture || quest.city) && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {quest.prefecture}{quest.city ? ` ${quest.city}` : ''}
          </div>
        )}
      </div>

      {/* ステータスメッセージ */}
      {message && (
        <div className={`rounded-lg p-3 mb-6 text-sm ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-100 text-green-700'
            : 'bg-red-50 border border-red-100 text-red-600'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左カラム: 依頼内容 + チャット */}
        <div className="lg:col-span-2 space-y-6">
          {/* 依頼内容 */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-3">依頼内容</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
              {quest.description}
            </p>
          </div>

          {/* アクションボタン */}
          {availableActions.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">アクション</h2>
              <div className="space-y-3">
                {availableActions.map((action) => {
                  let endpoint = '';
                  let body: object = {};
                  let buttonClass = 'bg-gray-100 hover:bg-gray-200 text-gray-700';
                  let emoji = '';

                  switch (action.action) {
                    case 'accept_quest':
                      endpoint = `/api/quests/${questId}/accept`;
                      buttonClass = 'bg-indigo-500 hover:bg-indigo-600 text-white';
                      emoji = '⚔️ ';
                      break;
                    case 'report_completion':
                      endpoint = `/api/quests/${questId}/complete`;
                      buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white';
                      emoji = '✅ ';
                      break;
                    case 'approve_completion':
                      endpoint = `/api/quests/${questId}/approve`;
                      buttonClass = 'bg-green-500 hover:bg-green-600 text-white';
                      emoji = '🎉 ';
                      break;
                    case 'cancel_before_acceptance':
                    case 'cancel_during_work':
                      endpoint = '/api/payments/cancel-quest';
                      body = { questId, reason: 'クライアントによるキャンセル' };
                      buttonClass = 'bg-white hover:bg-red-50 text-red-500 border border-red-200';
                      emoji = '✖️ ';
                      break;
                    default:
                      return null;
                  }

                  return (
                    <button
                      key={action.action}
                      onClick={() => handleAction(endpoint, body)}
                      disabled={actionLoading}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition disabled:opacity-50 ${buttonClass}`}
                    >
                      {actionLoading ? '処理中...' : `${emoji}${action.description}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* チャット */}
          {showChat && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                💬 チャット
                {!quest.adventurerId && (
                  <span className="text-xs font-normal text-gray-400">
                    （受注者が確定するとチャットが開始されます）
                  </span>
                )}
              </h2>
              <ChatPanel
                questId={questId}
                clientId={quest.clientId}
                adventurerId={quest.adventurerId}
                isAvailable={chatAvailable}
              />
            </div>
          )}

          {/* 受注ボタン（未ログイン・関係者以外） */}
          {!isClient && !isAdventurer && quest.status === 'ESCROWED' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
              <p className="text-indigo-700 font-medium mb-1">この依頼を受注しますか？</p>
              <p className="text-sm text-indigo-500 mb-4">受諾すると作業エリアでの対応が必要です</p>
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction(`/api/quests/${questId}/accept`)}
                    disabled={actionLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    ⚔️ 受注する
                  </button>
                  <p className="text-xs text-indigo-400">
                    ※ 受注には
                    <Link href="/guild-card/apply" className="underline hover:text-indigo-600">
                      ギルドカード
                    </Link>
                    が必要です
                  </p>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition inline-block"
                >
                  ログインして受注する
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 右カラム: 金額・期限・情報 */}
        <div className="space-y-4">
          <PaymentBreakdown
            totalAmount={quest.totalAmount}
            isWithholdingApplicable={isWithholdingRequired(quest.category)}
          />

          {quest.deadline && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">希望日時</div>
              <div className="text-sm font-medium text-gray-700">
                📅 {new Date(quest.deadline.seconds * 1000).toLocaleDateString('ja-JP', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">詳細情報</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ステータス</span>
                <QuestStatusBadge status={quest.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">投稿日</span>
                <span className="text-gray-600">
                  {quest.createdAt
                    ? new Date(quest.createdAt.seconds * 1000).toLocaleDateString('ja-JP')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">依頼タイプ</span>
                <span className="text-gray-600">
                  {quest.questType === 'personal' ? '個人' : '企業'}
                </span>
              </div>
            </div>
          </div>

          {/* エスクロー説明 */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
              🔒 エスクロー保護
            </div>
            <p className="text-xs text-indigo-500 leading-relaxed">
              報酬はギルドが安全に預かります。作業完了後に確認・承認してから冒険者に支払われます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
