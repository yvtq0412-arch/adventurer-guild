/**
 * Stripe Webhook イベントハンドラ
 * 各種 Stripe イベントを処理し、Firestore を更新する
 */

import type Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * payment_intent.amount_capturable_updated
 * オーソリホールドが成功した時に呼ばれる
 * → クエストステータスを PENDING → ESCROWED に変更
 */
export async function handlePaymentIntentCapturable(
  paymentIntent: Stripe.PaymentIntent
) {
  const questId = paymentIntent.metadata.questId;
  if (!questId) return;

  const questRef = adminDb.collection('quests').doc(questId);

  await adminDb.runTransaction(async (transaction) => {
    const questDoc = await transaction.get(questRef);
    if (!questDoc.exists) return;

    const quest = questDoc.data()!;

    // 冪等性: 既にESCROWED以降ならスキップ
    if (quest.status !== 'PENDING') return;

    transaction.update(questRef, {
      status: 'ESCROWED',
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        from: 'PENDING',
        to: 'ESCROWED',
        changedBy: 'system',
        changedAt: new Date(),
        reason: 'エスクロー（仮払い）完了',
      }),
    });
  });
}

/**
 * payment_intent.succeeded
 * キャプチャが成功した時に呼ばれる
 * → トランザクションレコードの確認
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const questId = paymentIntent.metadata.questId;
  if (!questId) return;

  // captureAndDistribute で既に処理されているため、
  // ここでは確認ログのみ
  console.log(`[Webhook] PaymentIntent succeeded for quest: ${questId}`);
}

/**
 * transfer.created
 * Transfer が作成された時に呼ばれる
 * → 冒険者への送金確認
 */
export async function handleTransferCreated(transfer: Stripe.Transfer) {
  const questId = transfer.metadata?.questId;
  if (!questId) return;

  console.log(
    `[Webhook] Transfer created for quest: ${questId}, amount: ${transfer.amount} JPY`
  );
}

/**
 * charge.refunded
 * 返金が処理された時に呼ばれる
 * → CANCELLED → REFUNDED に変更
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  // PaymentIntentから対応するクエストを検索
  const questsSnapshot = await adminDb
    .collection('quests')
    .where('paymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();

  if (questsSnapshot.empty) return;

  const questDoc = questsSnapshot.docs[0];
  const quest = questDoc.data();

  if (quest.status === 'CANCELLED') {
    await questDoc.ref.update({
      status: 'REFUNDED',
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        from: 'CANCELLED',
        to: 'REFUNDED',
        changedBy: 'system',
        changedAt: new Date(),
        reason: '返金処理完了',
      }),
    });
  }
}

/**
 * account.updated
 * Express アカウントのオンボーディング状態が変更された時
 */
export async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.userId;
  if (!userId) return;

  const isComplete = account.details_submitted ?? false;
  const chargesEnabled = account.charges_enabled ?? false;
  const payoutsEnabled = account.payouts_enabled ?? false;

  await adminDb.collection('users').doc(userId).update({
    stripeOnboardingComplete: isComplete && chargesEnabled && payoutsEnabled,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * identity.verification_session.verified
 * 本人確認が完了した時
 * → identityStatus を 'verified' に更新
 */
export async function handleIdentityVerified(
  session: Stripe.Identity.VerificationSession
) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await adminDb.collection('users').doc(userId).update({
    identityStatus: 'verified',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`[Identity] 本人確認完了: userId=${userId}`);
}

/**
 * identity.verification_session.requires_input
 * 書類不備・再提出が必要な時
 * → identityStatus を 'failed' に更新
 */
export async function handleIdentityFailed(
  session: Stripe.Identity.VerificationSession
) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await adminDb.collection('users').doc(userId).update({
    identityStatus: 'failed',
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`[Identity] 本人確認失敗: userId=${userId}`);
}

/**
 * charge.dispute.created
 * チャージバック（紛争）が発生した時
 */
export async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const chargeId =
    typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;

  if (!chargeId) return;

  const questsSnapshot = await adminDb
    .collection('quests')
    .where('chargeId', '==', chargeId)
    .limit(1)
    .get();

  if (questsSnapshot.empty) return;

  const questDoc = questsSnapshot.docs[0];

  await questDoc.ref.update({
    status: 'DISPUTED',
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      from: questDoc.data().status,
      to: 'DISPUTED',
      changedBy: 'system',
      changedAt: new Date(),
      reason: `Stripeチャージバック: ${dispute.reason}`,
    }),
  });
}
