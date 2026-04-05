/**
 * ギルド経済システム - Guild Economics
 *
 * 冒険者ギルドの手数料計算・分配ロジック
 * - ギルド維持費: 15%（基本、ランクにより10%〜15%で変動、切り捨て）
 * - 冒険者報酬: 85%〜90%（残額）
 * - 全額JPY整数（小数なし）
 */

import {
  GUILD_TAX_RATE,
  WITHHOLDING_TAX,
  MIN_QUEST_AMOUNT,
  MAX_QUEST_AMOUNT,
} from '@/constants/guild-config';
import type { EscrowVaultBreakdown } from '@/types/payment';

/** ギルド経済計算エラー */
export class GuildEconomicsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuildEconomicsError';
  }
}

/** 手数料分配結果 */
export interface GuildSplit {
  /** ギルド維持費 (15%〜10%) */
  guildFee: number;
  /** 冒険者報酬 (85%〜90%) */
  adventurerReward: number;
}

/**
 * ギルド維持費と冒険者報酬を計算する
 *
 * 端数処理方針:
 *   ギルド維持費 = Math.floor(totalAmount * 0.1)
 *   → 1円未満はギルドが負担（切り捨て）
 *   → 冒険者が常に公平以上の報酬を受け取る
 *
 * @param totalAmount 依頼総額（JPY整数、依頼者が支払う額）
 * @returns ギルド維持費と冒険者報酬
 */
export function calculateGuildSplit(totalAmount: number): GuildSplit {
  validateAmount(totalAmount);

  const guildFee = Math.floor(totalAmount * GUILD_TAX_RATE);
  const adventurerReward = totalAmount - guildFee;

  return { guildFee, adventurerReward };
}

/**
 * 源泉徴収税額を計算する
 *
 * 所得税法第204条に基づく源泉徴収:
 *   - 100万円以下: 報酬 × 10.21%
 *   - 100万円超:   100万 × 10.21% + (報酬 - 100万) × 20.42%
 *
 * 端数処理: 切り捨て（1円未満切捨）
 *
 * @param adventurerReward 冒険者報酬（ギルド維持費控除後）
 * @returns 源泉徴収税額
 */
export function calculateWithholdingTax(adventurerReward: number): number {
  if (adventurerReward <= 0) return 0;

  const { standardRate, elevatedRate, threshold } = WITHHOLDING_TAX;

  if (adventurerReward <= threshold) {
    return Math.floor(adventurerReward * standardRate);
  }

  const standardPortion = Math.floor(threshold * standardRate);
  const elevatedPortion = Math.floor((adventurerReward - threshold) * elevatedRate);
  return standardPortion + elevatedPortion;
}

/**
 * エスクロー金庫の完全な分配内訳を計算する
 *
 * @param totalAmount 依頼総額
 * @param isWithholdingApplicable 源泉徴収対象かどうか
 * @returns エスクロー金庫の分配内訳
 */
export function calculateEscrowBreakdown(
  totalAmount: number,
  isWithholdingApplicable: boolean
): EscrowVaultBreakdown {
  const { guildFee, adventurerReward } = calculateGuildSplit(totalAmount);

  const withholdingTax = isWithholdingApplicable
    ? calculateWithholdingTax(adventurerReward)
    : 0;

  const netToAdventurer = adventurerReward - withholdingTax;

  return {
    totalAmount,
    guildFee,
    adventurerReward,
    withholdingTax,
    netToAdventurer,
  };
}

/**
 * 金額のバリデーション
 *
 * @param amount 金額（JPY）
 * @throws GuildEconomicsError 不正な金額の場合
 */
export function validateAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new GuildEconomicsError(
      `金額は整数でなければなりません（JPYは小数を持ちません）: ${amount}`
    );
  }
  if (amount < MIN_QUEST_AMOUNT) {
    throw new GuildEconomicsError(
      `依頼金額は最低${MIN_QUEST_AMOUNT}円以上必要です: ${amount}円`
    );
  }
  if (amount > MAX_QUEST_AMOUNT) {
    throw new GuildEconomicsError(
      `依頼金額は最大${MAX_QUEST_AMOUNT.toLocaleString()}円までです: ${amount}円`
    );
  }
}
