/**
 * サービス種別（テンプレート）定義
 *
 * 出品者は運営が定義したサービス種別（草取り・除雪など）から選び、
 * パッケージごとに「作業量パラメータ + 価格」を設定する。
 *
 * パラメータの値は固定選択肢（運営承認済み）に限定されるため、
 * 「禁止業種の混入リスク」をシステム的に排除できる。
 *
 * === 追加方針 ===
 * 新しいサービス種別は SERVICE_TYPES 配列に push するだけで増やせる。
 * 一緒にカテゴリ分けしながら少しずつ追加していく。
 */

import type { ServiceTypeId } from '@/types/service';

/** パラメータの選択肢 */
export interface ServiceTypeParamOption {
  value: string;
  label: string;
  hint?: string;
}

/** パッケージの作業量パラメータ定義 */
export interface ServiceTypeParam {
  id: string;
  label: string;
  options: ServiceTypeParamOption[];
  required: boolean;
}

/** サービス種別定義 */
export interface ServiceTypeDef {
  id: ServiceTypeId;
  /** 種別名（UI表示用） */
  name: string;
  /** アイコン絵文字 */
  icon: string;
  /** 短い説明 */
  summary: string;
  /** 詳細説明（出品ページ・サービス詳細ページに表示） */
  description: string;
  /** パッケージごとに必要なパラメータ */
  params: ServiceTypeParam[];
  /** パッケージ名の自動生成（出品者向け参考） */
  buildPackageName: (values: Record<string, string>) => string;
  /** 注文時の説明文の自動生成 */
  buildOrderDescription: (values: Record<string, string>) => string;
}

/**
 * サービス種別一覧
 *
 * MVP は「草取り」「除雪」のみ。
 */
export const SERVICE_TYPES: ServiceTypeDef[] = [
  // ===== 草取り =====
  {
    id: 'weeding',
    name: '草取り',
    icon: '🌿',
    summary: '庭・敷地の草むしり',
    description:
      '庭や敷地内の雑草を抜く作業を提供します。電気・ガス・水道工事や農薬散布など、資格が必要な作業は含まれません。',
    params: [
      {
        id: 'area',
        label: '面積',
        required: true,
        options: [
          { value: 'xs', label: '〜10㎡', hint: '駐車場1台分くらい' },
          { value: 's', label: '10〜30㎡', hint: '小規模' },
          { value: 'm', label: '30〜50㎡', hint: '一般的な広さ' },
          { value: 'l', label: '50〜100㎡', hint: '広め' },
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
    buildPackageName: (v) => {
      const area = weedingAreaLabel(v.area);
      return `草取り（${area}）`;
    },
    buildOrderDescription: (v) => {
      const area = weedingAreaDetail(v.area);
      const disposal = weedingDisposalDetail(v.disposal);
      return [
        `【サービス】草取り`,
        `【面積】${area}`,
        `【刈った草の処分】${disposal}`,
        ``,
        `※ 作業時間は出品者の判断に委ねます（作業量ベース）。`,
        `※ 電気・ガス・水道工事、農薬散布など資格が必要な作業は含まれません。`,
      ].join('\n');
    },
  },

  // ===== 除雪 =====
  {
    id: 'snow_removal',
    name: '除雪',
    icon: '❄️',
    summary: '玄関前・駐車場の雪かき',
    description:
      '玄関前や駐車場など、敷地内の積雪を取り除く作業を提供します。屋根の雪下ろしや高所作業、骨雪の除去は含まれません。',
    params: [
      {
        id: 'site',
        label: '場所',
        required: true,
        options: [
          { value: 'entrance', label: '玄関前・通路' },
          { value: 'parking', label: '駐車場' },
          { value: 'around_building', label: '建物の周り' },
        ],
      },
      {
        id: 'area',
        label: '広さ',
        required: true,
        options: [
          { value: 'xs', label: '〜10㎡', hint: '玄関前くらい' },
          { value: 's', label: '10〜30㎡', hint: '駐車場1〜2台分' },
          { value: 'm', label: '30〜50㎡', hint: '駐車場2〜3台分' },
          { value: 'l', label: '50〜100㎡', hint: '広め' },
        ],
      },
      {
        id: 'depth',
        label: '積雪の量',
        required: true,
        options: [
          { value: 'shallow', label: '少なめ（〜20cm）' },
          { value: 'medium', label: '普通（20〜50cm）' },
          { value: 'deep', label: '多め（50cm〜）' },
        ],
      },
    ],
    buildPackageName: (v) => {
      const site = snowSiteShort(v.site);
      const area = snowAreaLabel(v.area);
      return `除雪（${site}・${area}）`;
    },
    buildOrderDescription: (v) => {
      const site = snowSiteDetail(v.site);
      const area = snowAreaDetail(v.area);
      const depth = snowDepthDetail(v.depth);
      return [
        `【サービス】除雪`,
        `【場所】${site}`,
        `【広さ】${area}`,
        `【積雪の量】${depth}`,
        ``,
        `※ 作業時間は出品者の判断に委ねます（作業量ベース）。`,
        `※ 屋根の雪下ろし・高所作業・骨雪の除去は対象外です（安全のため）。`,
      ].join('\n');
    },
  },
];

// ---- 草取り用ヘルパー ----
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
function weedingDisposalDetail(value: string): string {
  switch (value) {
    case 'client': return '依頼者側で処分';
    case 'leave_bagged': return '45ℓ袋にまとめて現地に置いておく';
    default: return '';
  }
}

// ---- 除雪用ヘルパー ----
function snowSiteShort(value: string): string {
  switch (value) {
    case 'entrance': return '玄関前';
    case 'parking': return '駐車場';
    case 'around_building': return '建物周り';
    default: return '';
  }
}
function snowSiteDetail(value: string): string {
  switch (value) {
    case 'entrance': return '玄関前・通路';
    case 'parking': return '駐車場';
    case 'around_building': return '建物の周り';
    default: return '';
  }
}
function snowAreaLabel(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡';
    case 's': return '10〜30㎡';
    case 'm': return '30〜50㎡';
    case 'l': return '50〜100㎡';
    default: return '';
  }
}
function snowAreaDetail(value: string): string {
  switch (value) {
    case 'xs': return '〜10㎡（玄関前程度）';
    case 's': return '10〜30㎡（駐車場1〜2台分）';
    case 'm': return '30〜50㎡（駐車場2〜3台分）';
    case 'l': return '50〜100㎡（広め）';
    default: return '';
  }
}
function snowDepthDetail(value: string): string {
  switch (value) {
    case 'shallow': return '少なめ（〜20cm）';
    case 'medium': return '普通（20〜50cm）';
    case 'deep': return '多め（50cm〜）';
    default: return '';
  }
}

// ===== 汎用ユーティリティ =====

/** サービス種別IDから種別定義を取得 */
export function getServiceTypeById(id: string): ServiceTypeDef | undefined {
  return SERVICE_TYPES.find((t) => t.id === id);
}

/**
 * パラメータの値が定義と合致するか検証
 * @returns 不正な内容を文字列配列で返す。問題なければ空配列。
 */
export function validateServiceParams(
  serviceTypeId: ServiceTypeId,
  values: Record<string, string>
): string[] {
  const def = getServiceTypeById(serviceTypeId);
  if (!def) return ['service_type_not_found'];
  const errors: string[] = [];
  for (const param of def.params) {
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
