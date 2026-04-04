'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'adventurer';
  content: string;
  createdAt: Timestamp | null;
  readBy: string[];
}

interface ChatPanelProps {
  questId: string;
  clientId: string;
  adventurerId?: string;
  /** チャットが利用可能か（受注者が確定してから） */
  isAvailable?: boolean;
}

export function ChatPanel({
  questId,
  clientId,
  adventurerId,
  isAvailable = true,
}: ChatPanelProps) {
  const { user, member, getIdToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isClient = user?.uid === clientId;
  const isAdventurer = user?.uid === adventurerId;
  const canChat = isAvailable && (isClient || isAdventurer);

  // Firestoreのリアルタイムリスナー
  useEffect(() => {
    if (!user || !canChat) return;

    const messagesQuery = query(
      collection(db, 'chats', questId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        messageId: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [questId, user, canChat]);

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 既読にする
  useEffect(() => {
    if (!user || !canChat || messages.length === 0) return;

    async function markAsRead() {
      try {
        const token = await getIdToken();
        if (!token) return;
        await fetch(`/api/chats/${questId}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // 既読エラーは無視
      }
    }
    markAsRead();
  }, [messages.length, questId, user, canChat, getIdToken]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setError('');

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/chats/${questId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '送信に失敗しました');
      }

      setInputValue('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました');
    } finally {
      setSending(false);
    }
  }, [inputValue, sending, questId, getIdToken]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enterで送信（Shift+Enterは改行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(ts: Timestamp | null): string {
    if (!ts) return '';
    const date = ts.toDate();
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (isToday) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // チャット未開放の場合
  if (!isAvailable) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">💬</div>
        <p className="text-sm text-gray-500">
          冒険者が受諾するとチャットが開始されます
        </p>
      </div>
    );
  }

  // 関係者以外には表示しない
  if (!canChat) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
        <span className="text-sm font-medium text-gray-700">チャット</span>
        {messages.length > 0 && (
          <span className="text-xs text-gray-400 ml-auto">{messages.length}件</span>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            まだメッセージはありません。<br />
            最初のメッセージを送ってみましょう！
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.uid;

            return (
              <div
                key={msg.messageId}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {/* 送信者名（相手のメッセージのみ） */}
                  {!isMine && (
                    <span className="text-xs text-gray-400 px-1">
                      {msg.senderName}
                      <span className="ml-1 text-gray-300">
                        {msg.senderRole === 'client' ? '（依頼者）' : '（冒険者）'}
                      </span>
                    </span>
                  )}

                  {/* メッセージバブル */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isMine
                        ? 'bg-indigo-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* 時刻 */}
                  <span className="text-xs text-gray-300 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* エラー */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* 入力エリア */}
      <div className="border-t border-gray-100 p-3 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Enterで送信)"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition leading-relaxed"
          style={{ maxHeight: '120px' }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = 'auto';
            t.style.height = Math.min(t.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || sending}
          className="flex-shrink-0 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 text-white rounded-xl transition flex items-center justify-center"
        >
          {sending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
