import { Timestamp } from 'firebase/firestore';

/** ギルドメンバーの役割 */
export type GuildRole = 'adventurer' | 'client' | 'both';

/** ギルドメンバー（ユーザー） */
export interface GuildMember {
  uid: string;
  displayName: string;
  email: string;
  role: GuildRole;
  avatarUrl?: string;

  // Stripe Connect（冒険者のみ）
  stripeConnectAccountId?: string;
  stripeOnboardingComplete: boolean;

  // Stripe Customer（依頼者のみ）
  stripeCustomerId?: string;

  // 税務情報
  /** 適格請求書発行事業者登録番号 (T + 13桁) */
  taxRegistrationNumber?: string;
  /** 適格請求書発行事業者かどうか */
  isQualifiedInvoiceIssuer: boolean;
  /** 源泉徴収対象かどうか */
  withholdingTaxApplicable: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** ユーザー作成時の入力 */
export interface CreateGuildMemberInput {
  displayName: string;
  email: string;
  role: GuildRole;
}
