import type { GuildRank } from '@/types/guild-card';
import { getRankInfo } from '@/lib/guild-rank';

interface RankBadgeProps {
  rank: GuildRank;
  /** バッジサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** ラベルテキストを表示するか */
  showLabel?: boolean;
}

/**
 * ギルドランクバッジ
 * ランクに応じた色とアイコンで表示
 */
export function RankBadge({ rank, size = 'md', showLabel = false }: RankBadgeProps) {
  const info = getRankInfo(rank);

  const sizeClasses = {
    sm: {
      outer: 'w-7 h-7 text-sm',
      label: 'text-xs',
      ring: 'ring-1',
    },
    md: {
      outer: 'w-10 h-10 text-base',
      label: 'text-xs',
      ring: 'ring-2',
    },
    lg: {
      outer: 'w-14 h-14 text-xl',
      label: 'text-sm',
      ring: 'ring-2',
    },
    xl: {
      outer: 'w-20 h-20 text-3xl',
      label: 'text-base',
      ring: 'ring-2',
    },
  }[size];

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses.outer}
          ${info.bgColor}
          ${sizeClasses.ring}
          ${info.borderColor}
          rounded-full
          flex items-center justify-center
          font-extrabold
          shadow-sm
          select-none
        `}
        style={{ color: info.textColor }}
        title={`${info.label} - ${info.description}`}
      >
        {rank}
      </div>
      {showLabel && (
        <span className={`${sizeClasses.label} font-medium ${info.color}`}>
          {info.emoji} {info.label}
        </span>
      )}
    </div>
  );
}

/**
 * ランクバッジ（横長タグ形式）
 */
export function RankTag({ rank }: { rank: GuildRank }) {
  const info = getRankInfo(rank);
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-1 rounded-full
        text-xs font-bold
        ${info.bgColor} ${info.color}
        border ${info.borderColor}
      `}
    >
      {info.emoji} {info.label}
    </span>
  );
}
