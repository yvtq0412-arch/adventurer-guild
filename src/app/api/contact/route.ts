/**
 * お問い合わせ API
 * POST /api/contact
 *
 * フォームの内容を Firestore の contacts コレクションに保存する。
 * ログイン不要（未登録ユーザーからの問い合わせも受け付ける）。
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const ContactSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください').max(100),
  email: z.string().email('正しいメールアドレスを入力してください'),
  category: z.enum(['general', 'bug', 'billing', 'report', 'other']),
  message: z.string().min(10, 'お問い合わせ内容は10文字以上で入力してください').max(3000),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '入力内容に問題があります', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, category, message } = parsed.data;

  try {
    const ref = adminDb.collection('contacts').doc();
    await ref.set({
      contactId: ref.id,
      name,
      email,
      category,
      message,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: 'お問い合わせを受け付けました。内容を確認のうえ、ご連絡いたします。',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[contact] エラー: ${msg}`);
    return NextResponse.json({ error: 'お問い合わせの送信に失敗しました' }, { status: 500 });
  }
}
