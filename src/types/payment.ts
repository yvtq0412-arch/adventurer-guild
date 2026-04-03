import { Timestamp } from 'firebase/firestore';

/** トランザクション種別 */
export type TransactionType =
  | 'escrow_hold'      // エスクロー保留
  | 'escrow_capture'   // エスクローキャプチャ
  | 'distribution'     // 報酬分配
  | 'refund_full'      // 全額返金
  | 'refund_partial';  // 部分返金

/** トランザクションステータス */
export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

/** ギルドトランザクション */
export interface GuildTransaction {
  transactionId: string;
  questId: string;
  type: TransactionType;

  // 金額（JPY整数）
  totalAmount: number;
  guildFeeAmount: number;
  adventurerRewardAmount: number;
  withholdingTaxAmount: number;
  stripeFeeAmount: number;

  // Stripe参照
  paymentIntentId: string;
  chargeId?: string;
  transferId?: string;
  refundId?: string;

  // 参加者
  clientId: string;
  adventurerId?: string;

  status: TransactionStatus;

  // 冪等性キー
  idempotencyKey: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** エスクロー金庫の分配内訳 */
export interface EscrowVaultBreakdown {
  totalAmount: number;        // 依頼総額（依頼者が支払う額）
  guildFee: number;           // ギルド維持費 (10%)
  adventurerReward: number;   // 冒険者報酬 (90%)
  withholdingTax: number;     // 源泉徴収税額（該当する場合）
  netToAdventurer: number;    // 冒険者への実支払額
}

/** 返金結果 */
export interface RefundResult {
  refundType: 'full' | 'partial';
  refundAmount: number;
  retainedAmount: number;
  refundId: string;
}
