import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { GuildCard } from '@/types/guild-card';
import { GuildCardDisplay } from '@/components/guild-card/GuildCardDisplay';
import { getRankInfo } from '@/lib/guild-rank';

interface PageProps {
  params: Promise<{ uid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uid } = await params;
  try {
    const cardDoc = await getDoc(doc(db, 'guild_cards', uid));
    if (cardDoc.exists()) {
      const card = cardDoc.data() as GuildCard;
      return {
        title: `${card.displayName} のワーカープロフィール | Guild`,
        description: card.catchphrase,
      };
    }
  } catch {
    // エラーは無視
  }
  return {
    title: 'ワーカープロフィール | Guild',
  };
}

export default async function GuildCardPublicPage({ params }: PageProps) {
  const { uid } = await params;

  let card: GuildCard | null = null;
  try {
    const cardDoc = await getDoc(doc(db, 'guild_cards', uid));
    if (cardDoc.exists()) {
      card = cardDoc.data() as GuildCard;
    }
  } catch {
    // エラーは無視
  }

  if (!card) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🃏</div>
        <p className="text-gray-500">ワーカープロフィールが見つかりません</p>
        <Link href="/quests" className="text-indigo-500 hover:text-indigo-600 text-sm mt-4 inline-block">
          ← 取引一覧に戻る
        </Link>
      </div>
    );
  }

  // 未承認の場合は公開しない
  if (card.status !== 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">このワーカープロフィールは現在審査中または非公開です</p>
        <Link href="/quests" className="text-indigo-500 hover:text-indigo-600 text-sm mt-4 inline-block">
          ← 取引一覧に戻る
        </Link>
      </div>
    );
  }

  const rankInfo = getRankInfo(card.rank);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/quests" className="hover:text-indigo-500 transition">取引一覧</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">ワーカープロフィール</span>
      </nav>

      {/* ワーカープロフィール本体 */}
      <GuildCardDisplay card={card} isOwn={false} />

      {/* ランク詳細 */}
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">🏆 ランク詳細</h3>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold border-2 ${rankInfo.bgColor} ${rankInfo.borderColor}`}
            style={{ color: rankInfo.textColor }}
          >
            {card.rank}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{rankInfo.emoji} {rankInfo.label}</p>
            <p className="text-xs text-gray-400">{rankInfo.description}</p>
          </div>
        </div>

        {/* 実績数値 */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="完了取引" value={`${card.completedQuestsCount}件`} />
          <StatBox
            label="平均評価"
            value={card.ratingCount > 0 ? `${card.averageRating.toFixed(1)}` : '-'}
            sub={card.ratingCount > 0 ? `(${card.ratingCount}件)` : undefined}
          />
          <StatBox
            label="累計報酬"
            value={card.totalEarnings > 0 ? `¥${card.totalEarnings.toLocaleString()}` : '-'}
          />
        </div>
      </div>

      {/* 信頼バッジ */}
      <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
        <p className="text-xs font-medium text-green-700 mb-2">✅ ギルド認定ワーカー</p>
        <p className="text-xs text-green-600">
          このプロフィールはGuildの審査を通過したワーカーです。本人確認・身分証の提出が完了しています。
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
