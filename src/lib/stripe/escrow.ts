/**
 * エスクロー金庫 - Escrow Vault
 *
 * Stripe PaymentIntent を使ったエスクロー決済の管理
 * - 仮払い（オーソリホールド）
 * - キャプチャ（確定）
 * - 分配（Transfer）
 * - 返金
 */

import { stripe } from './server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateGuildSplit } from '@/lib/guild-economics';
import { FieldValue } from 'firebase-admin/firestore';
import type { RefundResult } from '@/types/payment';

/**
 * エスクロー（仮払い）を作成する
 *
 * PaymentIntent を manual capture で作成し、
 * 依頼者のカードにオーソリホールドをかける。
 * この時点では冒険者は未定のため、transfer_data は設定しない。
 *
 * @param questId クエストID
 * @param totalAmount 依頼総額（JPY整数）
 * @param customerId Stripe Customer ID（依頼者）
 * @returns PaymentIntent の client_secret と ID
 */
export async function createEscrowHold(
  questId: string,
  totalAmount: number,
  customerId: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const { guildFee, adventurerReward } = calculateGuildSplit(totalAmount);

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: totalAmount,
      currency: 'jpy',
      customer: customerId,
      capture_method: 'manual',
      metadata: {
        questId,
        guildFee: guildFee.toString(),
        adventurerReward: adventurerReward.toString(),
        platform: 'adventurer_guild',
      },
      description: `冒険者ギルド - クエスト報酬 (${questId})`,
    },
    {
      idempotencyKey: `escrow_${questId}`,
    }
  );

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * エスクローをキャプチャし、冒険者に報酬を分配する
 *
 * 1. PaymentIntent をキャプチャ（確定）
 * 2. Transfer で冒険者の Connected Account に送金
 *
 * Firestoreトランザクション内で冪等に実行する
 *
 * @param questId クエストID
 * @returns chargeId と transferId
 */
