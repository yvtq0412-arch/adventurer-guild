'use client';

import Link from 'next/link';
import { QuestStatusBadge } from './QuestStatusBadge';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { getQuestCategoryInfo } from '@/constants/quest-categories';
import type { Quest } from '@/types/quest';

export function QuestCard({ quest }: { quest: Quest }) {
  const categoryInfo = getQuestCategoryInfo(quest.category);

  return (
    <Link href={`/quests/${quest.questId}`}>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
            {categoryInfo?.icon} {categoryInfo?.label || quest.category}
          </span>
          <QuestStatusBadge status={quest.status} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{quest.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{quest.description}</p>
        <PaymentBreakdown totalAmount={quest.totalAmount} compact />
      </div>
    </Link>
  );
}
