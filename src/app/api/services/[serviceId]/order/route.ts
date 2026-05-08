/**
 * サービス依頼（注文作成）API
 * POST /api/services/[serviceId]/order
 *
 * 掲載中のサービスから1パッケージを選んで注文を作成する。
 * 既存の Quest コレクションを「注文」として流用し、
 * 既存のエスクロー決済・チャット・レビュー基盤をそのまま再利用する。
 *
 * 注文時のフィールドマッピング:
 * - clientId        ← 依頼者（リクエスト送信者）
 * - adventurerId    ← ワーカー（service.ownerId）
 * - serviceId       ← サービスID
 * - packageId       ← 選択したパッケージID
 * - title           ← パッケージ名から自動生成
 * - description     ← サービス種別から自動生成
 * - totalAmount     ← パッケージの価格
 * - status          ← 'PENDING'（後続のエスクロー作成APIでESCROWED化）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { calculateGuildSplit, validateAmount } from '@/lib/guild-economics';
import { canPost } from '@/types/user';
import { FieldValue } from 'firebase-admin/firestore';
import { TRANSACTION_LIMITS } from '@/constants/guild-config';
import { getServiceTypeById } from '@/constants/service-types';
import type { GuildMember } from '@/types/user';

const CreateOrderSchema = z.object({
  packageId: z.string().min(1).max(128),
  prefecture: z.string().min(1).max(50),
  city: z.string().min(1).max(50),
  town: z.string().max(100).optional(),
  preferredDates: z
    .array(
      z.object({
        date: z.string(),
        timeSlot: z.string().optional(),
      })
    )
    .max(5)
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { serviceId } = await params;

  // 依頼者の発注資格チェック（本人確認 + Stripe Customer登録済み）
  const buyerDoc = await adminDb.collection('users').doc(user.uid).get();
  if (!buyerDoc.exists) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }
  const buyerData = buyerDoc.data() as GuildMember;
  if (!canPost(buyerData)) {
    return NextResponse.json(
      {
        error: '依頼するには本人確認とStripe決済登録が必要です',
        identityStatus: buyerData.identityStatus,
        hasStripeCustomer: !!buyerData.stripeCustomerId,
      },
      { status: 403 }
    );
  }

  // リクエストバリデーション
  const body = await request.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '不正なリクエスト', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { packageId, prefecture, city, town, preferredDates } = parsed.data;

  // サービス取得
  const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
  if (!serviceDoc.exists) {
    return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
  }
  const service = serviceDoc.data()!;

  // 公開中のみ依頼可能
  if (service.status !== 'published') {
    return NextResponse.json(
      { error: 'この掲載は現在依頼できません' },
      { status: 400 }
    );
  }

  // 自分の掲載は依頼不可
  if (service.ownerId === user.uid) {
    return NextResponse.json(
      { error: '自分の掲載は依頼できません' },
      { status: 400 }
    );
  }

  // パッケージ取得
  const pkg = (service.packages || []).find(
    (p: { packageId: string }) => p.packageId === packageId
  );
  if (!pkg) {
    return NextResponse.json({ error: '指定されたパッケージが見つかりません' }, { status: 400 });
  }

  // 対応エリアチェック
  const areaMatch = (service.areas || []).some(
    (a: { prefecture: string; cities: string[] }) =>
      a.prefecture === prefecture &&
      (a.cities.length === 0 || a.cities.includes(city))
  );
  if (!areaMatch) {
    return NextResponse.json(
      { error: '指定の作業場所はこのサービスの対応エリア外です' },
      { status: 400 }
    );
  }

  // ワーカーの受注資格を再確認（資格喪失していないか）
  const ownerDoc = await adminDb.collection('users').doc(service.ownerId).get();
  if (!ownerDoc.exists) {
    return NextResponse.json({ error: 'ワーカーが見つかりません' }, { status: 404 });
  }
  const ownerData = ownerDoc.data() as GuildMember;
  if (!ownerData.stripeOnboardingComplete || ownerData.identityStatus !== 'verified') {
    return NextResponse.json(
      { error: 'ワーカーの決済設定が不完全のため、現在依頼できません' },
      { status: 400 }
    );
  }

  // 金額検証
  const totalAmount = pkg.priceJpy;
  try {
    validateAmount(totalAmount);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '金額が不正です' },
      { status: 400 }
    );
  }

  // 取引制限（依頼者ベース）
  const completedQuests = await adminDb
    .collection('quests')
    .where('clientId', '==', user.uid)
    .where('status', '==', 'DISTRIBUTED')
    .count()
    .get();
  const completedCount = completedQuests.data().count;
  const maxAllowed =
    completedCount >= TRANSACTION_LIMITS.experiencedThreshold
      ? TRANSACTION_LIMITS.defaultMaxAmount
      : TRANSACTION_LIMITS.firstTimeMaxAmount;
  if (totalAmount > maxAllowed) {
    return NextResponse.json(
      {
        error:
          completedCount < TRANSACTION_LIMITS.experiencedThreshold
            ? `取引実績が${TRANSACTION_LIMITS.experiencedThreshold}件未満のため、1回あたり${TRANSACTION_LIMITS.firstTimeMaxAmount.toLocaleString()}円が上限です（現在${completedCount}件完了）`
            : `1回あたりの取引金額は${TRANSACTION_LIMITS.defaultMaxAmount.toLocaleString()}円が上限です`,
        maxAllowed,
        completedCount,
      },
      { status: 400 }
    );
  }

  // タイトル・説明文をサービス種別から自動生成（改ざん防止）
  const serviceTypeDef = getServiceTypeById(service.serviceType);
  if (!serviceTypeDef) {
    return NextResponse.json(
      { error: 'サービス種別の定義が見つかりません' },
      { status: 500 }
    );
  }
  const title = serviceTypeDef.buildPackageName(pkg.templateParams || {});
  const description = serviceTypeDef.buildOrderDescription(pkg.templateParams || {});

  // 経済計算
  const { guildFee, adventurerReward } = calculateGuildSplit(totalAmount);

  try {
    const questRef = adminDb.collection('quests').doc();
    const questData = {
      questId: questRef.id,
      title,
      description,
      questType: 'personal' as const,
      // category は既存スキーマ互換のため設定（雇用契約リスクのない自由作業として 'other'）
      category: 'other',
      // テンプレート情報（旧）
      templateId: null,
      templateParams: pkg.templateParams || null,
      // サービス掲載からの注文情報（新）
      serviceId,
      packageId,
      // 場所
      prefecture,
      city,
      town: town || '',
      // 参加者: clientId=依頼者、adventurerId=ワーカー（最初から確定）
      clientId: user.uid,
      adventurerId: service.ownerId,
      // 金額
      totalAmount,
      adventurerReward,
      guildFee,
      withholdingTaxAmount: 0,
      // ステータス
      status: 'PENDING',
      statusHistory: [
        {
          from: 'PENDING',
          to: 'PENDING',
          changedBy: user.uid,
          changedAt: new Date(),
          reason: 'サービス依頼（注文作成）',
        },
      ],
      // 希望日時
      preferredDates: preferredDates || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await questRef.set(questData);

    return NextResponse.json({
      ...questData,
      message: '注文を作成しました。続いて決済を行ってください。',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-order] エラー: ${message}`);
    return NextResponse.json(
      { error: `注文の作成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
