import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/api-auth';

// 既読にする (POST /api/chats/[questId]/read)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questId: string }> }
) {
  const { questId } = await params;

  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // クエスト情報を取得してアクセス権限チェック (Admin SDK)
    const questDoc = await adminDb.collection('quests').doc(questId).get();
    if (!questDoc.exists) {
      return NextResponse.json({ error: 'クエストが見つかりません' }, { status: 404 });
    }
    const quest = questDoc.data()!;

    if (authUser.uid !== quest.clientId && authUser.uid !== quest.adventurerId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 未読カウントをリセット (Admin SDK)
    const threadRef = adminDb.collection('chats').doc(questId);
    const threadDoc = await threadRef.get();
    if (threadDoc.exists) {
      await threadRef.update({
        [`unreadCount.${authUser.uid}`]: 0,
      });
    }

    return NextResponse.json({ message: '既読にしました' });
  } catch (err) {
    console.error('既読エラー:', err);
    return NextResponse.json({ error: '既読の更新に失敗しました' }, { status: 500 });
  }
}
