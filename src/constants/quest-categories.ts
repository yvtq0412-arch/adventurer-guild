import { QuestCategory } from '@/types/quest';

/** カテゴリ情報 */
interface QuestCategoryInfo {
  id: QuestCategory;
  label: string;
  description: string;
  icon: string;
  /** 源泉徴収対象かどうか */
  withholdingRequired: boolean;
}

/**
 * クエストカテゴリ定義
 *
 * 生活サービス系のカテゴリ
 * 個人間の作業代行は原則として源泉徴収不要
 */
export const QUEST_CATEGORIES: QuestCategoryInfo[] = [
  {
    id: 'yard_work',
    label: '庭仕事・草取り',
    description: '草むしり、庭の手入れ、植木の剪定など',
    icon: '🌿',
    withholdingRequired: false,
  },
  {
    id: 'cleaning',
    label: '掃除・片付け',
    description: '部屋の掃除、整理整頓、不用品の分別など',
    icon: '🧹',
    withholdingRequired: false,
  },
  {
    id: 'moving',
    label: '引っ越し・運搬',
    description: '荷物の運搬、家具の移動、引っ越しの手伝いなど',
    icon: '📦',
    withholdingRequired: false,
  },
  {
    id: 'repair',
    label: '修理・メンテナンス',
    description: '家具の組み立て、ちょっとした修繕、電球交換など',
    icon: '🔧',
    withholdingRequired: false,
  },
  {
    id: 'shopping',
    label: '買い物代行',
    description: '日用品の買い出し、薬局への買い物など',
    icon: '🛒',
    withholdingRequired: false,
  },
  {
    id: 'pet_care',
    label: 'ペットの世話',
    description: '散歩代行、エサやり、一時預かりなど',
    icon: '🐕',
    withholdingRequired: false,
  },
  {
    id: 'childcare',
    label: '子守り・送迎',
    description: 'お子さんの見守り、習い事の送迎など',
    icon: '👶',
    withholdingRequired: false,
  },
  {
    id: 'eldercare',
    label: '高齢者サポート',
    description: '話し相手、通院の付き添い、日常のお手伝いなど',
    icon: '🤝',
    withholdingRequired: false,
  },
  {
    id: 'cooking',
    label: '料理・家事',
    description: '食事の準備、作り置き、洗濯など',
    icon: '🍳',
    withholdingRequired: false,
  },
  {
    id: 'errands',
    label: '手続き代行',
    description: '役所への届出、書類の受け取りなど',
    icon: '📝',
    withholdingRequired: false,
  },
  {
    id: 'other',
    label: 'その他',
    description: '上記に該当しない依頼',
    icon: '💡',
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
