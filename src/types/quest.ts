import { Timestamp } from 'firebase/firestore';

/** クエストカテゴリ */
export type QuestCategory =
  | 'design'        // デザイン
  | 'writing'       // ライティング
  | 'development'   // 開発
  | 'consulting'    // コンサルティング
  | 'translation'   // 翻訳
  | 'photography'   // 撮影
  | 'video'         // 動画制作
  | 'marketing'     // マーケティング
  | 'other';        // その他

/** クエストステータス（依頼ステートマシン） */
export type QuestStatus =
  | 'PENDING'            // 依頼作成済み、支払い未完了
  | 'ESCROWED'           // エスクロー完了、冒険者募集中
  | 'WORK_IN_PROGRESS'   // 冒険者が依頼を受諾、作業中
  | 'COMPLETED'          // 冒険者が作業完了を報告
  | 'APPROVED'           // 依頼者が完了を承認
  | 'DISTRIBUTED'        // 報酬分配完了
  | 'CANCELLED'          // キャンセル
  | 'REFUNDED'           // 返金完了
  | 'DISPUTED';          // 紛争中

/** ステータス変更履歴 */
export interface QuestStatusChange {
  from: QuestStatus;
  to: QuestStatus;
  changedBy: string;
  changedAt: Timestamp;
  reason?: string;
}

/** クエスト（依頼） */
export interface Quest {
  questId: string;
  title: string;
  description: string;
  category: QuestCategory;

  // 参加者
  clientId: string;
  adventurerId?: string;

  // 金額（全てJPY整数、小数なし）
  totalAmount: number;
  adventurerReward: number;
  guildFee: number;
  withholdingTaxAmount: number;

  // ステートマシン
  status: QuestStatus;
  statusHistory: QuestStatusChange[];

  // Stripe参照
  paymentIntentId?: string;
  chargeId?: string;
  transferId?: string;
  refundId?: string;

  // メタデータ
  deadline?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  distributedAt?: Timestamp;
}

/** クエスト作成時の入力 */
export interface CreateQuestInput {
  title: string;
  description: string;
  category: QuestCategory;
  totalAmount: number;
  deadline?: string; // ISO 8601
}
