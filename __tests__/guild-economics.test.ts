/**
 * ギルド経済システム テスト
 * 手数料計算・分配ロジックの正確性を検証
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGuildSplit,
  calculateWithholdingTax,
  calculateEscrowBreakdown,
  validateAmount,
  GuildEconomicsError,
} from '@/lib/guild-economics';

describe('calculateGuildSplit', () => {
  it('基本的な10%分配が正しい', () => {
    const result = calculateGuildSplit(100_000);
    expect(result.guildFee).toBe(10_000);
    expect(result.adventurerReward).toBe(90_000);
  });

  it('合計が元の金額と一致する', () => {
    const amounts = [50, 100, 999, 10_000, 100_000, 1_000_000, 99_999_999];
    for (const amount of amounts) {
      const result = calculateGuildSplit(amount);
      expect(result.guildFee + result.adventurerReward).toBe(amount);
    }
  });

  it('端数処理: ギルド維持費は切り捨て', () => {
    // 333円の10% = 33.3 → 33円（切り捨て）
    const result = calculateGuildSplit(333);
    expect(result.guildFee).toBe(33);
    expect(result.adventurerReward).toBe(300);
  });

  it('端数処理: 冒険者が切り捨て分を得る', () => {
    // 101円の10% = 10.1 → 10円
    const result = calculateGuildSplit(101);
    expect(result.guildFee).toBe(10);
    expect(result.adventurerReward).toBe(91);
    // 冒険者は90.9%ではなく90.099...%を得る（実質的にギルドが負担）
  });

  it('最小金額（50円）で正しく動作する', () => {
    const result = calculateGuildSplit(50);
    expect(result.guildFee).toBe(5);
    expect(result.adventurerReward).toBe(45);
  });

  it('大きな金額で正しく動作する', () => {
    const result = calculateGuildSplit(99_999_999);
    expect(result.guildFee).toBe(9_999_999);
    expect(result.adventurerReward).toBe(90_000_000);
  });

  it('ギルド維持費が常に0以上', () => {
    const result = calculateGuildSplit(50);
    expect(result.guildFee).toBeGreaterThanOrEqual(0);
    expect(result.adventurerReward).toBeGreaterThan(0);
  });
});

describe('validateAmount', () => {
  it('正常な金額でエラーが出ない', () => {
    expect(() => validateAmount(50)).not.toThrow();
    expect(() => validateAmount(100_000)).not.toThrow();
    expect(() => validateAmount(99_999_999)).not.toThrow();
  });

  it('小数でエラーが出る（JPYは整数のみ）', () => {
    expect(() => validateAmount(100.5)).toThrow(GuildEconomicsError);
  });

  it('最小金額未満でエラーが出る', () => {
    expect(() => validateAmount(49)).toThrow(GuildEconomicsError);
    expect(() => validateAmount(0)).toThrow(GuildEconomicsError);
    expect(() => validateAmount(-100)).toThrow(GuildEconomicsError);
  });

  it('最大金額超過でエラーが出る', () => {
    expect(() => validateAmount(100_000_000)).toThrow(GuildEconomicsError);
  });
});

describe('calculateWithholdingTax', () => {
  it('100万円以下: 10.21%の源泉徴収', () => {
    // 100,000円 × 10.21% = 10,210円
    const result = calculateWithholdingTax(100_000);
    expect(result).toBe(10_210);
  });

  it('ちょうど100万円', () => {
    // 1,000,000 × 10.21% = 102,100
    const result = calculateWithholdingTax(1_000_000);
    expect(result).toBe(102_100);
  });

  it('100万円超: 段階税率', () => {
    // 1,500,000円の場合:
    // 1,000,000 × 10.21% = 102,100
    // 500,000 × 20.42% = 102,100
    // 合計 = 204,200
    const result = calculateWithholdingTax(1_500_000);
    expect(result).toBe(204_200);
  });

  it('0以下の場合は0を返す', () => {
    expect(calculateWithholdingTax(0)).toBe(0);
    expect(calculateWithholdingTax(-1000)).toBe(0);
  });

  it('小さい金額での端数処理', () => {
    // 1000円 × 10.21% = 102.1 → 102円
    const result = calculateWithholdingTax(1000);
    expect(result).toBe(102);
  });
});

describe('calculateEscrowBreakdown', () => {
  it('源泉徴収なしの完全な内訳', () => {
    const result = calculateEscrowBreakdown(100_000, false);
    expect(result.totalAmount).toBe(100_000);
    expect(result.guildFee).toBe(10_000);
    expect(result.adventurerReward).toBe(90_000);
    expect(result.withholdingTax).toBe(0);
    expect(result.netToAdventurer).toBe(90_000);
  });

  it('源泉徴収ありの完全な内訳', () => {
    const result = calculateEscrowBreakdown(100_000, true);
    expect(result.totalAmount).toBe(100_000);
    expect(result.guildFee).toBe(10_000);
    expect(result.adventurerReward).toBe(90_000);
    // 90,000 × 10.21% = 9,189
    expect(result.withholdingTax).toBe(9_189);
    expect(result.netToAdventurer).toBe(90_000 - 9_189);
  });

  it('全ての金額の合計が整合性を持つ', () => {
    const result = calculateEscrowBreakdown(500_000, true);
    // guildFee + adventurerReward = totalAmount
    expect(result.guildFee + result.adventurerReward).toBe(result.totalAmount);
    // netToAdventurer = adventurerReward - withholdingTax
    expect(result.netToAdventurer).toBe(
      result.adventurerReward - result.withholdingTax
    );
  });
});
