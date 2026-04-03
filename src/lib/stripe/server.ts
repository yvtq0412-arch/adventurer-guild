/**
 * Stripe Server SDK 初期化
 * サーバーサイド（API Routes）でのみ使用
 */

import Stripe from 'stripe';

/** Stripe サーバーインスタンス（遅延初期化） */
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY が設定されていません');
    }
    _stripe = new Stripe(key, {
      typescript: true,
    });
  }
  return _stripe;
}

/** 後方互換のためのエクスポート */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeServer() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default stripe;
