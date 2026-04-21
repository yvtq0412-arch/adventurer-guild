/**
 * クエスト作業テンプレート
 *
 * 「ユーザーが自由に業務内容を書けてしまう」リスクを排除するため、
 * 運営が事前承認した作業テンプレートから選択する仕組み。
 *
 * 各テンプレートはカテゴリに紐づき、必要な作業量パラメータを持つ。
 * タイトルと説明文はパラメータから自動生成される。
 *
 * === 追加方針 ===
 * 新しいテンプレートは少しずつ一緒にカテゴリ分けして追加していく。
 * この配列に push するだけで新規テンプレートが増やせる拡張可能な設計。
 */

import type { QuestCategory } from '@/types/quest';

/** パラメータの選択肢 */
export interface TemplateParamOption {
  /** パラメータ値（内部保存用ID） */
  value: string;
  /** 表示ラベル */
  label: string;
  /** 補足説明（任意） */
  hint?: string;
}

/** テンプレートの作業量パラメータ定義 */
export interface TemplateParam {
  /** パラメータID（stateのキー） */
  id: string;
  /** 表示ラベル */
  label: string;
  /** 選択肢 */
  options: TemplateParamOption[];
  /** 必須かどうか */
  required: boolean;
}

/** 作業テンプレート定義 */
export interface QuestTemplate {
  /** テンプレートID（Firestoreに保存する識別子） */
  id: string;
  /** 所属カテゴリ */
  category: QuestCategory;
  /** テンプレート名（UI表示用） */
  name: string;
  /** アイコン絵文字 */
  icon: string;
  /** 短い説明 */
  summary: string;
  /** 必要パラメータ */
  params: TemplateParam[];
  /**
   * タイトル自動生成関数
   * @param values - params の id をキーにした選択値マップ
   */
  buildTitle: (values: Record<string, string>) => string;
  /**
   * 説明文自動生成関数
   */
  buildDescription: (values: Record<string, string>) => string;
}

/**
 * 作業テンプレート一覧
 *
 * 現状は「草むしり（個人）」「敷地の草むしり（企業）」のみ。
 * カテゴリ分けした後、1つずつ追加していく予定。
 */
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // ===== 庭仕事・草取り（個人向け） =====
  {
    id: 'yard_weeding',
    category: 'yard_work',
    name: '草むしり',
    icon: '🌿',
    summary: '庭や敷地の草を抜く作業',
    params: [
      {
        id: 'area',
        label: '面積',
        required: true,
        options: [
          { value: 'xs', label: '〜10㎡', hint: '駐車場1台分くらい' },
          { value: 's', label: '10〜30㎡', hint: '小さな庭' },
          { value: 'm', label: '30〜50㎡', hint: '一般的な庭' },
          { value: 'l', label: '50〜100㎡', hint: '大きな庭' },
        ],
      },
      {
        id: 'grassHeight',
        label: '草の高さ',
        required: true,
        options: [
          { value: 'short', label: '短い（〜10cm）' },
          { value: 'medium', label: '中くらい（10〜30cm）' },
          { value: 'tall', label: '長い（30cm〜）' },
        ],
      },
      {
        id: 'disposal',
        label: '刈った草の処分',
        required: true,
        options: [
          { value: 'client', label: '依頼者側で処分する' },
          { value: 'leave_bagged', label: '袋にまとめて置いておく（45ℓ袋まで）' },
        ],
      },
    ],
    buildTitle: (v) => {
      const areaLabel = weedingAreaLabel(v.area);
      return `草むしり（${areaLabel}）`;
    },
    buildDescription: (v) => {
      const area = weedingAreaDetail(v.area);
      const height = weedingHeightDetail(v.grassHeight);
      const disposal = weedingDisposalDetail(v.disposal);
      return [
        `【作業内容】庭の草むしり`,
        `【面積】${area}`,
        `【草の高さ】${height}`,
        `【刈った草の処分】${disposal}`,
        ``,
        `※ 作業時間は冒険者の判断に委ねます（作業量ベースの依頼）。`,
        `※ 電気工事・ガス工事・水道工事・農薬散布など資格が必要な作業は含まれません。`,
      ].join('\n');
    },
  },

  // ===== 施設メンテナンス（企業向け・敷地の草むしり） =====
  {
    id: 'facility_weeding',
    category: 'facility',
    name: '敷地の草むしり',
    icon: '🌿',
    summary: '店舗・オフィス・駐車場など敷地内の雑草除去',
    params: [
      {
        id: 'site',
        label: '場所',
        required: true,
        options: [
          { value: 'shopfront', label: '店舗・オフィス前' },
          { value: 'parking', label: '駐車場' },
          { value: 'perimeter', label: '建物の外周' },
          { value: 'vacant_lot', label: '空き地・遊休地' },
        ],
      },
      {
        id: 'area',
        label: '面積',
        required: true,
        options: [
          { value: 'xs', label: '〜10㎡', hint: '駐車場1台分くらい' },
          { value: 's', label: '10〜30㎡', hint: '小規模な敷地' },
          { value: 'm', label: '30〜50㎡', hint: '一般的な敷地' },
          { value: 'l', label: '50〜100㎡', hint: '広めの敷地' },
        ],
      },
      {
        id: 'grassHeight',
        label: '草の高さ',
        required: true,
        options: [
          { value: 'short', label: '短い（〜10cm）' },
          { value: 'medium', label: '中くらい（10〜30cm）' },
          { value: 'tall', label: '長い（30cm〜）' },
        ],
      },
      {
        id: 'disposal',
        label: '刈った草の処分',
        required: true,
        options: [
          { value: 'client', label: '依頼者側で処分する' },
          { value: 'leave_bagged', label: '袋にまとめて置いておく（45ℓ袋まで）' },
        ],
      },
    ],
    buildTitle: (v) => {
      const site = facilityWeedingSiteShort(v.site);
      const area = weedingAreaLabel(v.area);
      return `敷地の草むしり（${site}・${area}）`;
    },
    buildDescription: (v) => {
      const site = facilityWeedingSiteDetail(v.site);
      const area = weedingAreaDetail(v.area);
      const height = weedingHeightDetail(v.grassHeight);
      const disposal = weedingDisposalDetail(v.disposal);
      return [
        `【作業内容】事業用敷地内の草むしり`,
        `【場所】${site}`,
        `【面積】${area}`,
        `【草の高さ】${height}`,
        `【刈った草の処分】${disposal}`,
        ``,
        `※ 作業時間は冒険者の判断に委ねます（作業量ベースの依頼）。`,
        `※ 電気工事・ガス工事・水道工事・農薬散布など資格が必要な作業は含まれません。`,
        `※ 建設工事・高所作業は含まれません。`,
      ].join('\n');
    },
  },
];

