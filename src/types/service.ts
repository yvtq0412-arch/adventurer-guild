/**
 * Service（出品サービス）型定義
 *
 * ココナラ型のマーケットプレイスにおける「出品」のデータモデル。
 * 出品者が「これやります、〇〇円」と登録 → 購入者が選んで購入する。
 *
 * 購入後の注文（Order）の役割は既存の Quest コレクションが担う。
 * Quest の adventurerId = 出品者、clientId = 購入者となる。
 */

import { Timestamp } from 'firebase/firestore';

/** サービス種別ID（運営が事前定義したテンプレートのID） */
export type ServiceTypeId = 'weeding' | 'snow_removal';

/** サービスのステータス */
export type ServiceStatus =
  | 'draft'         // 下書き
  | 'published'     // 公開中
  | 'paused'        // 出品者が一時停止
  | 'banned';       // 運営が停止

/** サービスのパッケージ（複数価格帯） */
export interface ServicePackage {
  packageId: string;
  /** パッケージ名（例: 「庭の草むしり〜30㎡」） */
  name: string;
  /** 1回あたりの価格（JPY整数） */
  priceJpy: number;
  /**
   * 作業量パラメータ（ServiceType ごとに固定）
   * 例: { area: 'm', grassHeight: 'medium' }
   */
  templateParams: Record<string, string>;
}

/** サービス対応エリア */
export interface ServiceArea {
  prefecture: string;
  /**
   * 対応する市区町村
   * 空配列の場合は「都道府県内全域」とみなす
   */
  cities: string[];
}

/** Service（出品サービス） */
export interface Service {
  serviceId: string;

  /** 出品者UID（GuildMember.uid） */
  ownerId: string;

  /** サービス種別（運営が定義したテンプレート） */
  serviceType: ServiceTypeId;

  /** 自己紹介・アピール文（200字、出品者の自由入力） */
  bio: string;

  /** 提供パッケージ（1つ以上） */
  packages: ServicePackage[];

  /** 対応エリア（1つ以上） */
  areas: ServiceArea[];

  /** ステータス */
  status: ServiceStatus;

  /** 評価（受注後のレビュー集約） */
  averageRating?: number;
  reviewCount: number;
  completedCount: number;

  /** 公開日時 */
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** 運営により停止された理由（あれば） */
  bannedReason?: string;
}

/** サービス出品時の入力 */
export interface CreateServiceInput {
  serviceType: ServiceTypeId;
  bio: string;
  packages: Omit<ServicePackage, 'packageId'>[];
  areas: ServiceArea[];
  /** true なら作成と同時に公開、false なら下書き */
  publish: boolean;
}

/** サービス更新時の入力 */
export interface UpdateServiceInput {
  bio?: string;
  packages?: Omit<ServicePackage, 'packageId'>[];
  areas?: ServiceArea[];
  status?: 'draft' | 'published' | 'paused';
}
