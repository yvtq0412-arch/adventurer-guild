/**
 * クエストステートマシン テスト
 * 状態遷移の正確性とアクセス制御を検証
 */

import { describe, it, expect } from 'vitest';
import {
  validateTransition,
  executeTransition,
  getAvailableActions,
  isTerminalStatus,
  QuestStateMachineError,
} from '@/lib/quest-state-machine';

describe('validateTransition', () => {
  it('正当な遷移を許可する', () => {
    expect(validateTransition('PENDING', 'payment_authorized', 'system')).not.toBeNull();
    expect(validateTransition('ESCROWED', 'accept_quest', 'adventurer')).not.toBeNull();
    expect(validateTransition('ESCROWED', 'cancel_before_acceptance', 'client')).not.toBeNull();
    expect(validateTransition('WORK_IN_PROGRESS', 'report_completion', 'adventurer')).not.toBeNull();
    expect(validateTransition('COMPLETED', 'approve_completion', 'client')).not.toBeNull();
    expect(validateTransition('APPROVED', 'distribute_payment', 'system')).not.toBeNull();
  });

  it('不正な遷移を拒否する', () => {
    // PENDINGからいきなりDISTRIBUTEDにはなれない
    expect(validateTransition('PENDING', 'distribute_payment', 'system')).toBeNull();
    // ESCROWEDからCOMPLETEDには飛べない
    expect(validateTransition('ESCROWED', 'report_completion', 'adventurer')).toBeNull();
  });

  it('権限のないロールを拒否する', () => {
    // 冒険者はキャンセルできない
    expect(validateTransition('ESCROWED', 'cancel_before_acceptance', 'adventurer')).toBeNull();
    // 依頼者は完了報告できない
    expect(validateTransition('WORK_IN_PROGRESS', 'report_completion', 'client')).toBeNull();
    // 依頼者は分配を実行できない（systemのみ）
    expect(validateTransition('APPROVED', 'distribute_payment', 'client')).toBeNull();
  });
});

describe('executeTransition', () => {
  it('正常な遷移で次のステータスを返す', () => {
    const result = executeTransition('ESCROWED', 'accept_quest', 'adventurer');
    expect(result.nextStatus).toBe('WORK_IN_PROGRESS');
    expect(result.refundPolicy).toBe('none');
  });

  it('キャンセル遷移で適切な返金ポリシーを返す', () => {
    // 受諾前キャンセル = 全額返金
    const beforeAcceptance = executeTransition('ESCROWED', 'cancel_before_acceptance', 'client');
    expect(beforeAcceptance.nextStatus).toBe('CANCELLED');
    expect(beforeAcceptance.refundPolicy).toBe('full_refund');

    // 作業中キャンセル = 部分返金
    const duringWork = executeTransition('WORK_IN_PROGRESS', 'cancel_during_work', 'client');
    expect(duringWork.nextStatus).toBe('CANCELLED');
    expect(duringWork.refundPolicy).toBe('partial_refund');
  });

  it('不正な遷移でエラーをスローする', () => {
    expect(() =>
      executeTransition('PENDING', 'accept_quest', 'adventurer')
    ).toThrow(QuestStateMachineError);
  });

  it('権限のないロールでエラーをスローする', () => {
    expect(() =>
      executeTransition('ESCROWED', 'cancel_before_acceptance', 'adventurer')
    ).toThrow(QuestStateMachineError);
  });
});

describe('getAvailableActions', () => {
  it('ESCROWEDステータスでの冒険者アクション', () => {
    const actions = getAvailableActions('ESCROWED', 'adventurer');
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('accept_quest');
  });

  it('ESCROWEDステータスでの依頼者アクション', () => {
    const actions = getAvailableActions('ESCROWED', 'client');
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('cancel_before_acceptance');
  });

  it('COMPLETEDステータスでの依頼者アクション', () => {
    const actions = getAvailableActions('COMPLETED', 'client');
    expect(actions).toHaveLength(2);
    const actionNames = actions.map((a) => a.action);
    expect(actionNames).toContain('approve_completion');
    expect(actionNames).toContain('dispute_completion');
  });

  it('DISTRIBUTEDステータスではアクションなし', () => {
    const actions = getAvailableActions('DISTRIBUTED');
    expect(actions).toHaveLength(0);
  });

  it('REFUNDEDステータスではアクションなし', () => {
    const actions = getAvailableActions('REFUNDED');
    expect(actions).toHaveLength(0);
  });
});

describe('isTerminalStatus', () => {
  it('終了ステータスを正しく判定', () => {
    expect(isTerminalStatus('DISTRIBUTED')).toBe(true);
    expect(isTerminalStatus('REFUNDED')).toBe(true);
  });

  it('非終了ステータスを正しく判定', () => {
    expect(isTerminalStatus('PENDING')).toBe(false);
    expect(isTerminalStatus('ESCROWED')).toBe(false);
    expect(isTerminalStatus('WORK_IN_PROGRESS')).toBe(false);
    expect(isTerminalStatus('COMPLETED')).toBe(false);
    expect(isTerminalStatus('APPROVED')).toBe(false);
    expect(isTerminalStatus('CANCELLED')).toBe(false);
    expect(isTerminalStatus('DISPUTED')).toBe(false);
  });
});

describe('完全なフロー遷移テスト', () => {
  it('正常フロー: PENDING → ESCROWED → WIP → COMPLETED → APPROVED → DISTRIBUTED', () => {
    let status = executeTransition('PENDING', 'payment_authorized', 'system');
    expect(status.nextStatus).toBe('ESCROWED');

    status = executeTransition('ESCROWED', 'accept_quest', 'adventurer');
    expect(status.nextStatus).toBe('WORK_IN_PROGRESS');

    status = executeTransition('WORK_IN_PROGRESS', 'report_completion', 'adventurer');
    expect(status.nextStatus).toBe('COMPLETED');

    status = executeTransition('COMPLETED', 'approve_completion', 'client');
    expect(status.nextStatus).toBe('APPROVED');

    status = executeTransition('APPROVED', 'distribute_payment', 'system');
    expect(status.nextStatus).toBe('DISTRIBUTED');
  });

  it('キャンセルフロー: ESCROWED → CANCELLED → REFUNDED', () => {
    const cancel = executeTransition('ESCROWED', 'cancel_before_acceptance', 'client');
    expect(cancel.nextStatus).toBe('CANCELLED');
    expect(cancel.refundPolicy).toBe('full_refund');

    const refund = executeTransition('CANCELLED', 'process_refund', 'system');
    expect(refund.nextStatus).toBe('REFUNDED');
  });

  it('紛争フロー: COMPLETED → DISPUTED → APPROVED → DISTRIBUTED', () => {
    const dispute = executeTransition('COMPLETED', 'dispute_completion', 'client');
    expect(dispute.nextStatus).toBe('DISPUTED');

    const resolve = executeTransition('DISPUTED', 'resolve_dispute_approve', 'system');
    expect(resolve.nextStatus).toBe('APPROVED');

    const distribute = executeTransition('APPROVED', 'distribute_payment', 'system');
    expect(distribute.nextStatus).toBe('DISTRIBUTED');
  });
});
