/**
 * インボイス生成 - Invoice Generator
 *
 * 適格請求書（インボイス）のデータ生成
 * PDF生成は別途 @react-pdf/renderer で行う
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  GUILD_NAME,
  INVOICE_NUMBER_PREFIX,
  CONSUMPTION_TAX_RATE,
} from '@/constants/guild-config';
import type { GuildInvoice, InvoiceBreakdown } from '@/types/invoice';

/**
 * インボイス番号を生成する (GLD-YYYY-NNNNNN)
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = adminDb.collection('guild_config').doc('invoice_counter');

  const newNumber = await adminDb.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let currentNumber = 0;
    let currentYear = year;

    if (counterDoc.exists) {
      const data = counterDoc.data()!;
      currentYear = data.year;
      currentNumber = data.number;

      // 年が変わったらリセット
      if (currentYear !== year) {
        currentNumber = 0;
      }
    }

    const nextNumber = currentNumber + 1;

    transaction.set(counterRef, {
      year,
      number: nextNumber,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return nextNumber;
  });

  const paddedNumber = String(newNumber).padStart(6, '0');
  return `${INVOICE_NUMBER_PREFIX}-${year}-${paddedNumber}`;
}

/**
 * 金額内訳を計算する
 */
function calculateBreakdown(
  totalAmount: number,
  guildFee: number,
  adventurerReward: number,
  withholdingTaxAmount: number
): InvoiceBreakdown {
  // ギルド維持費に含まれる消費税を計算
  // ギルド維持費 = 税込金額として、消費税を内税で計算
  const guildFeeExcludingTax = Math.floor(guildFee / (1 + CONSUMPTION_TAX_RATE));
  const consumptionTaxAmount = guildFee - guildFeeExcludingTax;

  return {
    totalAmountIncludingTax: totalAmount,
    totalAmountExcludingTax: totalAmount - consumptionTaxAmount,
    consumptionTaxAmount,
    consumptionTaxRate: CONSUMPTION_TAX_RATE,
    guildFeeAmount: guildFee,
    adventurerRewardAmount: adventurerReward,
    withholdingTaxAmount,
    netPaymentAmount: adventurerReward - withholdingTaxAmount,
  };
}

/**
 * クエスト完了後にインボイスを生成する
 *
 * @param questId クエストID
 * @param transactionId トランザクションID
 * @returns 生成されたインボイスID
 */
export async function generateInvoice(
  questId: string,
  transactionId: string
): Promise<string> {
  const questDoc = await adminDb.collection('quests').doc(questId).get();
  if (!questDoc.exists) {
    throw new Error(`クエストが見つかりません: ${questId}`);
  }

  const quest = questDoc.data()!;

  // 依頼者情報
  const clientDoc = await adminDb.collection('users').doc(quest.clientId).get();
  const client = clientDoc.data()!;

  // インボイス番号生成
  const invoiceNumber = await generateInvoiceNumber();

  // 金額内訳
  const breakdown = calculateBreakdown(
    quest.totalAmount,
    quest.guildFee,
    quest.adventurerReward,
    quest.withholdingTaxAmount || 0
  );

  // ギルドの登録番号
  const guildTaxRegNumber =
    process.env.GUILD_TAX_REGISTRATION_NUMBER || 'T0000000000000';

  const invoiceRef = adminDb.collection('invoices').doc();
  const invoiceData: Omit<GuildInvoice, 'createdAt' | 'updatedAt' | 'issueDate'> & {
    createdAt: FieldValue;
    updatedAt: FieldValue;
    issueDate: FieldValue;
  } = {
    invoiceId: invoiceRef.id,
    invoiceNumber,
    questId,
    transactionId,
    issuerId: 'guild_master',
    recipientId: quest.clientId,
    issuerName: GUILD_NAME,
    issuerTaxRegistrationNumber: guildTaxRegNumber,
    issueDate: FieldValue.serverTimestamp(),
    transactionDescription: `クエスト: ${quest.title} (${quest.category})`,
    breakdown,
    isWithholdingApplicable: (quest.withholdingTaxAmount || 0) > 0,
    withholdingTaxRate: (quest.withholdingTaxAmount || 0) > 0 ? 0.1021 : undefined,
    status: 'issued',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await invoiceRef.set(invoiceData);

  return invoiceRef.id;
}
