'use client';

import Link from 'next/link';
import type { GuildCard } from '@/types/guild-card';
import { getRankInfo, getNextRankProgress } from '@/lib/guild-rank';
import { RankBadge, RankTag } from './RankBadge';

interface GuildCardDisplayProps {
  card: GuildCard;
  /** 自分のカードを表示している場合（進捗バーを表示） */
  isOwn?: boolean;
  /** コンパクト表示（クエスト一覧での冒険者表示など） */
  compact?: boolean;
}

/**
 * ギルドカード表示コンポーネント
 * 依頼者が冒険者のプロフィールを確認するためのカード
 */
export function GuildCardDisplay({ card, isOwn = false, compact = false }: GuildCardDisplayProps) {
  const rankInfo = getRankInfo(card.rank);

  if (compact) {
    return (
      <Link
        href={`/guild-card/${card.uid}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group"
      >
        {/* アバター + ランク */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 text-lg font-bold">
            {card.avatarUrl ? (
              <img src={card.avatarUrl} alt={card.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              card.displayName.charAt(0)
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <RankBadge rank={card.rank} size="sm" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{card.displayName}</p>
            <RankTag rank={card.rank} />
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{card.catchphrase}</p>
        </div>

        <div className="text-xs text-gray-300 group-hover:text-indigo-400 transition">→</div>
      </Link>
    );
  }

  // フルカード表示
  const nextProgress = getNextRankProgress({
    currentRank: card.rank,
    completedQuestsCount: card.completedQuestsCount,
    rankPoints: card.rankPoints,
    averageRating: card.averageRating,
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* ヘッダー帯（ランクカラー） */}
      <div
        className={`h-2 ${rankInfo.bgColor}`}
        style={{ background: `linear-gradient(90deg, ${rankInfo.textColor}33, ${rankInfo.textColor}88)` }}
      />

      <div className="p-6">
        {/* プロフィールヘッダー */}
        <div className="flex items-start gap-4 mb-5">
          {/* アバター */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-500 border-2 border-white shadow">
              {card.avatarUrl ? (
                <img src={card.avatarUrl} alt={card.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                card.displayName.charAt(0)
              )}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <RankBadge rank={card.rank} size="md" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-gray-900">{card.displayName}</h2>
              <RankTag rank={card.rank} />
            </div>
            <p className="text-sm text-indigo-600 font-medium mb-2">
              &quot;{card.catchphrase}&quot;
            </p>

            {/* 実績サマリー */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>⚔️ {card.completedQuestsCount}件完了</span>
              {card.ratingCount > 0 && (
                <span>⭐ {card.averageRating.toFixed(1)} ({card.ratingCount}件)</span>
              )}
            </div>
          </div>
        </div>

        {/* 自己紹介 */}
        {card.bio && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">自己紹介</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{card.bio}</p>
          </div>
        )}

        {/* スキルタグ */}
        {card.skills && card.skills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">スキル</h3>
            <div className="flex flex-wrap gap-1.5">
              {card.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 対応エリア */}
        {card.availableAreas && card.availableAreas.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">対応エリア</h3>
            <div className="flex flex-wrap gap-1.5">
              {card.availableAreas.map((area) => (
                <span
                  key={area}
                  className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100"
                >
                  📍 {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ランク進捗（自分のカードのみ） */}
        {isOwn && nextProgress && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                次のランクまで
              </h3>
              <div className="flex items-center gap-2">
                <RankBadge rank={card.rank} size="sm" />
                <span className="text-xs text-gray-300">→</span>
                <RankBadge rank={nextProgress.nextRank!} size="sm" />
              </div>
            </div>

            {/* 総合進捗バー */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>総合進捗</span>
                <span>{nextProgress.overallPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${nextProgress.overallPercent}%`,
                    background: `linear-gradient(90deg, ${rankInfo.textColor}, ${getRankInfo(nextProgress.nextRank!).textColor})`,
                  }}
                />
              </div>
            </div>

            {/* 詳細進捗 */}
            <div className="space-y-1.5">
              <ProgressItem
                label="完了クエスト"
                current={nextProgress.questsProgress.current}
                required={nextProgress.questsProgress.required}
                suffix="件"
              />
              <ProgressItem
                label="ランクポイント"
                current={nextProgress.pointsProgress.current}
                required={nextProgress.pointsProgress.required}
                suffix="pt"
              />
              <ProgressItem
                label="平均評価"
                current={nextProgress.ratingProgress.current}
                required={nextProgress.ratingProgress.required}
                suffix="以上"
                isRating
              />
            </div>
          </div>
        )}

        {/* ランク特典（自分のカードのみ） */}
        {isOwn && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: `${rankInfo.textColor}11` }}>
            <p className="text-xs font-medium mb-2" style={{ color: rankInfo.textColor }}>
              {rankInfo.emoji} {rankInfo.label} の特典
            </p>
            <ul className="space-y-1">
              {rankInfo.perks.map((perk) => (
                <li key={perk} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span style={{ color: rankInfo.textColor }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressItem({
  label,
  current,
  required,
  suffix,
  isRating = false,
}: {
  label: string;
  current: number;
  required: number;
  suffix: string;
  isRating?: boolean;
}) {
  const percent = Math.min(100, (current / required) * 100);
  const done = current >= required;
  const displayCurrent = isRating ? current.toFixed(1) : current;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-400' : 'bg-indigo-300'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`text-xs shrink-0 ${done ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
        {done ? '✓ 達成' : `${displayCurrent}/${required}${suffix}`}
      </span>
    </div>
  );
}
