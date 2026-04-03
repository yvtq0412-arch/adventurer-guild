'use client';

import type { QuestStatus } from '@/types/quest';

const STATUS_CONFIG: Record<QuestStatus, { label: string; color: string }> = {
  PENDING: { label: '支払い待ち', color: 'bg-stone-600 text-stone-200' },
  ESCROWED: { label: '冒険者募集中', color: 'bg-blue-600 text-blue-100' },
  WORK_IN_PROGRESS: { label: '作業中', color: 'bg-purple-600 text-purple-100' },
  COMPLETED: { label: '完了報告', color: 'bg-cyan-600 text-cyan-100' },
  APPROVED: { label: '承認済み', color: 'bg-green-600 text-green-100' },
  DISTRIBUTED: { label: '報酬分配完了', color: 'bg-emerald-600 text-emerald-100' },
  CANCELLED: { label: 'キャンセル', color: 'bg-red-600/50 text-red-200' },
  REFUNDED: { label: '返金完了', color: 'bg-stone-600 text-stone-300' },
  DISPUTED: { label: '紛争中', color: 'bg-orange-600 text-orange-100' },
};

export function QuestStatusBadge({ status }: { status: QuestStatus }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-stone-600 text-stone-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
