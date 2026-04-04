/**
 * POST /api/guild-card/apply
 * ギルドカード申請 API
 *
 * 新規申請: guild_cards/{uid} を PENDING ステータスで作成
 * 再申請:   REJECTED の場合のみ PENDING に戻して更新
 */

import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/api-auth';
import type { ApplyGuildCardInput } from '@/types/guild-card';

export async function POST(request: NextRequest) {
  // 認証チェック
  const authUser = await verifyAuth(request);
  if (!authUser) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  let body: ApplyGuildCardInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストボディが不正です' }, { status: 400 });
  }

  const {
    displayName,
    catchphrase,
    bio,
    skills,
    availableAreas,
    availableCategories,
    realName,
    dateOfBirth,
    address,
    phoneNumber,
    idDocumentType,
  } = body;

  // 必須項目チェック
  if (
    !displayName?.trim() ||
    !catchphrase?.trim() ||
    !bio?.trim() ||
    !realName?.trim() ||
    !dateOfBirth?.trim() ||
    !address?.trim() ||
    !phoneNumber?.trim() ||
    !idDocumentType
  ) {
    return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json({ error: 'スキルを少なくとも1つ入力してください' }, { status: 400 });
  }

  if (!Array.isArray(availableAreas) || availableAreas.length === 0) {
    return NextResponse.json({ error: '対応エリアを少なくとも1つ選択してください' }, { status: 400 });
  }

  const uid = authUser.uid;
  const cardRef = adminDb.collection('guild_cards').doc(uid);

  try {
    const existing = await cardRef.get();

    if (existing.exists) {
      const existingData = existing.data()!;

      // 承認済み・審査中は再申請不可
      if (['APPROVED', 'PENDING', 'UNDER_REVIEW', 'SUSPENDED'].includes(existingData.status)) {
        return NextResponse.json(
          {
            error: `現在のステータスは「${existingData.status}」です。再申請できません。`,
            status: existingData.status,
          },
          { status: 409 }
        );
      }

      // REJECTED の場合は再申請として更新
      await cardRef.update({
        displayName: displayName.trim(),
        catchphrase: catchphrase.trim(),
        bio: bio.trim(),
        skills,
        availableAreas,
        availableCategories: availableCategories || [],
        realName: realName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        idDocumentType,
        status: 'PENDING',
        rejectedReason: FieldValue.delete(),
        reviewedAt: FieldValue.delete(),
        reviewedBy: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        message: '再申請を受け付けました。審査完了までお待ちください。',
        uid,
      });
    }

    // 新規申請
    await cardRef.set({
      uid,
      status: 'PENDING',
      displayName: displayName.trim(),
      catchphrase: catchphrase.trim(),
      bio: bio.trim(),
      skills,
      availableAreas,
      availableCategories: availableCategories || [],
      realName: realName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      address: address.trim(),
      phoneNumber: phoneNumber.trim(),
      idDocumentType,
      // ランク初期値
      rank: 'F',
      rankPoints: 0,
      completedQuestsCount: 0,
      totalEarnings: 0,
      averageRating: 0,
      ratingCount: 0,
      appliedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: 'ギルドカードの申請を受け付けました。審査完了までお待ちください（通常1〜3営業日）。',
      uid,
    });
  } catch (err) {
    console.error('ギルドカード申請エラー:', err);
    return NextResponse.json({ error: '申請処理に失敗しました' }, { status: 500 });
  }
}

/**
 * GET /api/guild-card/apply
 * 自分のギルドカード申請状況を取得
 */
export async function GET(request: NextRequest) {
  const authUser = await verifyAuth(request);
  if (!authUser) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const cardDoc = await adminDb.collection('guild_cards').doc(authUser.uid).get();

    if (!cardDoc.exists) {
      return NextResponse.json({ guildCard: null });
    }

    const data = cardDoc.data()!;

    // 本人確認情報（realName, dateOfBirth, address 等）は本人にのみ返す
    return NextResponse.json({ guildCard: data });
  } catch (err) {
    console.error('ギルドカード取得エラー:', err);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}