export async function captureAndDistribute(questId: string): Promise<{
  chargeId: string;
  transferId: string;
}> {
  // Firestore トランザクションで冪等性を確保
  return await adminDb.runTransaction(async (transaction) => {
    const questRef = adminDb.collection('quests').doc(questId);
    const questDoc = await transaction.get(questRef);

    if (!questDoc.exists) {
      throw new Error(`クエストが見つかりません: ${questId}`);
    }

    const quest = questDoc.data()!;

    // 冪等性チェック: 既に分配済みならスキップ
    if (quest.transferId) {
      return {
        chargeId: quest.chargeId,
        transferId: quest.transferId,
      };
    }

    if (quest.status !== 'APPROVED') {
      throw new Error(`クエストのステータスが不正です: ${quest.status}（APPROVEDが必要）`);
    }

    if (!quest.adventurerId) {
      throw new Error('冒険者が割り当てられていません');
    }

    // 冒険者の Stripe Connect アカウントIDを取得
    const adventurerDoc = await transaction.get(
      adminDb.collection('users').doc(quest.adventurerId)
    );
    const adventurerStripeAccountId = adventurerDoc.data()?.stripeConnectAccountId;

    if (!adventurerStripeAccountId) {
      throw new Error('冒険者の Stripe Connect アカウントが設定されていません');
    }

    // 1. PaymentIntent をキャプチャ
    const captured = await stripe.paymentIntents.capture(
      quest.paymentIntentId,
      undefined,
      { idempotencyKey: `capture_${questId}` }
    );

    const chargeId = captured.latest_charge as string;

    // 2. Transfer で冒険者に送金
    const transfer = await stripe.transfers.create(
      {
        amount: quest.adventurerReward,
        currency: 'jpy',
        destination: adventurerStripeAccountId,
        source_transaction: chargeId,
        metadata: {
          questId,
          platform: 'adventurer_guild',
        },
        description: `クエスト報酬 - ${quest.title}`,
      },
      { idempotencyKey: `transfer_${questId}` }
    );

    // 3. Firestoreを更新
    transaction.update(questRef, {
      status: 'DISTRIBUTED',
      chargeId,
      transferId: transfer.id,
      distributedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        from: 'APPROVED',
        to: 'DISTRIBUTED',
        changedBy: 'system',
        changedAt: new Date(),
        reason: '報酬分配完了',
      }),
    });

    // 4. トランザクションレコード作成
    const txRef = adminDb.collection('transactions').doc();
    transaction.set(txRef, {
      transactionId: txRef.id,
      questId,
      type: 'distribution',
      totalAmount: quest.totalAmount,
      guildFeeAmount: quest.guildFee,
      adventurerRewardAmount: quest.adventurerReward,
      withholdingTaxAmount: quest.withholdingTaxAmount || 0,
      stripeFeeAmount: 0,
      paymentIntentId: quest.paymentIntentId,
      chargeId,
      transferId: transfer.id,
      clientId: quest.clientId,
      adventurerId: quest.adventurerId,
      status: 'succeeded',
      idempotencyKey: `distribute_${questId}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { chargeId, transferId: transfer.id };
  });
}

/**
 * クエストをキャンセルし返金する
 *
 * ESCROWEDステータス: 全額返金（PaymentIntentキャンセル）
 * WORK_IN_PROGRESSステータス: 部分返金（90%返金、10%ギルド保持）
 *
 * @param questId クエストID
 * @param refundPolicy 返金ポリシー
 * @returns 返金結果
 */
export async function cancelAndRefund(
  questId: string,
  refundPolicy: 'full_refund' | 'partial_refund'
): Promise<RefundResult> {
  return await adminDb.runTransaction(async (transaction) => {
    const questRef = adminDb.collection('quests').doc(questId);
    const questDoc = await transaction.get(questRef);

    if (!questDoc.exists) {
      throw new Error(`クエストが見つかりません: ${questId}`);
    }

    const quest = questDoc.data()!;

    // 冪等性チェック
    if (quest.refundId) {
      return {
        refundType: refundPolicy === 'full_refund' ? 'full' : 'partial',
        refundAmount: refundPolicy === 'full_refund' ? quest.totalAmount : quest.adventurerReward,
        retainedAmount: refundPolicy === 'full_refund' ? 0 : quest.guildFee,
        refundId: quest.refundId,
      } as RefundResult;
    }

    let refundId: string;
    let refundAmount: number;
    let retainedAmount: number;

    if (refundPolicy === 'full_refund') {
      // 全額返金: PaymentIntent をキャンセル（オーソリ解除）
      await stripe.paymentIntents.cancel(
        quest.paymentIntentId,
        undefined,
        { idempotencyKey: `cancel_${questId}` }
      );
      refundId = `cancel_${quest.paymentIntentId}`;
      refundAmount = quest.totalAmount;
      retainedAmount = 0;
    } else {
      // 部分返金: まずキャプチャしてからリファンド
      const captured = await stripe.paymentIntents.capture(
        quest.paymentIntentId,
        undefined,
        { idempotencyKey: `capture_cancel_${questId}` }
      );

      const refund = await stripe.refunds.create(
        {
          payment_intent: quest.paymentIntentId,
          amount: quest.adventurerReward, // 90%を返金
          metadata: {
            questId,
            reason: 'quest_cancelled_during_work',
          },
        },
        { idempotencyKey: `refund_${questId}` }
      );

      refundId = refund.id;
      refundAmount = quest.adventurerReward;
      retainedAmount = quest.guildFee;
    }

    // Firestoreを更新
    transaction.update(questRef, {
      status: 'CANCELLED',
      refundId,
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        from: quest.status,
        to: 'CANCELLED',
        changedBy: 'system',
        changedAt: new Date(),
        reason: refundPolicy === 'full_refund'
          ? '全額返金（冒険者受諾前キャンセル）'
          : '部分返金（作業中キャンセル、ギルド維持費10%保持）',
      }),
    });

    // トランザクションレコード
    const txRef = adminDb.collection('transactions').doc();
    transaction.set(txRef, {
      transactionId: txRef.id,
      questId,
      type: refundPolicy === 'full_refund' ? 'refund_full' : 'refund_partial',
      totalAmount: quest.totalAmount,
      guildFeeAmount: retainedAmount,
      adventurerRewardAmount: 0,
      withholdingTaxAmount: 0,
      stripeFeeAmount: 0,
      paymentIntentId: quest.paymentIntentId,
      refundId,
      clientId: quest.clientId,
      adventurerId: quest.adventurerId || null,
      status: 'refunded',
      idempotencyKey: `refund_tx_${questId}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      refundType: refundPolicy === 'full_refund' ? 'full' : 'partial',
      refundAmount,
      retainedAmount,
      refundId,
    } as RefundResult;
  });
}
