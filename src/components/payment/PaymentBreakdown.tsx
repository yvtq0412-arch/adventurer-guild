'use client';

import { calculateEscrowBreakdown } from '@/lib/guild-economics';

interface PaymentBreakdownProps {
  totalAmount: number;
  isWithholdingApplicable?: boolean;
  compact?: boolean;
}

/**
 * 決済内訳表示コンポーネント
 * ギルド維持費（10%）と冒険者報酬（90%）の分配を視覚的に表示
 */
export function PaymentBreakdown({
  totalAmount,
  isWithholdingApplicable = false,
  compact = false,
}: PaymentBreakdownProps) {
  const breakdown = calculateEscrowBreakdown(totalAmount, isWithholdingApplicable);

  const formatYen = (amount: number) =>
    `¥${amount.toLocaleString()}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-stone-400">総額</span>
        <span className="font-bold text-amber-400">
          {formatYen(breakdown.totalAmount)}
        </span>
        <span className="text-stone-600">|</span>
        <span className="text-stone-400">報酬</span>
        <span className="text-green-400">
          {formatYen(breakdown.adventurerReward)}
        </span>
        <span className="text-stone-600">|</span>
        <span className="text-stone-400">維持費</span>
        <span className="text-stone-500">
          {formatYen(breakdown.guildFee)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
      <h3 className="text-lg font-semibold text-amber-400 mb-4">
        報酬分配内訳
      </h3>

      {/* 視覚的なバー */}
      <div className="flex h-4 rounded-full overflow-hidden mb-4">
        <div
          className="bg-green-500"
          style={{ width: '90%' }}
          title="冒険者報酬 (90%)"
        />
        <div
          className="bg-amber-600"
          style={{ width: '10%' }}
          title="ギルド維持費 (10%)"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-stone-400">依頼総額</span>
          <span className="text-xl font-bold text-white">
            {formatYen(breakdown.totalAmount)}
          </span>
        </div>

        <div className="border-t border-stone-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-stone-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              冒険者報酬 (90%)
            </span>
            <span className="text-green-400 font-semibold">
              {formatYen(breakdown.adventurerReward)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            ギルド維持費 (10%)
          </span>
          <span className="text-amber-400 font-semibold">
            {formatYen(breakdown.guildFee)}
          </span>
        </div>

        {isWithholdingApplicable && breakdown.withholdingTax > 0 && (
          <>
            <div className="border-t border-stone-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">源泉徴収税額</span>
                <span className="text-red-400">
                  -{formatYen(breakdown.withholdingTax)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400 font-medium">
                冒険者手取り額
              </span>
              <span className="text-green-300 font-bold">
                {formatYen(breakdown.netToAdventurer)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
