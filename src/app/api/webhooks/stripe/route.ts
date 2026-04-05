/**
 * Stripe Webhook エンドポイント
 * POST /api/webhooks/stripe
 *
 * Stripe から送信される各種イベントを受信し処理する。
 * 署名検証を必ず行い、不正なリクエストを拒否する。
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import {
  handlePaymentIntentCapturable,
  handlePaymentIntentSucceeded,
  handleTransferCreated,
  handleChargeRefunded,
  handleAccountUpdated,
  handleDisputeCreated,
  handleIdentityVerified,
  handleIdentityFailed,
} from '@/lib/stripe/webhooks';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Stripe署名が見つかりません' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] 署名検証失敗: ${message}`);
    return NextResponse.json(
      { error: `Webhook署名検証失敗: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.amount_capturable_updated':
        await handlePaymentIntentCapturable(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityFailed(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;

      default:
        console.log(`[Webhook] 未処理のイベント: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] イベント処理エラー (${event.type}): ${message}`);
    // Stripe に 200 を返して再送を防ぐ（エラーは内部で処理）
  }

  return NextResponse.json({ received: true });
}
