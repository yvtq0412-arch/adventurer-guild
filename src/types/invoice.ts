import { Timestamp } from 'firebase/firestore';

/** インボイスステータス */
export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'paid' | 'voided';

/** 金額内訳（適格請求書対応） */
export interface InvoiceBreakdown {
  /** 税込合計額 */
  totalAmountIncludingTax: number;
  /** 税抜合計額 */
  totalAmountExcludingTax: number;
  /** 消費税額 */
  consumptionTaxAmount: number;
  /** 消費税率 */
  consumptionTaxRate: number;
  /** ギルド維持費 */
  guildFeeAmount: number;
  /** 冒険者報酬 */
  adventurerRewardAmount: number;
  /** 源泉徴収税額 */
  withholdingTaxAmount: number;
  /** 差引支払額 */
  netPaymentAmount: number;
}

/** ギルドインボイス（適格請求書） */
export interface GuildInvoice {
  invoiceId: string;
  /** 請求書番号 (GLD-YYYY-NNNNNN) */
  invoiceNumber: string;
  questId: string;
  transactionId: string;

  // 当事者
  issuerId: string;
  recipientId: string;

  // 適格請求書の法定記載事項
  /** 適格請求書発行事業者の氏名又は名称 */
  issuerName: string;
  /** 登録番号 (T + 13桁) */
  issuerTaxRegistrationNumber: string;
  /** 取引年月日 */
  issueDate: Timestamp;
  /** 取引内容 */
  transactionDescription: string;

  // 金額内訳
  breakdown: InvoiceBreakdown;

  // 源泉徴収
  isWithholdingApplicable: boolean;
  withholdingTaxRate?: number;

  status: InvoiceStatus;

  /** Firebase Storage URL */
  pdfUrl?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
