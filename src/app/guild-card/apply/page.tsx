'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RANK_TABLE, RANK_ORDER } from '@/lib/guild-rank';
import type { GuildCard, GuildCardStatus } from '@/types/guild-card';

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const SKILL_SUGGESTIONS = [
  '草刈り', '庭木剪定', '除草', '高圧洗浄', '清掃・掃除', '引越し補助',
  '家具組み立て', '買い物代行', 'ペットの世話', 'ベビーシッター',
  '介護補助', '料理・食事準備', '荷物搬入出', 'オフィス清掃',
  '倉庫作業', 'イベントスタッフ', '看板設置', '棚卸し補助',
];

const ID_DOCUMENT_OPTIONS = [
  { value: 'drivers_license', label: '運転免許証' },
  { value: 'my_number_card', label: 'マイナンバーカード（表面のみ）' },
  { value: 'passport', label: 'パスポート' },
  { value: 'health_insurance', label: '健康保険証' },
] as const;

/** 審査ステータス表示 */
function StatusBanner({ status, rejectedReason }: { status: GuildCardStatus; rejectedReason?: string }) {
  const config: Record<string, { bg: string; text: string; icon: string; message: string }> = {
    PENDING: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-700',
      icon: '⏳',
      message: '申請を受け付けました。審査中です（通常1〜3営業日）。',
    },
    UNDER_REVIEW: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: '🔍',
      message: '現在審査中です。完了後にメールでご連絡します。',
    },
    APPROVED: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: '✅',
      message: '出品者プロフィールが承認されました！取引を受注できます。',
    },
    SUSPENDED: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: '🚫',
      message: 'アカウントが停止されています。お問い合わせください。',
    },
  };

  if (status === 'REJECTED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-red-700 font-medium mb-1">❌ 申請が却下されました</p>
        {rejectedReason && (
          <p className="text-red-600 text-sm">理由: {rejectedReason}</p>
        )}
        <p className="text-red-500 text-xs mt-2">情報を修正して再申請できます。</p>
      </div>
    );
  }

  const c = config[status];
  if (!c) return null;

  return (
    <div className={`${c.bg} border rounded-xl p-4 mb-6`}>
      <p className={`${c.text} font-medium`}>{c.icon} {c.message}</p>
      {status === 'APPROVED' && (
        <Link href={`/guild-card/${''}`} className="text-green-600 text-sm underline mt-1 block">
          出品者プロフィールを見る →
        </Link>
      )}
    </div>
  );
}

