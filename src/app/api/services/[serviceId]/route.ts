/**
 * Service 個別取得・更新・削除API
 * GET    /api/services/[serviceId] - 掲載詳細
 * PATCH  /api/services/[serviceId] - 掲載更新（ワーカー本人のみ）
 * DELETE /api/services/[serviceId] - 掲載削除（ワーカー本人のみ）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAmount } from '@/lib/guild-economics';
import {
  getServiceTypeById,
  validateServiceParams,
} from '@/constants/service-types';
import type { ServiceTypeId } from '@/types/service';

const UpdateServiceSchema = z.object({
  bio: z.string().max(200).optional(),
  packages: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        priceJpy: z.number().int().positive(),
        templateParams: z.record(z.string(), z.string().max(64)),
      })
    )
    .min(1)
    .max(10)
    .optional(),
  areas: z
    .array(
      z.object({
        prefecture: z.string().min(1).max(50),
        cities: z.array(z.string().max(50)).max(50),
      })
    )
    .min(1)
    .max(20)
    .optional(),
  status: z.enum(['draft', 'published', 'paused']).optional(),
});

/** GET: 掲載詳細（公開中 or 自分のサービスのみ閲覧可） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  try {
    const doc = await adminDb.collection('services').doc(serviceId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
    }
    const data = doc.data()!;

    // 公開中以外は所有者のみ閲覧可
    if (data.status !== 'published') {
      const user = await verifyAuth(request);
      if (!user || user.uid !== data.ownerId) {
        return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
      }
    }

    return NextResponse.json({ service: { ...data, serviceId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `掲載詳細の取得に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}

/** PATCH: 掲載更新（所有者のみ） */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { serviceId } = await params;

  const body = await request.json();
  const parsed = UpdateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '不正なリクエスト', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ref = adminDb.collection('services').doc(serviceId);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
  }
  const current = doc.data()!;
  if (current.ownerId !== user.uid) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (parsed.data.bio !== undefined) update.bio = parsed.data.bio;
  if (parsed.data.areas !== undefined) update.areas = parsed.data.areas;

  if (parsed.data.packages !== undefined) {
    // パラメータ・金額検証
    const serviceType = current.serviceType as ServiceTypeId;
    if (!getServiceTypeById(serviceType)) {
      return NextResponse.json({ error: '不正なサービス種別です' }, { status: 400 });
    }
    for (const [idx, pkg] of parsed.data.packages.entries()) {
      const errs = validateServiceParams(serviceType, pkg.templateParams);
      if (errs.length > 0) {
        return NextResponse.json(
          { error: `パッケージ${idx + 1}の作業量パラメータが不正です`, details: errs },
          { status: 400 }
        );
      }
      try {
        validateAmount(pkg.priceJpy);
      } catch (err) {
        return NextResponse.json(
          {
            error: `パッケージ${idx + 1}の価格が不正です: ${err instanceof Error ? err.message : ''}`,
          },
          { status: 400 }
        );
      }
    }
    update.packages = parsed.data.packages.map((pkg, idx) => ({
      packageId: `pkg_${serviceId}_${idx}`,
      ...pkg,
    }));
  }

  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status;
    if (parsed.data.status === 'published' && !current.publishedAt) {
      update.publishedAt = new Date();
    }
  }

  await ref.update(update);

  const updated = await ref.get();
  return NextResponse.json({ service: { ...updated.data(), serviceId } });
}

/** DELETE: 掲載削除（所有者のみ・進行中の注文がない場合のみ） */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const { serviceId } = await params;
  const ref = adminDb.collection('services').doc(serviceId);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
  }
  const current = doc.data()!;
  if (current.ownerId !== user.uid) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  // 進行中の注文がないかチェック（quests コレクションを流用）
  const activeQuests = await adminDb
    .collection('quests')
    .where('serviceId', '==', serviceId)
    .where('status', 'in', ['PENDING', 'ESCROWED', 'WORK_IN_PROGRESS', 'COMPLETED', 'DISPUTED'])
    .count()
    .get();
  if (activeQuests.data().count > 0) {
    return NextResponse.json(
      { error: '進行中の注文があるため削除できません。完了するまでお待ちください。' },
      { status: 400 }
    );
  }

  // 物理削除ではなくステータスを 'banned' にして残す（取引履歴の参照のため）
  await ref.update({
    status: 'banned',
    bannedReason: 'ワーカーにより削除',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
