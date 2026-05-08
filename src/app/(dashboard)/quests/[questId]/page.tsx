'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuestStatusBadge } from '@/components/quest/QuestStatusBadge';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { TermsAgreementModal } from '@/components/terms/TermsAgreementModal';
import { getQuestCategoryInfo, isWithholdingRequired } from '@/constants/quest-categories';
import { getAvailableActions } from '@/lib/quest-state-machine';
import type { Quest } from '@/types/quest';
import type { ActorRole } from '@/lib/quest-state-machine';

/** 星評価コンポーネント */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star}星`}
        >
          {star <= (hovered || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.questId as string;
  const { user, member, getIdToken } = useAuth();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ endpoint: string; body: object } | null>(null);

  // 受注時の確認チェック
  const [confirmedAccept, setConfirmedAccept] = useState(false);

  // 通報UI用状態
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // 評価UI用状態
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [counterpartHasReviewed, setCounterpartHasReviewed] = useState(false);

  const loadQuest = useCallback(async () => {
    try {
      const questDoc = await getDoc(doc(db, 'quests', questId));
      if (questDoc.exists()) {
        setQuest(questDoc.data() as Quest);
      }
    } catch (err) {
      console.error('取引取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [questId]);

  const loadReviewStatus = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch(`/api/quests/${questId}/rate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHasReviewed(data.hasReviewed);
        setCounterpartHasReviewed(data.counterpartHasReviewed);
      }
    } catch {
      // 評価ステータス取得失敗は無視
    }
  }, [questId, getIdToken]);

  useEffect(() => {
    loadQuest();
  }, [loadQuest]);

  useEffect(() => {
    if (quest?.status === 'DISTRIBUTED') {
      loadReviewStatus();
    }
  }, [quest?.status, loadReviewStatus]);

  async function handleSubmitReport() {
    if (!quest || !reportReason || reportDescription.length < 10) return;
    setReportLoading(true);
    try {
      const token = await getIdToken();
      const reportedUserId = isClient ? quest.adventurerId : quest.clientId;
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questId, reportedUserId, reason: reportReason, description: reportDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowReportModal(false);
      setMessage('通報を受け付けました。対象ユーザーのアカウントは停止されました。');
      setMessageType('success');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '通報の送信に失敗しました');
      setMessageType('error');
      setShowReportModal(false);
    } finally {
      setReportLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (reviewRating === 0) return;
    setReviewLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/quests/${questId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHasReviewed(true);
      setMessage('評価を送信しました！');
      setMessageType('success');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '評価の送信に失敗しました');
      setMessageType('error');
    } finally {
      setReviewLoading(false);
    }
  }

  function handleAcceptWithTermsCheck(endpoint: string, body?: object) {
    // 受注前に利用規約同意チェック
    if (!member?.termsAgreedAt) {
      setPendingAction({ endpoint, body: body || {} });
      setShowTermsModal(true);
      return;
    }
    handleAction(endpoint, body);
  }

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
        <p className="text-gray-500">取引が見つかりません</p>
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
            {quest.prefecture}{quest.city ? ` ${quest.city}` : ''}{quest.town ? ` ${quest.town}` : ''}
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

                  const onClickHandler = action.action === 'accept_quest'
                    ? () => handleAcceptWithTermsCheck(endpoint, body)
                    : () => handleAction(endpoint, body);

                  return (
                    <button
                      key={action.action}
                      onClick={onClickHandler}
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

          {/* 評価UI（DISTRIBUTED後、当事者のみ） */}
          {quest.status === 'DISTRIBUTED' && (isClient || isAdventurer) && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-2">
                ⭐ 評価
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {isClient ? '出品者の仕事ぶりを評価してください' : '依頼者を評価してください'}
              </p>

              {hasReviewed ? (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-sm font-medium text-green-700">評価済みです</p>
                  {!counterpartHasReviewed && (
                    <p className="text-xs text-gray-400 mt-1">
                      {isClient ? '出品者' : '依頼者'}からの評価を待っています
                    </p>
                  )}
                  {counterpartHasReviewed && (
                    <p className="text-xs text-gray-400 mt-1">双方の評価が完了しました</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">評価（必須）</p>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                    {reviewRating > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {['', '残念でした', 'もう一息', '普通', '良かった', '素晴らしい！'][reviewRating]}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">コメント（任意・最大300文字）</p>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      maxLength={300}
                      placeholder="作業内容や対応について一言..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none resize-none"
                    />
                    <p className="text-xs text-gray-300 text-right">{reviewComment.length}/300</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || reviewLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl font-medium text-sm transition"
                  >
                    {reviewLoading ? '送信中...' : '評価を送信する'}
                  </button>
                  {counterpartHasReviewed && (
                    <p className="text-xs text-indigo-500 text-center">
                      {isClient ? '出品者' : '依頼者'}はすでに評価を送信しています
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 受注ボタン（未ログイン・関係者以外） */}
          {!isClient && !isAdventurer && quest.status === 'ESCROWED' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <p className="text-indigo-700 font-medium mb-1 text-center">この依頼を受注しますか？</p>
              <p className="text-sm text-indigo-500 mb-4 text-center">受諾すると作業エリアでの対応が必要です</p>
              {user ? (
                <div className="space-y-3">
                  {/* 禁止依頼確認チェック */}
                  <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedAccept}
                      onChange={(e) => setConfirmedAccept(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-indigo-500 shrink-0"
                    />
                    <span className="text-xs text-gray-700 leading-relaxed">
                      この依頼が
                      <a href="/prohibited" target="_blank" className="text-indigo-500 underline font-medium">
                        禁止サービスガイドライン
                      </a>
                      に該当しないことを確認しました。法令違反の依頼と知りつつ受注した場合、アカウント停止の対象となります。
                    </span>
                  </label>

                  <button
                    onClick={() => handleAcceptWithTermsCheck(`/api/quests/${questId}/accept`)}
                    disabled={actionLoading || !confirmedAccept}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:bg-gray-300"
                  >
                    ⚔️ 受注する
                  </button>
                  <p className="text-xs text-indigo-400 text-center">
                    ※ 受注には
                    <Link href="/guild-card/apply" className="underline hover:text-indigo-600">
                      出品者プロフィール
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

          {/* 希望日時候補 */}
          {quest.preferredDates && quest.preferredDates.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-2">📅 希望日時の候補</div>
              <div className="space-y-1.5">
                {quest.preferredDates.map((pd, idx) => {
                  const timeLabels: Record<string, string> = {
                    morning: '午前',
                    afternoon: '午後',
                    evening: '夕方以降',
                    anytime: '終日OK',
                  };
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {new Date(pd.date + 'T00:00:00').toLocaleDateString('ja-JP', {
                          month: 'long', day: 'numeric', weekday: 'short',
                        })}
                      </span>
                      {pd.timeSlot && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                          {timeLabels[pd.timeSlot] || pd.timeSlot}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ※ 日時はチャットで最終調整してください
              </p>
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
              報酬はGuildが安全に預かります。作業完了後に確認・承認してから出品者に支払われます。
            </p>
          </div>

          {/* 通報ボタン */}
          {(isClient || isAdventurer) && quest.adventurerId && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="w-full text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 py-2.5 rounded-lg transition flex items-center justify-center gap-1"
            >
              🚨 相手を通報する
            </button>
          )}
        </div>
      </div>

      {showTermsModal && (
        <TermsAgreementModal
          mode="accept"
          onAgreed={() => {
            setShowTermsModal(false);
            if (pendingAction) {
              handleAction(pendingAction.endpoint, pendingAction.body);
              setPendingAction(null);
            }
          }}
          onCancel={() => {
            setShowTermsModal(false);
            setPendingAction(null);
          }}
        />
      )}

      {/* 通報モーダル */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">🚨 ユーザーを通報する</h3>
            <p className="text-xs text-gray-400 mb-4">
              悪質な行為を確認した場合は通報してください。通報が受理されると、対象ユーザーのアカウントは<strong className="text-red-500">即座に停止</strong>されます。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">通報理由（必須）</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="fraud">詐欺・不正行為</option>
                  <option value="harassment">ハラスメント・嫌がらせ</option>
                  <option value="no_show">無断キャンセル・すっぽかし</option>
                  <option value="false_completion">虚偽の完了報告</option>
                  <option value="inappropriate">不適切な内容</option>
                  <option value="safety_concern">安全上の懸念</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  詳細（必須・10文字以上）
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="具体的に何が起きたか記載してください..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-300 text-right">{reportDescription.length}/1000</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600 leading-relaxed">
                ⚠️ 通報が受理されると、対象ユーザーは<strong>即座にアカウント停止（BAN）</strong>となり、二度と依頼・受注ができなくなります。虚偽の通報は利用規約違反となります。
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowReportModal(false); setReportReason(''); setReportDescription(''); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={!reportReason || reportDescription.length < 10 || reportLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {reportLoading ? '送信中...' : '通報する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
