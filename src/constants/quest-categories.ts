import { QuestCategory } from '@/types/quest';

/** カテゴリ情報 */
interface QuestCategoryInfo {
  id: QuestCategory;
  label: string;
  description: string;
  icon: string;
  /** 源泉徴収対象かどうか（所得税法第204条） */
  withholdingRequired: boolean;
}

/**
 * クエストカテゴリ定義
 *
 * 源泉徴収対象:
 * - デザイン、ライティング、コンサルティング、翻訳、撮影、動画制作
 *   → 所得税法第204条に基づく報酬（原稿料、デザイン料、講演料等）
 *
 * 源泉徴収非対象:
 * - 開発、マーケティング、その他
 *   → プログラミングは原則として源泉徴収不要
 */
export const QUEST_CATEGORIES: QuestCategoryInfo[] = [
  {
    id: 'design',
    label: 'デザイン',
    description: 'UI/UX、グラフィック、ロゴ等のデザイン業務',
    icon: '🎨',
    withholdingRequired: true,
  },
  {
    id: 'writing',
    label: 'ライティング',
    description: '記事執筆、コピーライティング、原稿作成',
    icon: '✍️',
    withholdingRequired: true,
  },
  {
    id: 'development',
    label: '開発',
    description: 'Webアプリ、モバイルアプリ、システム開発',
    icon: '⚔️',
    withholdingRequired: false,
  },
  {
    id: 'consulting',
    label: 'コンサルティング',
    description: '経営、IT、業務改善等のコンサルティング',
    icon: '🧙',
    withholdingRequired: true,
  },
  {
    id: 'translation',
    label: '翻訳',
    description: '文書翻訳、通訳、ローカライゼーション',
    icon: '📜',
    withholdingRequired: true,
  },
  {
    id: 'photography',
    label: '撮影',
    description: '写真撮影、画像編集',
    icon: '📷',
    withholdingRequired: true,
  },
  {
    id: 'video',
    label: '動画制作',
    description: '動画撮影、編集、アニメーション',
    icon: '🎬',
    withholdingRequired: true,
  },
  {
    id: 'marketing',
    label: 'マーケティング',
    description: 'SNS運用、広告運用、マーケット調査',
    icon: '📢',
    withholdingRequired: false,
  },
  {
    id: 'other',
    label: 'その他',
    description: '上記に該当しない依頼',
    icon: '🗡️',
    withholdingRequired: false,
  },
];

/** カテゴリIDからカテゴリ情報を取得 */
export function getQuestCategoryInfo(categoryId: QuestCategory): QuestCategoryInfo | undefined {
  return QUEST_CATEGORIES.find((c) => c.id === categoryId);
}

/** 源泉徴収対象かどうかを判定 */
export function isWithholdingRequired(categoryId: QuestCategory): boolean {
  return getQuestCategoryInfo(categoryId)?.withholdingRequired ?? false;
}
