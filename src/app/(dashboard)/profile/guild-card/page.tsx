'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { PREFECTURES } from '@/constants/areas';
import type { GuildCard } from '@/types/guild-card';

const SKILL_CATEGORIES: { label: string; icon: string; skills: string[] }[] = [
  {
    label: '造園・外構',
    icon: '🌿',
    skills: ['草刈り', '庭木剪定', '除草', '植栽・植え替え', '芝刈り', '落ち葉清掃', '砂利敷き'],
  },
  {
    label: '清掃・洗浄',
    icon: '🧹',
    skills: ['高圧洗浄', '清掃・掃除', 'オフィス清掃', 'エアコン清掃', 'ハウスクリーニング', '排水溝清掃'],
  },
  {
    label: '運搬・作業',
    icon: '📦',
    skills: ['引越し補助', '荷物搬入出', '家具組み立て', '家具移動', '不用品回収', '倉庫作業', '棚卸し補助'],
  },
  {
    label: '生活・家事',
    icon: '🏠',
    skills: ['買い物代行', '料理・食事準備', 'ペットの世話', 'ベビーシッター', '介護補助', '洗濯・アイロン'],
  },
  {
    label: '代行・付き添い',
    icon: '🪑',
    skills: ['行列代行', '順番待ち代行', '手続き代行', '郵便局・銀行待ち', 'チケット購入代行', '通院付き添い', '荷物の受け取り代行'],
  },
  {
    label: 'SNS・PR',
    icon: '📱',
    skills: ['SNS投稿', 'グルメレビュー', '写真撮影', '商品レビュー', 'インフルエンサー', '動画撮影'],
  },
  {
    label: '相談・アドバイス',
    icon: '💬',
    skills: ['キャリア相談', '経営相談', 'IT相談', '法律相談', '税務相談', '生活相談'],
  },
  {
    label: 'その他',
    icon: '🔧',
    skills: ['イベントスタッフ', '看板設置', 'ポスティング', '農業補助', '雪かき', '害虫駆除補助'],
  },
];

// フラット一覧（カスタムスキルの重複チェック用）
const ALL_SKILL_SUGGESTIONS = SKILL_CATEGORIES.flatMap((c) => c.skills);

const WORK_STYLE_OPTIONS: { value: NonNullable<GuildCard['workStyle']>[number]; label: string; icon: string; desc: string }[] = [
  { value: 'careful',        label: '丁寧・確実',    icon: '🎯', desc: '一つ一つを丁寧に、完璧な仕上がりを大切にします' },
  { value: 'speedy',         label: 'スピード重視',  icon: '⚡', desc: '素早い対応・スピーディな作業を心がけています' },
  { value: 'cost_effective', label: 'コスパ重視',    icon: '💰', desc: '手頃な価格で最大限の成果を提供します' },
  { value: 'communicative',  label: 'コミュニケーション重視', icon: '💬', desc: 'こまめな報告・確認を大切にします' },
  { value: 'flexible',       label: '柔軟対応',      icon: '🔄', desc: '急な変更や特別な要望にも対応します' },
];

const AVAILABLE_DAYS: { value: NonNullable<GuildCard['availableDays']>[number]; label: string }[] = [
  { value: 'mon', label: '月' },
  { value: 'tue', label: '火' },
  { value: 'wed', label: '水' },
  { value: 'thu', label: '木' },
  { value: 'fri', label: '金' },
  { value: 'sat', label: '土' },
  { value: 'sun', label: '日' },
];

const TIME_SLOTS: { value: NonNullable<GuildCard['availableTimeSlots']>[number]; label: string; time: string }[] = [
  { value: 'morning', label: '早朝',  time: '5:00〜9:00' },
  { value: 'daytime', label: '日中',  time: '9:00〜18:00' },
  { value: 'evening', label: '夕方',  time: '18:00〜21:00' },
  { value: 'night',   label: '夜間',  time: '21:00〜' },
];

type ProfileForm = {
  // 基本プロフィール
  catchphrase: string;
  bio: string;
  skills: string[];
  customSkill: string;
  availableAreas: string[];
  // 詳細プロフィール
  workHistory: string;
  certifications: string[];
  customCertification: string;
  achievementNote: string;
  workStyle: NonNullable<GuildCard['workStyle']>;
  availableDays: NonNullable<GuildCard['availableDays']>;
  availableTimeSlots: NonNullable<GuildCard['availableTimeSlots']>;
  maxWorkDaysPerWeek: string;
  portfolioUrl: string;
  snsUrl: string;
  messageToClients: string;
  minimumFee: string;
};

