/**
 * 依頼ステートマシン - Quest State Machine
 *
 * クエストのライフサイクルを管理する有限状態機械
 *
 * 状態遷移図:
 *   PENDING ──(payment authorized)──> ESCROWED
 *   ESCROWED ──(adventurer accepts)──> WORK_IN_PROGRESS
 *   ESCROWED ──(client cancels)──> CANCELLED [全額返金]
 *   WORK_IN_PROGRESS ──(adventurer reports)──> COMPLETED
 *   WORK_IN_PROGRESS ──(client cancels)──> CANCELLED [90%返金]
 *   COMPLETED ──(client approves)──> APPROVED
 *   COMPLETED ──(client disputes)──> DISPUTED
 *   APPROVED ──(system distributes)──> DISTRIBUTED
 *   CANCELLED ──(system refunds)──> REFUNDED
 *   DISPUTED ──(resolve: approve)──> APPROVED
 *   DISPUTED ──(resolve: cancel)──> CANCELLED
 */

import type { QuestStatus } from '@/types/quest';

/** 遷移を実行できる役割 */
export type ActorRole = 'client' | 'adventurer' | 'system';

/** アクション名 */
export type QuestAction =
  | 'payment_authorized'
  | 'accept_quest'
  | 'cancel_before_acceptance'
  | 'report_completion'
  | 'cancel_during_work'
  | 'approve_completion'
  | 'dispute_completion'
  | 'distribute_payment'
  | 'process_refund'
  | 'resolve_dispute_approve'
  | 'resolve_dispute_cancel';

/** 返金タイプ */
export type RefundPolicy = 'full_refund' | 'partial_refund' | 'no_refund' | 'none';

/** 遷移ルール */
export interface TransitionRule {
  from: QuestStatus;
  to: QuestStatus;
  action: QuestAction;
  allowedRoles: ActorRole[];
  refundPolicy: RefundPolicy;
  description: string;
}

/** 遷移ルール定義 */
const TRANSITION_RULES: TransitionRule[] = [
  {
    from: 'PENDING',
    to: 'ESCROWED',
    action: 'payment_authorized',
    allowedRoles: ['system'],
    refundPolicy: 'none',
    description: '支払いオーソリ完了 → エスクロー開始',
  },
  {
    from: 'ESCROWED',
    to: 'WORK_IN_PROGRESS',
    action: 'accept_quest',
    allowedRoles: ['adventurer'],
    refundPolicy: 'none',
    description: '冒険者がクエストを受諾',
  },
  {
    from: 'ESCROWED',
    to: 'CANCELLED',
    action: 'cancel_before_acceptance',
    allowedRoles: ['client'],
    refundPolicy: 'full_refund',
    description: '冒険者受諾前のキャンセル → 全額返金',
  },
  {
    from: 'WORK_IN_PROGRESS',
    to: 'COMPLETED',
    action: 'report_completion',
    allowedRoles: ['adventurer'],
    refundPolicy: 'none',
    description: '冒険者が作業完了を報告',
  },
  {
    from: 'WORK_IN_PROGRESS',
    to: 'CANCELLED',
    action: 'cancel_during_work',
    allowedRoles: ['client'],
    refundPolicy: 'partial_refund',
    description: '作業中キャンセル → 90%返金（10%ギルド保持）',
  },
  {
    from: 'COMPLETED',
    to: 'APPROVED',
    action: 'approve_completion',
    allowedRoles: ['client'],
    refundPolicy: 'none',
    description: '依頼者が完了を承認',
  },
  {
    from: 'COMPLETED',
    to: 'DISPUTED',
    action: 'dispute_completion',
    allowedRoles: ['client'],
    refundPolicy: 'none',
    description: '依頼者が完了に異議',
  },
  {
    from: 'APPROVED',
    to: 'DISTRIBUTED',
    action: 'distribute_payment',
    allowedRoles: ['system'],
    refundPolicy: 'none',
    description: '報酬分配実行',
  },
  {
    from: 'CANCELLED',
    to: 'REFUNDED',
    action: 'process_refund',
    allowedRoles: ['system'],
    refundPolicy: 'none',
    description: '返金処理完了',
  },
  {
    from: 'DISPUTED',
    to: 'APPROVED',
    action: 'resolve_dispute_approve',
    allowedRoles: ['client', 'system'],
    refundPolicy: 'none',
    description: '紛争解決 → 承認',
  },
  {
    from: 'DISPUTED',
    to: 'CANCELLED',
    action: 'resolve_dispute_cancel',
    allowedRoles: ['client', 'system'],
    refundPolicy: 'full_refund',
    description: '紛争解決 → キャンセル・全額返金',
  },
];

/** ステートマシンエラー */
export class QuestStateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuestStateMachineError';
  }
}

/**
 * 遷移が可能かどうかを検証する
 *
 * @param currentStatus 現在のステータス
 * @param action 実行するアクション
 * @param actorRole 実行者の役割
 * @returns 遷移ルール（不可の場合はnull）
 */
export function validateTransition(
  currentStatus: QuestStatus,
  action: QuestAction,
  actorRole: ActorRole
): TransitionRule | null {
  const rule = TRANSITION_RULES.find(
    (r) => r.from === currentStatus && r.action === action
  );

  if (!rule) return null;
  if (!rule.allowedRoles.includes(actorRole)) return null;

  return rule;
}

/**
 * 遷移を実行する（ステータスを取得）
 *
 * @param currentStatus 現在のステータス
 * @param action 実行するアクション
 * @param actorRole 実行者の役割
 * @returns 遷移先のステータス
 * @throws QuestStateMachineError 遷移が不正な場合
 */
export function executeTransition(
  currentStatus: QuestStatus,
  action: QuestAction,
  actorRole: ActorRole
): { nextStatus: QuestStatus; refundPolicy: RefundPolicy } {
  const rule = validateTransition(currentStatus, action, actorRole);

  if (!rule) {
    throw new QuestStateMachineError(
      `不正な遷移: ${currentStatus} → [${action}] (実行者: ${actorRole})`
    );
  }

  return {
    nextStatus: rule.to,
    refundPolicy: rule.refundPolicy,
  };
}

/**
 * 指定ステータスから可能なアクション一覧を取得
 *
 * @param currentStatus 現在のステータス
 * @param actorRole 実行者の役割（省略時は全アクション）
 * @returns 可能なアクションの配列
 */
export function getAvailableActions(
  currentStatus: QuestStatus,
  actorRole?: ActorRole
): TransitionRule[] {
  return TRANSITION_RULES.filter((rule) => {
    if (rule.from !== currentStatus) return false;
    if (actorRole && !rule.allowedRoles.includes(actorRole)) return false;
    return true;
  });
}

/**
 * ステータスが終了状態かどうか
 */
export function isTerminalStatus(status: QuestStatus): boolean {
  return status === 'DISTRIBUTED' || status === 'REFUNDED';
}

/**
 * ステータスが支払い関連の操作が可能かどうか
 */
export function isPaymentActionable(status: QuestStatus): boolean {
  return ['APPROVED', 'CANCELLED'].includes(status);
}
