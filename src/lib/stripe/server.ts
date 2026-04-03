/**
 * Stripe Server SDK 初期化
 * サーバーサイド（API Routes）でのみ使用
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY が設定されていません');
}

/** Stripe サーバーインスタンス */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

export default stripe;
