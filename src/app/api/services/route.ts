/**
 * Service（掲載サービス）CRUD API
 * POST /api/services - 掲載作成
 * GET  /api/services - 掲載一覧（公開中のみ、フィルタ可）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { canAccept } from '@/types/user';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAmount } from '@/lib/guild-economics';
import {
  getServiceTypeById,
  validateServiceParams,
} from '@/constants/service-types';
import type { GuildMember } from '@/types/user';
import type { ServiceTypeId } from '@/types/service';

const CreateServiceSchema = z.object({
  serviceType: z.enum(['weeding', 'snow_removal']),
  bio: z.string().max(200),
  packages: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        priceJpy: z.number().int().positive(),
        templateParams: z.record(z.string(), z.string().max(64)),
      })
    )
    .min(1)
    .max(10),
  areas: z
    .array(
      z.object({
        prefecture: z.string().min(1).max(50),
        cities: z.array(z.string().max(50)).max(50),
      })
    )
    .min(1)
    .max(20),
  publish: z.boolean(),
});

/** POST: 掲載作成 */
export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  // 掲載資格チェック（本人確認 + Stripe Connect 登録済み）
  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }
  const memberData = userDoc.data() as GuildMember;
  if (!canAccept(memberData)) {
    return NextResponse.json(
      {
        error: '掲載するには本人確認とStripe Connectのオンボーディングが必要です',
        identityStatus: memberData.identityStatus,
        stripeOnboardingComplete: memberData.stripeOnboardingComplete,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = CreateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '不正なリクエスト', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { serviceType, bio, packages, areas, publish } = parsed.data;

  // サービス種別の存在確認
  const def = getServiceTypeById(serviceType);
  if (!def) {
    return NextResponse.json(
      { error: '不正なサービス種別です' },
      { status: 400 }
    );
  }

  // 各パッケージのパラメータ検証 + 金額検証
  for (const [idx, pkg] of packages.entries()) {
    const errs = validateServiceParams(serviceType as ServiceTypeId, pkg.templateParams);
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

  try {
    const serviceRef = adminDb.collection('services').doc();
    const now = new Date();

    // パッケージにIDを付与
    const packagesWithIds = packages.map((pkg, idx) => ({
      packageId: `pkg_${serviceRef.id}_${idx}`,
      ...pkg,
    }));

    const serviceData = {
      serviceId: serviceRef.id,
      ownerId: user.uid,
      serviceType,
      bio,
      packages: packagesWithIds,
      areas,
      status: publish ? 'published' : 'draft',
      averageRating: null,
      reviewCount: 0,
      completedCount: 0,
      publishedAt: publish ? now : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await serviceRef.set(serviceData);

    return NextResponse.json({
      ...serviceData,
      message: publish ? '掲載を公開しました' : '下書きを保存しました',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-service] エラー: ${message}`);
    return NextResponse.json(
      { error: `掲載の登録に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}

/** GET: 掲載一覧（公開中のみ） */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceType = searchParams.get('serviceType');
  const prefecture = searchParams.get('prefecture');
  const ownerId = searchParams.get('ownerId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  try {
    let query = adminDb.collection('services').orderBy('createdAt', 'desc');

    if (ownerId) {
      query = query.where('ownerId', '==', ownerId);
    } else {
      // ownerId 指定がなければ公開中のみ
      query = query.where('status', '==', 'published');
    }

    if (serviceType) {
      query = query.where('serviceType', '==', serviceType);
    }

    const snapshot = await query.limit(limit).get();

    let services = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return { ...data, serviceId: doc.id } as Record<string, unknown>;
    });

    // 都道府県フィルタはクライアント側でフィルタ（areasが配列のため）
    if (prefecture) {
      services = services.filter((s) => {
        const areas = s.areas as { prefecture: string }[] | undefined;
        return Array.isArray(areas) && areas.some((a) => a.prefecture === prefecture);
      });
    }

    return NextResponse.json({ services, total: services.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[list-services] エラー: ${message}`);
    return NextResponse.json(
      { error: `掲載一覧の取得に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
