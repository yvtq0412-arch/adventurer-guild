/**
 * ギルドランクシステム
 * F → E → D → C → B → A → S
 *
 * ランクポイント計算式:
 *   クエスト完了 1件 = +10pt
 *   依頼者評価   1件 = +(評価点 × 5)pt（最大 5.0 × 5 = 25pt）
 *   累計報酬     10万円ごとに = +5pt
 */

import type { GuildRank, RankRequirement } from '@/types/guild-card';

// ===== ランク定義テーブル =====
export const RANK_TABLE: Record<GuildRank, RankRequirement> = {
  F: {
    rank: 'F',
    label: 'Fランク',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    textColor: '#6b7280',
    emoji: '🪨',
    minCompletedQuests: 0,
    minRankPoints: 0,
    minAverageRating: 0,
    description: '新米冒険者。ギルドカード取得直後はここからスタート！',
    perks: ['ギルドカード取得', 'クエスト受注可能'],
  },
  E: {
    rank: 'E',
    label: 'Eランク',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: '#16a34a',
    emoji: '🌿',
    minCompletedQuests: 3,
    minRankPoints: 50,
    minAverageRating: 3.5,
    description: '少しずつ実績を積んできた冒険者。',
    perks: ['プロフィールに実績バッジ表示', '優先表示（検索順位UP）'],
  },
  D: {
    rank: 'D',
    label: 'Dランク',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: '#2563eb',
    emoji: '💧',
    minCompletedQuests: 10,
    minRankPoints: 150,
    minAverageRating: 3.8,
    description: '安定した実績を持つ冒険者。',
    perks: ['D以上限定クエスト受注可', 'カード上部に「実績あり」表示'],
  },
  C: {
    rank: 'C',
    label: 'Cランク',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: '#d97706',
    emoji: '⚡',
    minCompletedQuests: 25,
    minRankPoints: 350,
    minAverageRating: 4.0,
    description: '依頼者から信頼される中堅冒険者。',
    perks: ['C以上限定の高額クエスト受注可', '手数料割引（15% → 13%）'],
  },
  B: {
    rank: 'B',
    label: 'Bランク',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: '#ea580c',
    emoji: '🔥',
    minCompletedQuests: 60,
    minRankPoints: 700,
    minAverageRating: 4.2,
    description: '多くの依頼をこなしてきたベテラン冒険者。',
    perks: ['B以上限定クエスト受注可', '手数料割引（13% → 12%）', 'ピックアップ掲載（週1回）'],
  },
  A: {
    rank: 'A',
    label: 'Aランク',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: '#9333ea',
    emoji: '💎',
    minCompletedQuests: 150,
    minRankPoints: 1500,
    minAverageRating: 4.5,
    description: 'ギルドが誇るエキスパート冒険者。',
    perks: ['A以上限定VIPクエスト受注可', '手数料割引（12% → 11%）', 'トップページ掲載'],
  },
  S: {
    rank: 'S',
    label: 'Sランク',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: '#f59e0b',
    emoji: '⭐',
    minCompletedQuests: 300,
    minRankPoints: 3000,
    minAverageRating: 4.8,
    description: '伝説の冒険者。ギルドの看板を背負う存在。',
    perks: ['全クエスト受注可', '手数料最大優遇（11% → 10%）', '「ギルドエース」称号', 'ホームページ特集掲載'],
  },
};

export const RANK_ORDER: GuildRank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

/**
 * ランクポイントを計算する
 */
export function calcRankPoints(params: {
  completedQuestsCount: number;
  totalEarnings: number;
  averageRating: number;
  ratingCount: number;
}): number {
  const { completedQuestsCount, totalEarnings, averageRating, ratingCount } = params;

  // クエスト完了ポイント: 1件 × 10pt
  const questPoints = completedQuestsCount * 10;

  // 評価ポイント: 評価点 × 5pt × 件数
  const ratingPoints = Math.floor(averageRating * 5 * ratingCount);

  // 累計報酬ポイント: 10万円ごとに5pt
  const earningsPoints = Math.floor(totalEarnings / 100_000) * 5;

  return questPoints + ratingPoints + earningsPoints;
}

/**
 * ランクポイントと実績から現在のランクを算出する
 */
export function calcRank(params: {
  completedQuestsCount: number;
  rankPoints: number;
  averageRating: number;
}): GuildRank {
  const { completedQuestsCount, rankPoints, averageRating } = params;

  // S → F の順で、条件を満たす最高ランクを返す
  const reversed = [...RANK_ORDER].reverse() as GuildRank[];

  for (const rank of reversed) {
    const req = RANK_TABLE[rank];
    if (
      completedQuestsCount >= req.minCompletedQuests &&
      rankPoints >= req.minRankPoints &&
      (averageRating >= req.minAverageRating || req.minAverageRating === 0)
    ) {
      return rank;
    }
  }

  return 'F';
}

/**
 * 次のランクまでの進捗を返す
 */
export function getNextRankProgress(params: {
  currentRank: GuildRank;
  completedQuestsCount: number;
  rankPoints: number;
  averageRating: number;
}): {
  nextRank: GuildRank | null;
  questsProgress: { current: number; required: number };
  pointsProgress: { current: number; required: number };
  ratingProgress: { current: number; required: number };
  overallPercent: number;
} | null {
  const { currentRank, completedQuestsCount, rankPoints, averageRating } = params;
  const currentIdx = RANK_ORDER.indexOf(currentRank);

  if (currentIdx === RANK_ORDER.length - 1) {
    // Sランクは最高位
    return null;
  }

  const nextRank = RANK_ORDER[currentIdx + 1] as GuildRank;
  const req = RANK_TABLE[nextRank];

  const questsPercent = Math.min(100, (completedQuestsCount / req.minCompletedQuests) * 100);
  const pointsPercent = Math.min(100, (rankPoints / req.minRankPoints) * 100);
  const ratingPercent = req.minAverageRating === 0
    ? 100
    : Math.min(100, (averageRating / req.minAverageRating) * 100);

  const overallPercent = Math.floor((questsPercent + pointsPercent + ratingPercent) / 3);

  return {
    nextRank,
    questsProgress: { current: completedQuestsCount, required: req.minCompletedQuests },
    pointsProgress: { current: rankPoints, required: req.minRankPoints },
    ratingProgress: { current: averageRating, required: req.minAverageRating },
    overallPercent,
  };
}

/**
 * ランク情報を取得する
 */
export function getRankInfo(rank: GuildRank): RankRequirement {
  return RANK_TABLE[rank];
}

/**
 * 手数料レートをランクから取得する（%）
 */
export function getGuildFeeRateByRank(rank: GuildRank): number {
  switch (rank) {
    case 'S': return 0.10;  // 10%
    case 'A': return 0.11;  // 11%
    case 'B': return 0.12;  // 12%
    case 'C': return 0.13;  // 13%
    case 'D':
    case 'E':
    case 'F':
    default:  return 0.15;  // 15%
  }
}
