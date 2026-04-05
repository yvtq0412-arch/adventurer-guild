/**
 * 通報 API
 * POST /api/reports - ユーザーを通報する
 *
 * 通報が受理されると:
 * 1. reports コレクションに保存
 * 2. 対象ユーザーを即BAN（isBanned = true）
 * 3. ギルドカードがあれば SUSPENDED に変更
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const ReportSchema = z.object({
  questId: z.string().min(1),
  reportedUserId: z.string().min(1),
  reason: z.enum([
    'fraud', 'harassment', 'no_show', 'false_completion',
    'inappropriate', 'safety_concern', 'other',
  ]),
  description: z.string().min(10, '詳細は10文字以上で記載してください').max(1000),
});

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 });
  }

  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力内容に問題があります', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { questId, reportedUserId, reason, description } = parsed.data;

  // 自分自身は通報できない
  if (reportedUserId === user.uid) {
    return NextResponse.json({ error: '自分自身を通報することはできません' }, { status: 400 });
  }

  try {
    // クエストの存在＋当事者チェック
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json({ error: 'クエストが見つかりません' }, { status: 404 });
    }
    const quest = questDoc.data()!;
    const isClient = quest.clientId === user.uid;
    const isAdventurer = quest.adventurerId === user.uid;
    if (!isClient && !isAdventurer) {
      return NextResponse.json({ error: 'このクエストの当事者のみ通報できます' }, { status: 403 });
    }

    // 通報対象がクエストの相手方であることを確認
    const expectedTarget = isClient ? quest.adventurerId : quest.clientId;
    if (reportedUserId !== expectedTarget) {
      return NextResponse.json({ error: '通報対象が正しくありません' }, { status: 400 });
    }

    // 重複通報チェック
    const existing = await adminDb.collection('reports')
      .where('questId', '==', questId)
      .where('reporterId', '==', user.uid)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'このクエストでは既に通報済みです' }, { status: 409 });
    }

    // トランザクション: 通報保存 + BAN処理
    await adminDb.runTransaction(async (tx) => {
      const reportRef = adminDb.collection('reports').doc();

      // 1. 通報を保存
      tx.set(reportRef, {
        reportId: reportRef.id,
        questId,
        reporterId: user.uid,
        reportedUserId,
        reason,
        description,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      // 2. 対象ユーザーをBAN
      const userRef = adminDb.collection('users').doc(reportedUserId);
      tx.update(userRef, {
        isBanned: true,
        bannedAt: FieldValue.serverTimestamp(),
        bannedReason: `通報によるBAN（理由: ${reason}）クエスト: ${questId}`,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 3. ギルドカードがあればSUSPEND
      const cardRef = adminDb.collection('guild_cards').doc(reportedUserId);
      const cardDoc = await tx.get(cardRef);
      if (cardDoc.exists) {
        tx.update(cardRef, {
          status: 'SUSPENDED',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({
      message: '通報を受け付けました。対象ユーザーのアカウントは停止されました。',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[report] エラー: ${message}`);
    return NextResponse.json(
      { error: `通報の送信に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
