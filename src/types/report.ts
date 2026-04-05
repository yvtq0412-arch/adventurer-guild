import { Timestamp } from 'firebase/firestore';

/**
 * 通報の種類
 */
export type ReportReason =
  | 'fraud'            // 詐欺・不正行為
  | 'harassment'       // ハラスメント・嫌がらせ
  | 'no_show'          // 無断キャンセル・すっぽかし
  | 'false_completion' // 虚偽の完了報告
  | 'inappropriate'    // 不適切な内容
  | 'safety_concern'   // 安全上の懸念
  | 'other';           // その他

/**
 * 通報
 * Firestore: reports/{reportId}
 */
export interface Report {
  reportId: string;
  questId: string;

  /** 通報した側のUID */
  reporterId: string;
  /** 通報された側のUID */
  reportedUserId: string;

  reason: ReportReason;
  /** 詳細説明 */
  description: string;

  /** 対応ステータス */
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';

  /** 管理者対応メモ */
  adminNote?: string;
  /** 対応した管理者 */
  reviewedBy?: string;
  /** 対応日時 */
  reviewedAt?: Timestamp;

  createdAt: Timestamp;
}

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'fraud', label: '詐欺・不正行為' },
  { value: 'harassment', label: 'ハラスメント・嫌がらせ' },
  { value: 'no_show', label: '無断キャンセル・すっぽかし' },
  { value: 'false_completion', label: '虚偽の完了報告' },
  { value: 'inappropriate', label: '不適切な内容' },
  { value: 'safety_concern', label: '安全上の懸念' },
  { value: 'other', label: 'その他' },
];