export default function ProfileGuildCardPage() {
  const { user, getIdToken, loading: authLoading } = useAuth();

  const [card, setCard] = useState<GuildCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ProfileForm>({
    catchphrase: '',
    bio: '',
    skills: [],
    customSkill: '',
    availableAreas: [],
    workHistory: '',
    certifications: [],
    customCertification: '',
    achievementNote: '',
    workStyle: [],
    availableDays: [],
    availableTimeSlots: [],
    maxWorkDaysPerWeek: '',
    portfolioUrl: '',
    snsUrl: '',
    messageToClients: '',
    minimumFee: '',
  });

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchCard = async () => {
      try {
        const snap = await getDoc(doc(db, 'guild_cards', user.uid));
        if (snap.exists()) {
          const c = snap.data() as GuildCard;
          setCard(c);
          setForm({
            catchphrase: c.catchphrase || '',
            bio: c.bio || '',
            skills: c.skills || [],
            customSkill: '',
            availableAreas: c.availableAreas || [],
            workHistory: c.workHistory || '',
            certifications: c.certifications || [],
            customCertification: '',
            achievementNote: c.achievementNote || '',
            workStyle: c.workStyle || [],
            availableDays: c.availableDays || [],
            availableTimeSlots: c.availableTimeSlots || [],
            maxWorkDaysPerWeek: c.maxWorkDaysPerWeek != null ? String(c.maxWorkDaysPerWeek) : '',
            portfolioUrl: c.portfolioUrl || '',
            snsUrl: c.snsUrl || '',
            messageToClients: c.messageToClients || '',
            minimumFee: c.minimumFee != null ? String(c.minimumFee) : '',
          });
        }
      } finally {
        setLoadingCard(false);
      }
    };
    fetchCard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // ── トグルヘルパー ──
  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  const toggleSkill = (s: string) =>
    setForm((p) => ({ ...p, skills: toggleArr(p.skills, s) }));

  const addCustomSkill = () => {
    const s = form.customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((p) => ({ ...p, skills: [...p.skills, s], customSkill: '' }));
    }
  };

  // カスタムスキル（サジェスト一覧にないもの）
  const customSkills = form.skills.filter((s) => !ALL_SKILL_SUGGESTIONS.includes(s));

  const addCustomCertification = () => {
    const s = form.customCertification.trim();
    if (s && !form.certifications.includes(s)) {
      setForm((p) => ({ ...p, certifications: [...p.certifications, s], customCertification: '' }));
    }
  };

  const removeCertification = (s: string) =>
    setForm((p) => ({ ...p, certifications: p.certifications.filter((c) => c !== s) }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !card) return;
    setSaving(true);
    setError('');
    try {
      const token = await getIdToken();
      // guild_cards コレクションを直接更新
      const payload: Partial<GuildCard> = {
        catchphrase: form.catchphrase,
        bio: form.bio,
        skills: form.skills,
        availableAreas: form.availableAreas,
        workHistory: form.workHistory || undefined,
        certifications: form.certifications.length > 0 ? form.certifications : undefined,
        achievementNote: form.achievementNote || undefined,
        workStyle: form.workStyle.length > 0 ? form.workStyle : undefined,
        availableDays: form.availableDays.length > 0 ? form.availableDays : undefined,
        availableTimeSlots: form.availableTimeSlots.length > 0 ? form.availableTimeSlots : undefined,
        maxWorkDaysPerWeek: form.maxWorkDaysPerWeek ? parseInt(form.maxWorkDaysPerWeek) : undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        snsUrl: form.snsUrl || undefined,
        messageToClients: form.messageToClients || undefined,
        minimumFee: form.minimumFee ? parseInt(form.minimumFee) : undefined,
      };

      // undefinedキーを除去（Firestoreはundefinedをエラーにする）
      const clean = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      );

      await updateDoc(doc(db, 'guild_cards', user.uid), {
        ...clean,
        updatedAt: serverTimestamp(),
      });

      // users コレクションの displayName も同期（catchphraseは不要だがtokenが必要なので念のため）
      void token; // used for auth check above

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingCard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">⚔️</p>
        <p className="text-gray-600 font-medium mb-2">ギルドカードがありません</p>
        <p className="text-sm text-gray-400 mb-6">
          プロフィール詳細を設定するには、まずギルドカードを申請してください。
        </p>
        <Link
          href="/guild-card/apply"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition"
        >
          ギルドカードを申請する
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/profile" className="hover:text-indigo-500 transition">アカウント設定</Link>
        <span>/</span>
        <span className="text-gray-600">ギルドカード編集</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ギルドカードを編集</h1>
        <p className="text-sm text-gray-500">
          依頼者があなたを選ぶ判断材料になります。できるだけ詳しく記入してください。
        </p>
      </div>

      {/* ステータス表示 */}
      {card.status === 'APPROVED' && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-medium">✅ ギルドカード承認済み</span>
          </div>
          <Link href={`/guild-card/${user?.uid}`} className="text-green-600 text-xs underline hover:text-green-700">
            公開ページを見る →
          </Link>
        </div>
      )}
      {card.status === 'PENDING' || card.status === 'UNDER_REVIEW' ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
          <p className="text-yellow-700 text-sm font-medium">⏳ 審査中です。審査完了後、こちらからプロフィールを更新できます。</p>
        </div>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── セクション1: 基本プロフィール ── */}
        <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">📋 基本プロフィール</h2>
            <p className="text-xs text-gray-400 mt-0.5">依頼者が最初に目にする情報です</p>
          </div>
          <div className="p-6 space-y-5">

            {/* キャッチフレーズ */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                キャッチフレーズ <span className="text-red-400">*</span>
                <span className="font-normal text-gray-400 ml-1">（50文字以内）</span>
              </label>
              <input
                type="text"
                value={form.catchphrase}
                onChange={(e) => setForm((p) => ({ ...p, catchphrase: e.target.value }))}
                placeholder="例: どんな草も刈ります！丁寧・迅速が自慢です"
                maxLength={50}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{form.catchphrase.length}/50</p>
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                自己紹介 <span className="text-red-400">*</span>
                <span className="font-normal text-gray-400 ml-1">（依頼者が信頼できるかの判断材料）</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="得意な作業・経験年数・こだわり・人柄などを書いてください。&#10;&#10;例: 造園の仕事を7年経験しています。草刈りや剪定はもちろん、庭石の配置や植栽のアドバイスも得意です。作業前後の写真を送ります！"
                rows={5}
                maxLength={500}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{form.bio.length}/500</p>
            </div>

            {/* スキル */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-gray-600">
                  スキルタグ <span className="text-red-400">*</span>
                </label>
                {form.skills.length > 0 && (
                  <span className="text-xs text-indigo-500 font-medium">{form.skills.length}件選択中</span>
                )}
              </div>

              {/* カテゴリ別グリッド */}
              <div className="space-y-4">
                {SKILL_CATEGORIES.map((cat) => (
                  <div key={cat.label}>
                    <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                      <span>{cat.icon}</span> {cat.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {cat.skills.map((skill) => {
                        const selected = form.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`text-xs px-3 py-2 rounded-lg border transition text-left truncate ${
                              selected
                                ? 'bg-indigo-500 border-indigo-500 text-white font-medium'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}
                          >
                            {selected && <span className="mr-1">✓</span>}{skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* カスタムスキル追加 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-2">✏️ 上記にないスキルを追加</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.customSkill}
                    onChange={(e) => setForm((p) => ({ ...p, customSkill: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder="例: フローリング補修、電球交換..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition whitespace-nowrap"
                  >
                    ＋ 追加
                  </button>
                </div>
                {customSkills.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                    {customSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 flex items-center justify-between gap-1"
                      >
                        <span className="truncate">{skill}</span>
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="text-indigo-300 hover:text-indigo-500 flex-shrink-0 text-base leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 対応エリア */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                対応エリア <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                {PREFECTURES.map((pref) => (
                  <button
                    key={pref.code}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, availableAreas: toggleArr(p.availableAreas, pref.name) }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      form.availableAreas.includes(pref.name)
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
                    }`}
                  >
                    {pref.name}
                  </button>
                ))}
              </div>
              {form.availableAreas.length > 0 && (
                <p className="text-xs text-indigo-500 mt-1">{form.availableAreas.length}都道府県を選択中</p>
              )}
            </div>
          </div>
        </section>

        {/* ── セクション2: 実績・信頼情報 ── */}
        <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">🏆 実績・信頼情報</h2>
            <p className="text-xs text-gray-400 mt-0.5">依頼者に安心してもらうための情報</p>
          </div>
          <div className="p-6 space-y-5">

            {/* 職歴・経歴 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                職歴・経歴 <span className="text-gray-400 font-normal">（任意）</span>
              </label>
              <textarea
                value={form.workHistory}
                onChange={(e) => setForm((p) => ({ ...p, workHistory: e.target.value }))}
                placeholder="例: 造園会社にて5年間勤務。個人宅から公園まで幅広い現場を経験。その後独立し、フリーランスとして活動中。"
                rows={3}
                maxLength={300}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{form.workHistory.length}/300</p>
            </div>

            {/* 保有資格 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                保有資格・免許 <span className="text-gray-400 font-normal">（任意）</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.customCertification}
                  onChange={(e) => setForm((p) => ({ ...p, customCertification: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCertification())}
                  placeholder="例: 2級造園施工管理技士 / 普通自動車免許"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="button"
                  onClick={addCustomCertification}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition whitespace-nowrap"
                >
                  追加
                </button>
              </div>
              {form.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.certifications.map((cert) => (
                    <span key={cert} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 flex items-center gap-1">
                      🏅 {cert}
                      <button type="button" onClick={() => removeCertification(cert)} className="text-amber-300 hover:text-amber-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 実績PR */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                実績のポイントPR <span className="text-gray-400 font-normal">（任意・50文字以内）</span>
              </label>
              <input
                type="text"
                value={form.achievementNote}
                onChange={(e) => setForm((p) => ({ ...p, achievementNote: e.target.value }))}
                placeholder="例: 草刈り・庭木剪定 累計200件以上 / リピーター率90%"
                maxLength={50}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* 依頼者へのメッセージ */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                依頼者へのひとことPR <span className="text-gray-400 font-normal">（任意・100文字以内）</span>
              </label>
              <textarea
                value={form.messageToClients}
                onChange={(e) => setForm((p) => ({ ...p, messageToClients: e.target.value }))}
                placeholder="例: 作業前後は必ず写真を送ります。不明点はお気軽にチャットでどうぞ！丁寧な対応で安心してお任せください。"
                rows={2}
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{form.messageToClients.length}/100</p>
            </div>
          </div>
        </section>

        {/* ── セクション3: 作業スタイル ── */}
        <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">⚙️ 作業スタイル</h2>
            <p className="text-xs text-gray-400 mt-0.5">あなたの仕事のスタイルを選択（複数可）</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORK_STYLE_OPTIONS.map((opt) => {
                const selected = form.workStyle.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, workStyle: toggleArr(p.workStyle, opt.value) }))}
                    className={`text-left p-4 rounded-xl border transition ${
                      selected
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{opt.icon}</span>
                      <span className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {opt.label}
                      </span>
                      {selected && (
                        <span className="ml-auto text-indigo-500 text-xs font-bold">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── セクション4: 稼働情報 ── */}
        <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">📅 稼働情報</h2>
            <p className="text-xs text-gray-400 mt-0.5">作業可能な日時を設定してください</p>
          </div>
          <div className="p-6 space-y-5">

            {/* 作業可能曜日 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">作業可能な曜日</label>
              <div className="flex gap-2 flex-wrap">
                {AVAILABLE_DAYS.map((d) => {
                  const sel = form.availableDays.includes(d.value);
                  const isWeekend = d.value === 'sat' || d.value === 'sun';
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, availableDays: toggleArr(p.availableDays, d.value) }))}
                      className={`w-11 h-11 rounded-xl text-sm font-semibold transition border ${
                        sel
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : isWeekend
                          ? 'bg-white border-gray-200 text-red-400 hover:border-red-300'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 作業可能時間帯 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">作業可能な時間帯</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const sel = form.availableTimeSlots.includes(slot.value);
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, availableTimeSlots: toggleArr(p.availableTimeSlots, slot.value) }))}
                      className={`p-3 rounded-xl border text-center transition ${
                        sel
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-semibold ${sel ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {slot.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{slot.time}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 週あたり最大稼働日数 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                週あたり最大稼働日数 <span className="text-gray-400 font-normal">（任意）</span>
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={form.maxWorkDaysPerWeek}
                  onChange={(e) => setForm((p) => ({ ...p, maxWorkDaysPerWeek: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">未設定</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>週{n}日まで</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 最低受注金額 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                最低受注金額 <span className="text-gray-400 font-normal">（任意）</span>
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                <input
                  type="number"
                  value={form.minimumFee}
                  onChange={(e) => setForm((p) => ({ ...p, minimumFee: e.target.value }))}
                  min={0}
                  step={100}
                  placeholder="例: 3000"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">設定すると依頼者が目安にできます</p>
            </div>
          </div>
        </section>

        {/* ── セクション5: SNS・ポートフォリオ ── */}
        <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">🔗 外部リンク</h2>
            <p className="text-xs text-gray-400 mt-0.5">実績・作業例を見てもらえます（任意）</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">ポートフォリオ / ブログURL</label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">SNS URL（Twitter / Instagram など）</label>
              <input
                type="url"
                value={form.snsUrl}
                onChange={(e) => setForm((p) => ({ ...p, snsUrl: e.target.value }))}
                placeholder="https://twitter.com/username"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        </section>

        {/* エラー / 成功 */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        {/* 保存ボタン */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || form.skills.length === 0 || form.availableAreas.length === 0}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-3 rounded-xl font-semibold text-sm transition"
          >
            {saving ? '保存中...' : '変更を保存'}
          </button>
          {saved && <p className="text-sm text-green-600 font-medium">✓ 保存しました</p>}
        </div>
      </form>
    </div>
  );
}
