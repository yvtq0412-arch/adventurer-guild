'use client';

import Link from 'next/link';
import type { GuildCard } from '@/types/guild-card';
import { getRankInfo, getNextRankProgress } from '@/lib/guild-rank';
import { RankBadge, RankTag } from './RankBadge';

interface GuildCardDisplayProps {
  card: GuildCard;
  /** 自分のカードを表示している場合（進捗バーを表示） */
  isOwn?: boolean;
  /** コンパクト表示（取引一覧でのワーカー表示など） */
  compact?: boolean;
}

/**
 * ワーカープロフィール表示コンポーネント
 * 依頼者がワーカーのプロフィールを確認するためのカード
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

        {/* 依頼者へのメッセージ */}
        {card.messageToClients && (
          <div className="mb-5 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs text-indigo-400 font-medium mb-1">💬 依頼者へのメッセージ</p>
            <p className="text-sm text-indigo-700 leading-relaxed">{card.messageToClients}</p>
          </div>
        )}

        {/* 実績PR */}
        {card.achievementNote && (
          <div className="mb-4">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">実績</h3>
            <p className="text-sm text-gray-600 font-medium">🏆 {card.achievementNote}</p>
          </div>
        )}

        {/* 作業スタイル */}
        {card.workStyle && card.workStyle.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">作業スタイル</h3>
            <div className="flex flex-wrap gap-1.5">
              {card.workStyle.map((style) => {
                const labels: Record<string, { label: string; icon: string }> = {
                  careful:        { label: '丁寧・確実',   icon: '🎯' },
                  speedy:         { label: 'スピード重視', icon: '⚡' },
                  cost_effective: { label: 'コスパ重視',   icon: '💰' },
                  communicative:  { label: 'こまめな連絡', icon: '💬' },
                  flexible:       { label: '柔軟対応',     icon: '🔄' },
                };
                const info = labels[style];
                return info ? (
                  <span key={style} className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-medium">
                    {info.icon} {info.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* 保有資格 */}
        {card.certifications && card.certifications.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">保有資格・免許</h3>
            <div className="flex flex-wrap gap-1.5">
              {card.certifications.map((cert) => (
                <span key={cert} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                  🏅 {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 職歴 */}
        {card.workHistory && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">職歴・経歴</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{card.workHistory}</p>
          </div>
        )}

        {/* スキルタグ */}
        {card.skills && card.skills.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">スキル</h3>
            <div className="flex flex-wrap gap-1.5">
              {card.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 稼働情報 */}
        {((card.availableDays && card.availableDays.length > 0) ||
          (card.availableTimeSlots && card.availableTimeSlots.length > 0) ||
          card.maxWorkDaysPerWeek ||
          card.minimumFee) && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">稼働情報</h3>
            <div className="space-y-2">
              {card.availableDays && card.availableDays.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-20 shrink-0">対応曜日</span>
                  <div className="flex gap-1">
                    {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((d) => {
                      const dayLabels = { mon:'月', tue:'火', wed:'水', thu:'木', fri:'金', sat:'土', sun:'日' };
                      const active = card.availableDays!.includes(d);
                      return (
                        <span key={d} className={`text-xs w-6 h-6 flex items-center justify-center rounded-md font-medium ${
                          active
                            ? (d === 'sat' || d === 'sun' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600')
                            : 'bg-gray-100 text-gray-300'
                        }`}>
                          {dayLabels[d]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {card.availableTimeSlots && card.availableTimeSlots.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-20 shrink-0">対応時間帯</span>
                  <div className="flex gap-1 flex-wrap">
                    {card.availableTimeSlots.map((slot) => {
                      const slotLabels: Record<string, string> = { morning:'早朝', daytime:'日中', evening:'夕方', night:'夜間' };
                      return (
                        <span key={slot} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">
                          {slotLabels[slot]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {card.maxWorkDaysPerWeek && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-20 shrink-0">週最大稼働</span>
                  <span className="text-gray-700 text-sm">週{card.maxWorkDaysPerWeek}日まで</span>
                </div>
              )}
              {card.minimumFee && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-20 shrink-0">最低金額</span>
                  <span className="text-gray-700 text-sm font-medium">¥{card.minimumFee.toLocaleString()}〜</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 外部リンク */}
        {(card.portfolioUrl || card.snsUrl) && (
          <div className="mb-5">
            <h3 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">外部リンク</h3>
            <div className="flex flex-wrap gap-2">
              {card.portfolioUrl && (
                <a href={card.portfolioUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition">
                  🔗 ポートフォリオ
                </a>
              )}
              {card.snsUrl && (
                <a href={card.snsUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition">
                  📱 SNS
                </a>
              )}
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
                label="完了取引"
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
