import { Timestamp } from 'firebase/firestore';

/**
 * レビュー対象ロール
 * - adventurer_review : 依頼者 → 冒険者への評価
 * - client_review     : 冒険者 → 依頼者への評価
 */
export type ReviewDirection = 'adventurer_review' | 'client_review';

/**
 * レビュー
 * Firestore: reviews/{reviewId}
 *
 * questId と direction の組み合わせは一意（重複投稿防止）
 */
export interface Review {
  reviewId: string;
  questId: string;
  direction: ReviewDirection;

  /** 評価した側のUID */
  reviewerId: string;
  /** 評価された側のUID */
  revieweeId: string;

  /** 星評価 1〜5（整数） */
  rating: number;
  /** コメント（任意・最大300文字） */
  comment?: string;

  createdAt: Timestamp;
}

/** レビュー投稿の入力 */
export interface CreateReviewInput {
  rating: number;   // 1〜5
  comment?: string; // 最大300文字
}
