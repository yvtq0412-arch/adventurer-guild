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
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{quest.title}</h3>
        {quest.prefecture && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {quest.prefecture} {quest.city}
          </div>
        )}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{quest.description}</p>
        <PaymentBreakdown totalAmount={quest.totalAmount} compact />
      </div>
    </Link>
  );
}
