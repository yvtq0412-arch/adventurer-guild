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
 * 現状のラインナップ:
 * - 庭仕事・草取り（個人）: 草むしり
 * - 掃除・片付け（個人）: 屋外・共用部の掃除 / 不用品の分別・ゴミ出し
 * - 施設メンテナンス（企業）: 敷地の草むしり
 *
 * 盗難・プライバシーリスクを避けるため、室内への立ち入りや
 * 物の物色が伴う作業はテンプレート化しない方針。
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

  // ===== 掃除・片付け（個人向け・屋外/共用部のみ） =====
  {
    id: 'cleaning_outdoor',
    category: 'cleaning',
    name: '屋外・共用部の掃除',
    icon: '🧹',
    summary: '玄関外・ベランダ・廊下・階段など、家の中に入らない範囲の掃除',
    params: [
      {
        id: 'site',
        label: '掃除する場所',
        required: true,
        options: [
          { value: 'entrance', label: '玄関まわり（外側）' },
          { value: 'balcony', label: 'ベランダ' },
          { value: 'corridor', label: '廊下・階段（共用部）' },
          { value: 'window_outside', label: '窓の外側（手の届く範囲）', hint: '2階以上の高所は不可' },
        ],
      },
      {
        id: 'size',
        label: '広さ',
        required: true,
        options: [
          { value: 's', label: '〜5㎡（狭め）' },
          { value: 'm', label: '5〜10㎡（普通）' },
          { value: 'l', label: '10〜20㎡（広め）' },
        ],
      },
      {
        id: 'dirtiness',
        label: '汚れの度合い',
        required: true,
        options: [
          { value: 'light', label: '軽い（普段のお掃除）' },
          { value: 'medium', label: '中くらい（少し溜まっている）' },
          { value: 'heavy', label: 'しっかりめ（念入りに）' },
        ],
      },
    ],
    buildTitle: (v) => {
      const site = cleaningOutdoorSiteShort(v.site);
      const size = cleaningOutdoorSizeLabel(v.size);
      return `屋外・共用部の掃除（${site}・${size}）`;
    },
    buildDescription: (v) => {
      const site = cleaningOutdoorSiteDetail(v.site);
      const size = cleaningOutdoorSizeDetail(v.size);
      const dirtiness = cleaningDirtinessDetail(v.dirtiness);
      return [
        `【作業内容】屋外・共用部の掃除（家の中には入らない作業）`,
        `【場所】${site}`,
        `【広さ】${size}`,
        `【汚れの度合い】${dirtiness}`,
        ``,
        `※ 作業時間は冒険者の判断に委ねます（作業量ベースの依頼）。`,
        `※ 室内への立ち入りは行いません。貴重品・プライベート空間に触れる作業は含まれません。`,
        `※ ハウスクリーニング業相当の専門薬剤使用、エアコン・換気扇の分解清掃は対象外です（資格が必要なため）。`,
        `※ 2階以上の高所作業・脚立を使った作業は対象外です（安全のため）。`,
      ].join('\n');
    },
  },

  // ===== 掃除・片付け（個人向け・不用品の分別とゴミ出し） =====
  {
    id: 'cleaning_garbage',
    category: 'cleaning',
    name: '不用品の分別・ゴミ出し',
    icon: '🗑️',
    summary: '一般ゴミ・資源ゴミの分別と、指定場所までの運搬',
    params: [
      {
        id: 'volume',
        label: '量',
        required: true,
        options: [
          { value: 's', label: '45ℓ袋×1〜3袋' },
          { value: 'm', label: '45ℓ袋×4〜10袋' },
          { value: 'l', label: '45ℓ袋×11〜20袋' },
        ],
      },
      {
        id: 'content',
        label: '内容',
        required: true,
        options: [
          { value: 'general', label: '一般ゴミの仕分け' },
          { value: 'recycle', label: '資源ゴミ（缶・ビン・ペットボトル等）の分別' },
          { value: 'both', label: '両方' },
        ],
      },
      {
        id: 'carry',
        label: '運搬',
        required: true,
        options: [
          { value: 'sort_only', label: '分別のみ（回収日に依頼者が出す）' },
          { value: 'carry_to_collection', label: '指定のゴミ集積所まで運ぶ' },
        ],
      },
    ],
    buildTitle: (v) => {
      const volume = cleaningGarbageVolumeLabel(v.volume);
      return `不用品の分別・ゴミ出し（${volume}）`;
    },
    buildDescription: (v) => {
      const volume = cleaningGarbageVolumeDetail(v.volume);
      const content = cleaningGarbageContentDetail(v.content);
      const carry = cleaningGarbageCarryDetail(v.carry);
      return [
        `【作業内容】不用品の分別とゴミ出し`,
        `【量】${volume}`,
        `【内容】${content}`,
        `【運搬】${carry}`,
        ``,
        `※ 作業時間は冒険者の判断に委ねます（作業量ベースの依頼）。`,
        `※ ゴミ袋は依頼者側でご用意ください。自治体の分別ルールに従って仕分けします。`,
        `※ 不用品の買取・引き取り（古物商業務）や、産業廃棄物・家電リサイクル法対象品（テレビ・冷蔵庫・洗濯機・エアコン・PC等）の運搬は対象外です。`,
        `※ 一般家庭ゴミの集積所までの運搬のみ可能です。処分場まで運ぶ等の業者作業は対象外です（一般廃棄物収集運搬業許可が必要なため）。`,
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

// ---- 屋外・共用部の掃除用ヘルパー ----
function cleaningOutdoorSiteShort(value: string): string {
  switch (value) {
    case 'entrance': return '玄関まわり';
    case 'balcony': return 'ベランダ';
    case 'corridor': return '廊下・階段';
    case 'window_outside': return '窓の外側';
    default: return '';
  }
}
function cleaningOutdoorSiteDetail(value: string): string {
  switch (value) {
    case 'entrance': return '玄関まわり（外側）';
    case 'balcony': return 'ベランダ';
    case 'corridor': return '廊下・階段（共用部）';
    case 'window_outside': return '窓の外側（手の届く範囲、2階以上の高所は不可）';
    default: return '';
  }
}
function cleaningOutdoorSizeLabel(value: string): string {
  switch (value) {
    case 's': return '〜5㎡';
    case 'm': return '5〜10㎡';
    case 'l': return '10〜20㎡';
    default: return '';
  }
}
function cleaningOutdoorSizeDetail(value: string): string {
  switch (value) {
    case 's': return '〜5㎡（狭め）';
    case 'm': return '5〜10㎡（普通）';
    case 'l': return '10〜20㎡（広め）';
    default: return '';
  }
}
function cleaningDirtinessDetail(value: string): string {
  switch (value) {
    case 'light': return '軽い（普段のお掃除レベル）';
    case 'medium': return '中くらい（少し溜まっている）';
    case 'heavy': return 'しっかりめ（念入りに）';
    default: return '';
  }
}

// ---- 不用品の分別・ゴミ出し用ヘルパー ----
function cleaningGarbageVolumeLabel(value: string): string {
  switch (value) {
    case 's': return '45ℓ袋×1〜3袋';
    case 'm': return '45ℓ袋×4〜10袋';
    case 'l': return '45ℓ袋×11〜20袋';
    default: return '';
  }
}
function cleaningGarbageVolumeDetail(value: string): string {
  switch (value) {
    case 's': return '45ℓ袋×1〜3袋（少量）';
    case 'm': return '45ℓ袋×4〜10袋（中量）';
    case 'l': return '45ℓ袋×11〜20袋（多量）';
    default: return '';
  }
}
function cleaningGarbageContentDetail(value: string): string {
  switch (value) {
    case 'general': return '一般ゴミの仕分け';
    case 'recycle': return '資源ゴミ（缶・ビン・ペットボトル等）の分別';
    case 'both': return '一般ゴミ・資源ゴミの両方の分別';
    default: return '';
  }
}
function cleaningGarbageCarryDetail(value: string): string {
  switch (value) {
    case 'sort_only': return '分別のみ（ゴミ出しは依頼者側で実施）';
    case 'carry_to_collection': return '分別後、指定のゴミ集積所まで運搬';
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
