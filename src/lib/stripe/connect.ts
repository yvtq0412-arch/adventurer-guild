/**
 * Stripe Connect 管理
 * Express アカウントの作成・オンボーディング
 */

import { stripe } from './server';
import { adminDb } from '@/lib/firebase/admin';
import { STRIPE_ACCOUNT_TYPE } from '@/constants/guild-config';

/**
 * 冒険者用の Stripe Express アカウントを作成
 *
 * @param userId Firebase Auth UID
 * @param email ユーザーのメールアドレス
 * @returns Stripe Express アカウントID
 */
export async function createExpressAccount(
  userId: string,
  email: string
): Promise<string> {
  const account = await stripe.accounts.create({
    type: STRIPE_ACCOUNT_TYPE,
    country: 'JP',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      userId,
      platform: 'adventurer_guild',
    },
  });

  // Firestoreにアカウント情報を保存
  await adminDb.collection('users').doc(userId).update({
    stripeConnectAccountId: account.id,
    updatedAt: new Date(),
  });

  return account.id;
}

/**
 * オンボーディングリンクを生成
 *
 * @param accountId Stripe Express アカウントID
 * @returns オンボーディングURL
 */
export async function createAccountLink(accountId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/onboarding/stripe?refresh=true`,
    return_url: `${baseUrl}/onboarding/stripe?success=true`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Express ダッシュボードリンクを生成
 *
 * @param accountId Stripe Express アカウントID
 * @returns ダッシュボードURL
 */
export async function createDashboardLink(accountId: string): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * アカウントのオンボーディング状態を確認
 *
 * @param accountId Stripe Express アカウントID
 * @returns オンボーディング完了かどうか
 */
export async function checkAccountStatus(accountId: string): Promise<{
  isComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    isComplete: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
}

/**
 * 依頼者用の Stripe Customer を作成
 *
 * @param userId Firebase Auth UID
 * @param email ユーザーのメールアドレス
 * @param name ユーザー名
 * @returns Stripe Customer ID
 */
export async function createCustomer(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
      platform: 'adventurer_guild',
    },
  });

  await adminDb.collection('users').doc(userId).update({
    stripeCustomerId: customer.id,
    updatedAt: new Date(),
  });

  return customer.id;
}