// ---- 草むしり共通ヘルパー（個人・企業で共用） ----
function weedingAreaLabel(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡';
    case 's': return '10〜30㎡';
    case 'm': return '30〜50㎡';
    case 'l': return '50〜100㎡';
    default: return '';
  }
}
function weedingAreaDetail(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡（駐車場1台分程度）';
    case 's': return '10〜30㎡（小規模）';
    case 'm': return '30〜50㎡（一般的）';
    case 'l': return '50〜100㎡（広め）';
    default: return '';
  }
}
function weedingHeightDetail(value: string): string {
  switch (value) {
    case 'short': return '短い（〜10cm）';
    case 'medium': return '中くらい（10〜30cm）';
    case 'tall': return '長い（30cm〜）';
    default: return '';
  }
}
function weedingDisposalDetail(value: string): string {
  switch (value) {
    case 'client': return '依頼者側で処分';
    case 'leave_bagged': return '45ℓ袋にまとめて現地に置いておく';
    default: return '';
  }
}

// ---- 企業向け敷地の草むしり用ヘルパー ----
function facilityWeedingSiteShort(value: string): string {
  switch (value) {
    case 'shopfront': return '店舗前';
    case 'parking': return '駐車場';
    case 'perimeter': return '建物外周';
    case 'vacant_lot': return '空き地';
    default: return '';
  }
}
function facilityWeedingSiteDetail(value: string): string {
  switch (value) {
    case 'shopfront': return '店舗・オフィスの前面';
    case 'parking': return '駐車場';
    case 'perimeter': return '建物の外周';
    case 'vacant_lot': return '空き地・遊休地';
    default: return '';
  }
}

// ===== 汎用ユーティリティ =====

/** カテゴリに紐づくテンプレート一覧を取得 */
export function getTemplatesByCategory(category: QuestCategory): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.category === category);
}

/** テンプレートIDからテンプレートを取得 */
export function getTemplateById(templateId: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === templateId);
}

/** そのカテゴリがテンプレート対応済みか */
export function isCategoryTemplated(category: QuestCategory): boolean {
  return QUEST_TEMPLATES.some((t) => t.category === category);
}

/**
 * パラメータの値がテンプレート定義と合致するか検証
 * @returns 不足/不正なパラメータIDの配列。問題なければ空配列。
 */
export function validateTemplateParams(
  templateId: string,
  values: Record<string, string>
): string[] {
  const template = getTemplateById(templateId);
  if (!template) return ['template_not_found'];
  const errors: string[] = [];
  for (const param of template.params) {
    const value = values[param.id];
    if (param.required && !value) {
      errors.push(`${param.id}:required`);
      continue;
    }
    if (value && !param.options.some((o) => o.value === value)) {
      errors.push(`${param.id}:invalid`);
    }
  }
  return errors;
}