export default function GuildCardApplyPage() {
  const { user, getIdToken, loading } = useAuth();
  const router = useRouter();

  const [existingCard, setExistingCard] = useState<GuildCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // フォーム状態
  const [form, setForm] = useState({
    displayName: '',
    catchphrase: '',
    bio: '',
    skills: [] as string[],
    customSkill: '',
    availableAreas: [] as string[],
    availableCategories: [] as string[],
    realName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    idDocumentType: '' as GuildCard['idDocumentType'] | '',
    agreedToTerms: false,
  });

  // 既存の出品者プロフィールを取得
  useEffect(() => {
    if (!user || loading) return;

    const fetchCard = async () => {
      try {
        const token = await getIdToken();
        const res = await fetch('/api/guild-card/apply', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.guildCard) {
            setExistingCard(data.guildCard);
            // フォームに既存データを反映
            const c = data.guildCard;
            setForm((prev) => ({
              ...prev,
              displayName: c.displayName || '',
              catchphrase: c.catchphrase || '',
              bio: c.bio || '',
              skills: c.skills || [],
              availableAreas: c.availableAreas || [],
              availableCategories: c.availableCategories || [],
              realName: c.realName || '',
              dateOfBirth: c.dateOfBirth || '',
              address: c.address || '',
              phoneNumber: c.phoneNumber || '',
              idDocumentType: c.idDocumentType || '',
            }));
          }
        }
      } catch {
        // エラーは無視
      } finally {
        setLoadingCard(false);
      }
    };

    fetchCard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading || loadingCard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">読み込み中...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">出品者プロフィールの申請にはログインが必要です</p>
        <Link href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition">
          ログインする
        </Link>
      </div>
    );
  }

  // 承認済み・審査中はフォームを出さない
  const isEditable =
    !existingCard ||
    existingCard.status === 'REJECTED';

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const s = form.customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s], customSkill: '' }));
    }
  };

  const toggleArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      availableAreas: prev.availableAreas.includes(area)
        ? prev.availableAreas.filter((a) => a !== area)
        : [...prev.availableAreas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreedToTerms) {
      setMessage('利用規約への同意が必要です');
      setMessageType('error');
      return;
    }
    if (form.skills.length === 0) {
      setMessage('スキルを少なくとも1つ選択してください');
      setMessageType('error');
      return;
    }
    if (form.availableAreas.length === 0) {
      setMessage('対応エリアを少なくとも1つ選択してください');
      setMessageType('error');
      return;
    }
    if (!form.idDocumentType) {
      setMessage('身分証の種類を選択してください');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/guild-card/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: form.displayName,
          catchphrase: form.catchphrase,
          bio: form.bio,
          skills: form.skills,
          availableAreas: form.availableAreas,
          availableCategories: form.availableCategories,
          realName: form.realName,
          dateOfBirth: form.dateOfBirth,
          address: form.address,
          phoneNumber: form.phoneNumber,
          idDocumentType: form.idDocumentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setMessageType('success');
      // 画面更新
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '申請に失敗しました');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-500 transition">TOP</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">出品者プロフィール申請</span>
      </nav>

      {/* タイトル */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">⚔️ 出品者プロフィール申請</h1>
        <p className="text-sm text-gray-500">
          取引を受注するには出品者プロフィールが必要です。審査通過後、依頼者にプロフィールが公開されます。
        </p>
      </div>

      {/* ランク説明 */}
      <div className="bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-100 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 ランクシステム</p>
        <div className="flex items-center gap-2 flex-wrap">
          {RANK_ORDER.map((rank) => {
            const info = RANK_TABLE[rank];
            return (
              <div key={rank} className="flex flex-col items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 ${info.bgColor} ${info.borderColor}`}
                  style={{ color: info.textColor }}
                >
                  {rank}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{info.emoji}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          取引完了数・評価・累計報酬に応じて自動昇格。ランクが上がると特典・高額取引解放！
        </p>
      </div>

      {/* ステータスバナー */}
      {existingCard && (
        <StatusBanner
          status={existingCard.status}
          rejectedReason={existingCard.rejectedReason}
        />
      )}

      {/* メッセージ */}
      {message && (
        <div className={`rounded-xl p-4 mb-6 text-sm ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-100 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {/* 承認済みの場合はカードへのリンク */}
      {existingCard?.status === 'APPROVED' && (
        <div className="text-center py-8">
          <p className="text-2xl mb-3">✅</p>
          <p className="text-gray-600 font-medium mb-4">出品者プロフィールは承認済みです</p>
          <Link
            href={`/guild-card/${user.uid}`}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition inline-block"
          >
            出品者プロフィールを見る
          </Link>
        </div>
      )}

      {/* 申請フォーム */}
      {(isEditable || existingCard?.status === 'PENDING' || existingCard?.status === 'UNDER_REVIEW') &&
        existingCard?.status !== 'APPROVED' &&
        existingCard?.status !== 'SUSPENDED' && (
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── セクション1: 公開プロフィール ── */}
          <fieldset className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
            <legend className="text-sm font-semibold text-gray-700 px-1">📋 公開プロフィール</legend>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                表示名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="出品者の名前（例: やまだ太郎）"
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                キャッチフレーズ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.catchphrase}
                onChange={(e) => setForm((p) => ({ ...p, catchphrase: e.target.value }))}
                placeholder="例: どんな草も刈ります！"
                maxLength={50}
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="text-xs text-gray-300 mt-1">{form.catchphrase.length}/50文字</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                自己紹介 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="得意な作業・経験・こだわりなどを書いてください（依頼者が信頼できるかの判断材料になります）"
                rows={5}
                maxLength={500}
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
              <p className="text-xs text-gray-300 mt-1">{form.bio.length}/500文字</p>
            </div>

            {/* スキル */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                スキル <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SKILL_SUGGESTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={!isEditable}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      form.skills.includes(skill)
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                    } disabled:opacity-50`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {/* カスタムスキル追加 */}
              {isEditable && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.customSkill}
                    onChange={(e) => setForm((p) => ({ ...p, customSkill: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder="その他のスキルを追加"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition"
                  >
                    追加
                  </button>
                </div>
              )}
              {/* 選択済みスキル */}
              {form.skills.filter((s) => !SKILL_SUGGESTIONS.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills.filter((s) => !SKILL_SUGGESTIONS.includes(s)).map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 flex items-center gap-1">
                      {skill}
                      {isEditable && (
                        <button type="button" onClick={() => toggleSkill(skill)} className="text-indigo-300 hover:text-indigo-500">×</button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 対応エリア */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                対応エリア（都道府県） <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                {PREFECTURES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleArea(pref)}
                    disabled={!isEditable}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      form.availableAreas.includes(pref)
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                    } disabled:opacity-50`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
              {form.availableAreas.length > 0 && (
                <p className="text-xs text-indigo-500 mt-1">{form.availableAreas.length}都道府県を選択中</p>
              )}
            </div>
          </fieldset>

          {/* ── セクション2: 本人確認情報（非公開） ── */}
          <fieldset className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
            <legend className="text-sm font-semibold text-gray-700 px-1">🔒 本人確認情報（審査用・非公開）</legend>
            <p className="text-xs text-gray-400 -mt-2">
              依頼者には公開されません。Guildの審査・トラブル対応時のみ使用します。
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                  本名（姓名） <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.realName}
                  onChange={(e) => setForm((p) => ({ ...p, realName: e.target.value }))}
                  placeholder="山田 太郎"
                  required
                  disabled={!isEditable}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                  生年月日 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  required
                  disabled={!isEditable}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                住所 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="東京都渋谷区〇〇 1-2-3"
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                電話番号 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                placeholder="090-0000-0000"
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                身分証の種類 <span className="text-red-400">*</span>
              </label>
              <select
                value={form.idDocumentType}
                onChange={(e) => setForm((p) => ({ ...p, idDocumentType: e.target.value as GuildCard['idDocumentType'] }))}
                required
                disabled={!isEditable}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400 bg-white"
              >
                <option value="">選択してください</option>
                {ID_DOCUMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-300 mt-1">
                ※ 実際の身分証画像のアップロードは審査担当者からメールで案内します
              </p>
            </div>
          </fieldset>

          {/* 同意チェック */}
          {isEditable && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(e) => setForm((p) => ({ ...p, agreedToTerms: e.target.checked }))}
                className="mt-0.5 accent-indigo-500"
              />
              <span className="text-xs text-gray-500">
                <Link href="/terms" className="text-indigo-500 hover:underline" target="_blank">利用規約</Link>
                および
                <Link href="/privacy" className="text-indigo-500 hover:underline" target="_blank">プライバシーポリシー</Link>
                に同意します。提供した情報は出品者プロフィール審査のみに使用されます。
              </span>
            </label>
          )}

          {/* 送信ボタン */}
          {isEditable && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm transition disabled:opacity-50"
            >
              {submitting ? '申請中...' : existingCard?.status === 'REJECTED' ? '⚔️ 再申請する' : '⚔️ 出品者プロフィールを申請する'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
