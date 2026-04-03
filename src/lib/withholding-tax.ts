/**
 * 源泉徴収計算 - Withholding Tax Calculator
 *
 * 所得税法第204条に基づく報酬に対する源泉徴収税を計算する
 *
 * 対象報酬: デザイン、ライティング、コンサルティング、翻訳、撮影、動画制作
 * 税率:
 *   - 100万円以下: 10.21%
 *   - 100万円超:   100万 × 10.21% + (超過分 × 20.42%)
 */

import { WITHHOLDING_TAX } from '@/constants/guild-config';
import { isWithholdingRequired } from '@/constants/quest-categories';
import type { QuestCategory } from '@/types/quest';

/** 源泉徴収計算結果 */
export interface WithholdingTaxResult {
  /** 源泉徴収対象かどうか */
  isApplicable: boolean;
  /** 源泉徴収税額 */
  taxAmount: number;
  /** 適用税率（表示用） */
  appliedRate: string;
  /** 税引後の冒険者報酬 */
  netReward: number;
}

/**
 * 源泉徴収税を計算する
 *
 * @param adventurerReward 冒険者報酬（ギルド維持費控除後）
 * @param category クエストカテゴリ
 * @returns 源泉徴収計算結果
 */
export function calculateWithholdingForQuest(
  adventurerReward: number,
  category: QuestCategory
): WithholdingTaxResult {
  const isApplicable = isWithholdingRequired(category);

  if (!isApplicable || adventurerReward <= 0) {
    return {
      isApplicable: false,
      taxAmount: 0,
      appliedRate: '0%',
      netReward: adventurerReward,
    };
  }

  const { standardRate, elevatedRate, threshold } = WITHHOLDING_TAX;

  let taxAmount: number;
  let appliedRate: string;

  if (adventurerReward <= threshold) {
    taxAmount = Math.floor(adventurerReward * standardRate);
    appliedRate = `${(standardRate * 100).toFixed(2)}%`;
  } else {
    const standardPortion = Math.floor(threshold * standardRate);
    const elevatedPortion = Math.floor(
      (adventurerReward - threshold) * elevatedRate
    );
    taxAmount = standardPortion + elevatedPortion;
    appliedRate = `${(standardRate * 100).toFixed(2)}% / ${(elevatedRate * 100).toFixed(2)}%`;
  }

  return {
    isApplicable: true,
    taxAmount,
    appliedRate,
    netReward: adventurerReward - taxAmount,
  };
}
