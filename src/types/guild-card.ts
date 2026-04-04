import { Timestamp } from 'firebase/firestore';

/**
 * ギルドランク（F → S ランク制）
 * 完了クエスト数・累計報酬・評価点で自動昇格
 */
export type GuildRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * ギルドカードの審査ステータス
 */
export type GuildCardStatus =
  | 'NONE'           // 未申請
  | 'PENDING'        // 申請済み・審査待ち
  | 'UNDER_REVIEW'   // 審査中
  | 'APPROVED'       // 承認済み（受注可能）
  | 'REJECTED'       // 却下（理由付き）
  | 'SUSPENDED';     // 停止中（違反等）

/**
 * ギルドカード本体
 * Firestore: guild_cards/{uid}
 */
export interface GuildCard {
  uid: string;

  // --- 審査情報 ---
  status: GuildCardStatus;
  rejectedReason?: string;
  reviewedAt?: Timestamp;
  reviewedBy?: string; // 管理者UID

  // --- 公開プロフィール ---
  displayName: string;
  avatarUrl?: string;
  catchphrase: string;          // 一言キャッチフレーズ（例: "どんな草も刈ります！"）
  bio: string;                  // 自己紹介文
  skills: string[];             // スキルタグ（例: ["草刈り", "高圧洗浄", "清掃"]）
  availableAreas: string[];     // 対応可能エリア（都道府県）
  availableCategories: string[]; // 対応可能カテゴリ

  // --- ランクシステム ---
  rank: GuildRank;
  rankPoints: number;           // ランクポイント（自動集計）
  completedQuestsCount: number; // 完了クエスト数
  totalEarnings: number;        // 累計報酬額（JPY）
  averageRating: number;        // 平均評価（0〜5.0）
  ratingCount: number;          // 評価件数

  // --- 本人確認情報（非公開・審査用） ---
  /** 氏名（本名） */
  realName: string;
  /** 生年月日 YYYY-MM-DD */
  dateOfBirth: string;
  /** 住所 */
  address: string;
  /** 電話番号 */
  phoneNumber: string;
  /** 身分証種別 */
  idDocumentType: 'drivers_license' | 'my_number_card' | 'passport' | 'health_insurance';
  /** 身分証画像URL（Firebase Storage） */
  idDocumentUrl?: string;
  /** 顔写真URL（Firebase Storage） */
  selfieUrl?: string;

  // --- 申請情報 ---
  appliedAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * ギルドカード申請入力
 */
export interface ApplyGuildCardInput {
  // 公開プロフィール
  displayName: string;
  catchphrase: string;
  bio: string;
  skills: string[];
  availableAreas: string[];
  availableCategories: string[];

  // 本人確認
  realName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  idDocumentType: GuildCard['idDocumentType'];
}

/**
 * ランク昇格条件（全て満たした場合に昇格）
 */
export interface RankRequirement {
  rank: GuildRank;
  label: string;
  color: string;         // Tailwind テキスト色
  bgColor: string;       // Tailwind 背景色
  borderColor: string;   // Tailwind ボーダー色
  textColor: string;     // ヘックスカラー（CSS変数）
  emoji: string;
  /** 昇格に必要な完了クエスト数 */
  minCompletedQuests: number;
  /** 昇格に必要なランクポイント */
  minRankPoints: number;
  /** 昇格に必要な最低評価 */
  minAverageRating: number;
  /** ランクの説明 */
  description: string;
  /** 特典 */
  perks: string[];
}
