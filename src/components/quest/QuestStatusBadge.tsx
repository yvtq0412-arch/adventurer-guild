'use client';

import type { QuestStatus } from '@/types/quest';

const STATUS_CONFIG: Record<QuestStatus, { label: string; color: string }> = {
  PENDING: { label: '支払い待ち', color: 'bg-gray-100 text-gray-600' },
  ESCROWED: { label: '募集中', color: 'bg-blue-50 text-blue-600' },
  WORK_IN_PROGRESS: { label: '作業中', color: 'bg-purple-50 text-purple-600' },
  COMPLETED: { label: '完了報告', color: 'bg-cyan-50 text-cyan-600' },
  APPROVED: { label: '承認済み', color: 'bg-emerald-50 text-emerald-600' },
  DISTRIBUTED: { label: '分配完了', color: 'bg-green-50 text-green-600' },
  CANCELLED: { label: 'キャンセル', color: 'bg-red-50 text-red-500' },
  REFUNDED: { label: '返金完了', color: 'bg-gray-100 text-gray-500' },
  DISPUTED: { label: '紛争中', color: 'bg-orange-50 text-orange-600' },
};

export function QuestStatusBadge({ status }: { status: QuestStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
