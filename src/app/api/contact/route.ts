/**
 * お問い合わせ API
 * POST /api/contact
 *
 * 1. Firestore の contacts コレクションに保存
 * 2. Resend で運営者にメール通知
 *
 * ログイン不要（未登録ユーザーからの問い合わせも受け付ける）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'yvtq0412@gmail.com';

const CATEGORY_LABELS: Record<string, string> = {
  general: '一般的なご質問',
  bug: '不具合・バグ報告',
  billing: 'お支払い・手数料について',
  report: '違反・通報に関するご相談',
  other: 'その他',
};

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
    // 1. Firestoreに保存
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

    // 2. 運営者にメール通知
    try {
      await resend.emails.send({
        from: 'Guild お問い合わせ <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject: `【Guild】新しいお問い合わせ: ${CATEGORY_LABELS[category] || category}`,
        html: `
          <h2>新しいお問い合わせが届きました</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;width:120px;">お名前</td><td style="padding:8px;border:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">メール</td><td style="padding:8px;border:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">カテゴリ</td><td style="padding:8px;border:1px solid #eee;">${CATEGORY_LABELS[category] || category}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">内容</td><td style="padding:8px;border:1px solid #eee;white-space:pre-wrap;">${message}</td></tr>
          </table>
          <p style="margin-top:16px;color:#999;font-size:12px;">このメールはGuildのお問い合わせフォームから自動送信されました。</p>
        `,
      });
    } catch (emailErr) {
      // メール送信失敗してもFirestoreには保存済みなのでエラーにしない
      console.error('[contact] メール通知失敗:', emailErr);
    }

    return NextResponse.json({
      message: 'お問い合わせを受け付けました。内容を確認のうえ、ご連絡いたします。',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[contact] エラー: ${msg}`);
    return NextResponse.json({ error: 'お問い合わせの送信に失敗しました' }, { status: 500 });
  }
}
