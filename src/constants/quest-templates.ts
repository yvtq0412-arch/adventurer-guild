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
 * 現在は「草むしり」のみ。カテゴリ分けした後、1つずつ追加していく予定。
 */
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // ===== 庭仕事・草取り =====
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
      const areaLabel = yardWeedingAreaLabel(v.area);
      return `草むしり（${areaLabel}）`;
    },
    buildDescription: (v) => {
      const area = yardWeedingAreaDetail(v.area);
      const height = yardWeedingHeightDetail(v.grassHeight);
      const disposal = yardWeedingDisposalDetail(v.disposal);
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
];

// ---- 草むしり用ヘルパー ----
function yardWeedingAreaLabel(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡';
    case 's': return '10〜30㎡';
    case 'm': return '30〜50㎡';
    case 'l': return '50〜100㎡';
    default: return '';
  }
}
function yardWeedingAreaDetail(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡（駐車場1台分程度）';
    case 's': return '10〜30㎡（小さな庭）';
    case 'm': return '30〜50㎡（一般的な庭）';
    case 'l': return '50〜100㎡（大きな庭）';
    default: return '';
  }
}
function yardWeedingHeightDetail(value: string): string {
  switch (value) {
    case 'short': return '短い（〜10cm）';
    case 'medium': return '中くらい（10〜30cm）';
    case 'tall': return '長い（30cm〜）';
    default: return '';
  }
}
function yardWeedingDisposalDetail(value: string): string {
  switch (value) {
    case 'client': return '依頼者側で処分';
    case 'leave_bagged': return '45ℓ袋にまとめて現地に置いておく';
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
