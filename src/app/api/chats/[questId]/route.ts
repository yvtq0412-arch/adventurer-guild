import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/api-auth';

// メッセージ一覧取得 (GET /api/chats/[questId])
export async function GET(
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

    // 依頼者または受注者のみアクセス可能
    if (authUser.uid !== quest.clientId && authUser.uid !== quest.adventurerId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const limitCount = parseInt(req.nextUrl.searchParams.get('limit') || '50');

    // Admin SDKでメッセージ取得
    const snapshot = await adminDb
      .collection('chats')
      .doc(questId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(limitCount)
      .get();

    const messages = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        messageId: d.id,
        ...data,
        // Admin SDK Timestampをシリアライズ
        createdAt: data.createdAt
          ? { seconds: Math.floor(data.createdAt._seconds ?? data.createdAt.seconds ?? 0) }
          : null,
      };
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('チャット取得エラー:', err);
    return NextResponse.json({ error: 'メッセージの取得に失敗しました' }, { status: 500 });
  }
}

// メッセージ送信 (POST /api/chats/[questId])
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

    // 依頼者または受注者のみ送信可能
    const isClient = authUser.uid === quest.clientId;
    const isAdventurer = authUser.uid === quest.adventurerId;

    if (!isClient && !isAdventurer) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const body = await req.json();
    const content = body.content?.trim();

    if (!content || content.length === 0) {
      return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'メッセージは2000文字以内にしてください' }, { status: 400 });
    }

    // 送信者情報取得 (Admin SDK)
    const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
    const senderName = userDoc.exists ? (userDoc.data()!.displayName || '名無し') : '名無し';
    const senderRole = isClient ? 'client' : 'adventurer';

    // 相手のUID（未読カウント用）
    const recipientId: string | undefined = isClient ? quest.adventurerId : quest.clientId;

    // Admin SDKでメッセージを追加
    const messageRef = await adminDb
      .collection('chats')
      .doc(questId)
      .collection('messages')
      .add({
        questId,
        senderId: authUser.uid,
        senderName,
        senderRole,
        content,
        createdAt: FieldValue.serverTimestamp(),
        readBy: [authUser.uid],
      });

    // チャットスレッドのメタデータを更新（なければ作成）
    const threadRef = adminDb.collection('chats').doc(questId);
    const threadDoc = await threadRef.get();

    const previewText = content.length > 50 ? content.slice(0, 50) + '...' : content;

    if (!threadDoc.exists) {
      await threadRef.set({
        questId,
        clientId: quest.clientId,
        adventurerId: quest.adventurerId || null,
        lastMessage: previewText,
        lastMessageAt: FieldValue.serverTimestamp(),
        lastSenderId: authUser.uid,
        unreadCount: recipientId ? { [recipientId]: 1 } : {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const updateData: Record<string, unknown> = {
        lastMessage: previewText,
        lastMessageAt: FieldValue.serverTimestamp(),
        lastSenderId: authUser.uid,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (recipientId) {
        updateData[`unreadCount.${recipientId}`] = FieldValue.increment(1);
      }
      await threadRef.update(updateData);
    }

    return NextResponse.json({
      messageId: messageRef.id,
      message: 'メッセージを送信しました',
    });
  } catch (err) {
    console.error('メッセージ送信エラー:', err);
    return NextResponse.json({ error: 'メッセージの送信に失敗しました' }, { status: 500 });
  }
}
