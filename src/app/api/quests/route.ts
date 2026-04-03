/**
 * クエスト CRUD API
 * POST /api/quests - クエスト作成
 * GET  /api/quests - クエスト一覧
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { calculateGuildSplit, validateAmount } from '@/lib/guild-economics';
import { calculateWithholdingForQuest } from '@/lib/withholding-tax';
import { FieldValue } from 'firebase-admin/firestore';
import type { QuestCategory } from '@/types/quest';

const CreateQuestSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  category: z.enum([
    'design', 'writing', 'development', 'consulting',
    'translation', 'photography', 'video', 'marketing', 'other',
  ]),
  totalAmount: z.number().int().positive(),
  deadline: z.string().optional(),
});

/** POST: クエスト作成 */
export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const parsed = CreateQuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '不正なリクエスト', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description, category, totalAmount, deadline } = parsed.data;

  try {
    validateAmount(totalAmount);

    const { guildFee, adventurerReward } = calculateGuildSplit(totalAmount);

    // 源泉徴収の判定
    const withholding = calculateWithholdingForQuest(
      adventurerReward,
      category as QuestCategory
    );

    const questRef = adminDb.collection('quests').doc();
    const questData = {
      questId: questRef.id,
      title,
      description,
      category,
      clientId: user.uid,
      adventurerId: null,
      totalAmount,
      adventurerReward,
      guildFee,
      withholdingTaxAmount: withholding.taxAmount,
      status: 'PENDING',
      statusHistory: [
        {
          from: 'PENDING',
          to: 'PENDING',
          changedBy: user.uid,
          changedAt: new Date(),
          reason: '依頼作成',
        },
      ],
      deadline: deadline ? new Date(deadline) : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await questRef.set(questData);

    return NextResponse.json({
      ...questData,
      message: '新しいクエストが掲示板に登録されました',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[create-quest] エラー: ${message}`);
    return NextResponse.json(
      { error: `クエスト作成に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}

/** GET: クエスト一覧 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  try {
    let query = adminDb.collection('quests').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(limit).get();

    const quests = snapshot.docs.map((doc) => ({
      ...doc.data(),
      questId: doc.id,
    }));

    return NextResponse.json({ quests, total: quests.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[list-quests] エラー: ${message}`);
    return NextResponse.json(
      { error: `クエスト一覧の取得に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
