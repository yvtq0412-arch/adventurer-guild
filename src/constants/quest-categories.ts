import type { QuestCategory, QuestType } from '@/types/quest';

/** カテゴリ情報 */
export interface QuestCategoryInfo {
  id: QuestCategory;
  label: string;
  description: string;
  icon: string;
  type: QuestType;
  withholdingRequired: boolean;
}

/** 個人向けカテゴリ */
export const PERSONAL_CATEGORIES: QuestCategoryInfo[] = [
  { id: 'yard_work', label: '庭仕事・草取り', description: '草むしり、庭の手入れ、植木の剪定など', icon: '🌿', type: 'personal', withholdingRequired: false },
  { id: 'cleaning', label: '掃除・片付け', description: '部屋の掃除、整理整頓、不用品の分別など', icon: '🧹', type: 'personal', withholdingRequired: false },
  { id: 'moving', label: '引っ越し・運搬', description: '荷物の運搬、家具の移動、引っ越しの手伝いなど', icon: '📦', type: 'personal', withholdingRequired: false },
  { id: 'repair', label: '修理・メンテナンス', description: '家具の組み立て、ちょっとした修繕、電球交換など', icon: '🔧', type: 'personal', withholdingRequired: false },
  { id: 'shopping', label: '買い物代行', description: '日用品の買い出し、薬局への買い物など', icon: '🛒', type: 'personal', withholdingRequired: false },
  { id: 'eldercare', label: '高齢者サポート', description: '話し相手、通院の付き添い、日常のお手伝いなど（※医療・介護行為は不可）', icon: '🤝', type: 'personal', withholdingRequired: false },
  { id: 'cooking', label: '料理・家事', description: '食事の準備、作り置き、洗濯など', icon: '🍳', type: 'personal', withholdingRequired: false },
  { id: 'errands', label: '手続き代行', description: '役所への届出、書類の受け取りなど', icon: '📝', type: 'personal', withholdingRequired: false },
  { id: 'queue_waiting', label: '行列・順番待ち代行', description: '人気店・チケット・役所など、代わりに並びます', icon: '🪑', type: 'personal', withholdingRequired: false },
];

/** 企業向けカテゴリ */
export const BUSINESS_CATEGORIES: QuestCategoryInfo[] = [
  { id: 'office_cleaning', label: 'オフィス・店舗清掃', description: 'オフィス、店舗、施設の清掃作業', icon: '🏢', type: 'business', withholdingRequired: false },
  { id: 'warehouse', label: '倉庫整理・棚卸し', description: '倉庫の整理、在庫の棚卸し、荷物の仕分けなど', icon: '🏭', type: 'business', withholdingRequired: false },
  { id: 'event_setup', label: 'イベント設営・撤去', description: '会場設営、テント張り、テーブル配置、後片付けなど', icon: '🎪', type: 'business', withholdingRequired: false },
  { id: 'delivery', label: '配達・集荷', description: '書類・荷物の配達、集荷、ルート配送など', icon: '🚚', type: 'business', withholdingRequired: false },
  { id: 'signage', label: '看板・POP設置', description: '店舗看板の設置、POPの貼り替え、旗の設置など', icon: '🪧', type: 'business', withholdingRequired: false },
  { id: 'inventory', label: '在庫管理・検品', description: '商品の検品、数量チェック、ラベル貼りなど', icon: '📋', type: 'business', withholdingRequired: false },
  { id: 'facility', label: '施設メンテナンス', description: '建物の簡易清掃、駐車場整備、除草作業など', icon: '🔨', type: 'business', withholdingRequired: false },
  { id: 'sns_promotion', label: 'SNS投稿・口コミ', description: '商品体験＋SNS投稿、レビュー投稿、来店＋写真投稿など', icon: '📱', type: 'business', withholdingRequired: false },
];

/** 共通カテゴリ（両方で表示） */
const COMMON_CATEGORIES: QuestCategoryInfo[] = [
  { id: 'consultation', label: '相談・アドバイス', description: '専門知識の相談、経験者へのアドバイス依頼など', icon: '💬', type: 'personal', withholdingRequired: false },
  { id: 'other', label: 'その他', description: '上記に該当しない依頼', icon: '💡', type: 'personal', withholdingRequired: false },
];

/** 全カテゴリ */
export const QUEST_CATEGORIES: QuestCategoryInfo[] = [
  ...PERSONAL_CATEGORIES,
  ...BUSINESS_CATEGORIES,
  ...COMMON_CATEGORIES,
];

/** タイプ別カテゴリ取得 */
export function getCategoriesByType(questType: QuestType): QuestCategoryInfo[] {
  if (questType === 'personal') return [...PERSONAL_CATEGORIES, ...COMMON_CATEGORIES];
  if (questType === 'business') return [...BUSINESS_CATEGORIES, ...COMMON_CATEGORIES];
  return QUEST_CATEGORIES;
}

/** カテゴリIDからカテゴリ情報を取得 */
export function getQuestCategoryInfo(categoryId: QuestCategory): QuestCategoryInfo | undefined {
  return QUEST_CATEGORIES.find((c) => c.id === categoryId);
}

/** 源泉徴収対象かどうかを判定 */
export function isWithholdingRequired(categoryId: QuestCategory): boolean {
  return getQuestCategoryInfo(categoryId)?.withholdingRequired ?? false;
}
