'use client';

import { calculateEscrowBreakdown } from '@/lib/guild-economics';

interface PaymentBreakdownProps {
  totalAmount: number;
  isWithholdingApplicable?: boolean;
  compact?: boolean;
}

export function PaymentBreakdown({ totalAmount, isWithholdingApplicable = false, compact = false }: PaymentBreakdownProps) {
  const breakdown = calculateEscrowBreakdown(totalAmount, isWithholdingApplicable);
  const formatYen = (amount: number) => `¥${amount.toLocaleString()}`;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-gray-900">{formatYen(breakdown.totalAmount)}</span>
        <span className="text-gray-300">|</span>
        <span className="text-emerald-600">{formatYen(breakdown.adventurerReward)}</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-400">{formatYen(breakdown.guildFee)}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">報酬内訳</h3>
      <div className="flex h-2 rounded-full overflow-hidden mb-4">
        <div className="bg-emerald-500" style={{ width: '90%' }} />
        <div className="bg-indigo-500" style={{ width: '10%' }} />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">依頼総額</span>
          <span className="text-lg font-bold text-gray-900">{formatYen(breakdown.totalAmount)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />ワーカー報酬 (90%)
          </span>
          <span className="text-emerald-600 font-semibold">{formatYen(breakdown.adventurerReward)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />手数料 (10%)
          </span>
          <span className="text-indigo-600 font-semibold">{formatYen(breakdown.guildFee)}</span>
        </div>
        {isWithholdingApplicable && breakdown.withholdingTax > 0 && (
          <>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">源泉徴収税額</span>
              <span className="text-red-500">-{formatYen(breakdown.withholdingTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">手取り額</span>
              <span className="text-emerald-600 font-bold">{formatYen(breakdown.netToAdventurer)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
