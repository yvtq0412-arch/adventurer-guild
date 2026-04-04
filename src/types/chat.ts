import { Timestamp } from 'firebase/firestore';

/** チャットメッセージ */
export interface ChatMessage {
  messageId: string;
  questId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'adventurer';
  content: string;
  createdAt: Timestamp;
  /** 既読したユーザーUID一覧 */
  readBy: string[];
}

/** チャットスレッド（questごとに1つ） */
export interface ChatThread {
  questId: string;
  clientId: string;
  adventurerId: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  lastSenderId?: string;
  /** 未読カウント: { [uid]: count } */
  unreadCount: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
