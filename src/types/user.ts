import { Timestamp } from 'firebase/firestore';

/** 本人確認ステータス（Stripe Identity） */
export type IdentityStatus = 'unverified' | 'pending' | 'verified' | 'failed';

/** ギルドメンバー（ユーザー） */
export interface GuildMember {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;

  // 本人確認（Stripe Identity）
  identityStatus: IdentityStatus;
  stripeVerificationSessionId?: string;

  // Stripe Connect（受注時に必要）
  stripeConnectAccountId?: string;
  stripeOnboardingComplete: boolean;

  // Stripe Customer（発注時に必要）
  stripeCustomerId?: string;

  // 税務情報
  taxRegistrationNumber?: string;
  isQualifiedInvoiceIssuer: boolean;
  withholdingTaxApplicable: boolean;

  // 利用規約同意
  termsAgreedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** ユーザー作成時の入力 */
export interface CreateGuildMemberInput {
  displayName: string;
  email: string;
}

/** 発注できる条件 */
export function canPost(member: GuildMember): boolean {
  return member.identityStatus === 'verified' && !!member.stripeCustomerId;
}

/** 受注できる条件 */
export function canAccept(member: GuildMember): boolean {
  return member.identityStatus === 'verified' && member.stripeOnboardingComplete;
}
