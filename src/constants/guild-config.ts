/**
 * ギルド設定 - Guild Configuration
 * 冒険者ギルドの運営パラメータ
 */

/** ギルド維持費率 (15%) - 基本手数料率。ランクにより10%〜15%で変動。 */
export const GUILD_TAX_RATE = 0.15;

/** ギルド名 */
export const GUILD_NAME = '冒険者ギルド';

/** 最低依頼金額（JPY） - Stripeの最低チャージ額 */
export const MIN_QUEST_AMOUNT = 50;

/** 最大依頼金額（JPY） */
export const MAX_QUEST_AMOUNT = 99_999_999;

/** 通貨 */
export const CURRENCY = 'jpy' as const;

/** 源泉徴収税率設定 */
export const WITHHOLDING_TAX = {
  /** 100万円以下の税率 */
  standardRate: 0.1021,
  /** 100万円超の税率 */
  elevatedRate: 0.2042,
  /** 税率切替閾値（100万円） */
  threshold: 1_000_000,
} as const;

/** 消費税率 */
export const CONSUMPTION_TAX_RATE = 0.10;

/** インボイス番号プレフィックス */
export const INVOICE_NUMBER_PREFIX = 'GLD';

/**
 * オーソリホールドの有効期限
 * 短期クエスト（7日以内）: manual capture
 * 長期クエスト（7日超）: automatic capture + delayed transfer
 */
export const AUTH_HOLD_EXPIRY_DAYS = 7;

/** Stripe Connect アカウントタイプ */
export const STRIPE_ACCOUNT_TYPE = 'express' as const;
