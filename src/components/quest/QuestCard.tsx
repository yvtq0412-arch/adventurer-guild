'use client';

import Link from 'next/link';
import { QuestStatusBadge } from './QuestStatusBadge';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { getQuestCategoryInfo } from '@/constants/quest-categories';
import type { Quest } from '@/types/quest';

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const categoryInfo = getQuestCategoryInfo(quest.category);

  return (
    <Link href={`/quests/${quest.questId}`}>
      <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-5 hover:border-amber-600/50 hover:bg-stone-800/80 transition-all cursor-pointer">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryInfo?.icon || '📋'}</span>
            <span className="text-xs text-stone-500 bg-stone-700/50 px-2 py-0.5 rounded">
              {categoryInfo?.label || quest.category}
            </span>
          </div>
          <QuestStatusBadge status={quest.status} />
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
          {quest.title}
        </h3>

        {/* 説明 */}
        <p className="text-sm text-stone-400 mb-4 line-clamp-2">
          {quest.description}
        </p>

        {/* 報酬 */}
        <PaymentBreakdown totalAmount={quest.totalAmount} compact />
      </div>
    </Link>
  );
}
