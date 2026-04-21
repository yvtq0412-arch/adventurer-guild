'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCategoriesByType, isWithholdingRequired } from '@/constants/quest-categories';
import { PREFECTURES } from '@/constants/areas';
import { getCities } from '@/constants/cities';
import {
  getTemplatesByCategory,
  getTemplateById,
  isCategoryTemplated,
} from '@/constants/quest-templates';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import { TermsAgreementModal } from '@/components/terms/TermsAgreementModal';
import type { QuestCategory, QuestType } from '@/types/quest';

export default function NewQuestPage() {
  const router = useRouter();
  const { getIdToken, member } = useAuth();

  const [questType, setQuestType] = useState<QuestType>('personal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('yard_work');
  const [templateId, setTemplateId] = useState<string>('');
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [preferredDates, setPreferredDates] = useState<{ date: string; timeSlot: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [confirmedProhibited, setConfirmedProhibited] = useState(false);

  const categories = getCategoriesByType(questType);
  const templatesForCategory = useMemo(() => getTemplatesByCategory(category), [category]);
  const categoryHasTemplates = templatesForCategory.length > 0;
  const selectedTemplate = templateId ? getTemplateById(templateId) : undefined;

  // テンプレートのパラメータがすべて埋まっているか
  const templateParamsComplete =
    selectedTemplate
      ? selectedTemplate.params.every((p) => !p.required || templateParams[p.id])
      : false;

  // プレビュー用の自動生成タイトル・説明文（サーバー側と同ロジック）
  const previewTitle = selectedTemplate && templateParamsComplete
    ? selectedTemplate.buildTitle(templateParams)
    : '';
  const previewDescription = selectedTemplate && templateParamsComplete
    ? selectedTemplate.buildDescription(templateParams)
    : '';

  function handleTypeChange(type: QuestType) {
    setQuestType(type);
    const firstCat = getCategoriesByType(type)[0];
    if (firstCat) {
      setCategory(firstCat.id);
      setTemplateId('');
      setTemplateParams({});
    }
  }

  function handleCategoryChange(newCategory: QuestCategory) {
    setCategory(newCategory);
    setTemplateId('');
    setTemplateParams({});
    // テンプレート使用時は title/description はサーバー自動生成なのでクリア
    setTitle('');
    setDescription('');
  }

  function handleTemplateSelect(id: string) {
    setTemplateId(id);
    setTemplateParams({});
    setTitle('');
    setDescription('');
  }

  async function doSubmit() {
    setError('');
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('認証が必要です');

      // テンプレート経由の場合、title/descriptionはサーバー側で自動生成される
      // （プレビューで見せる文字列を参考値として送るが、サーバーは上書きする）
      const payloadTitle = selectedTemplate ? previewTitle : title;
      const payloadDescription = selectedTemplate ? previewDescription : description;

      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: payloadTitle,
          description: payloadDescription,
          questType,
          category,
          ...(selectedTemplate
            ? { templateId: selectedTemplate.id, templateParams }
            : {}),
          prefecture,
          city,
          town: town || undefined,
          totalAmount,
          deadline: deadline || undefined,
          preferredDates: preferredDates.length > 0
            ? preferredDates.map((d) => ({
                date: d.date,
                ...(d.timeSlot ? { timeSlot: d.timeSlot } : {}),
              }))
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '依頼作成に失敗しました');
      router.push(`/quests/${data.questId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 規約未同意の場合はモーダルを表示
    if (!member?.termsAgreedAt) {
      setShowTermsModal(true);
      return;
    }
    doSubmit();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">新しい依頼を作成</h1>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 個人/企業 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">依頼タイプ</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleTypeChange('personal')}
              className={`p-4 rounded-xl border text-center transition ${questType === 'personal' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-sm font-semibold">個人の依頼</div>
              <div className="text-xs text-gray-400 mt-0.5">生活のお困りごと</div>
            </button>
            <button type="button" onClick={() => handleTypeChange('business')}
              className={`p-4 rounded-xl border text-center transition ${questType === 'business' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              <div className="text-2xl mb-1">🏢</div>
              <div className="text-sm font-semibold">企業の依頼</div>
              <div className="text-xs text-gray-400 mt-0.5">事業に関わる作業</div>
            </button>
          </div>
        </div>

        {/* タイトル（テンプレート未使用のカテゴリのみ自由入力） */}
        {!categoryHasTemplates && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">依頼タイトル</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
              placeholder={questType === 'personal' ? '例: 庭の草取りをお願いしたい' : '例: 倉庫の棚卸し作業スタッフ募集'} />
          </div>
        )}

        {/* 作業場所 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作業場所
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select value={prefecture} onChange={(e) => { setPrefecture(e.target.value); setCity(''); }} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white">
              <option value="">都道府県を選択</option>
              {PREFECTURES.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} required
              disabled={!prefecture}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400">
              <option value="">市区町村を選択</option>
              {prefecture && getCities(prefecture).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__other">その他（一覧にない場合）</option>
            </select>
          </div>
          <input
            type="text"
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm mt-2"
            placeholder="町名・番地（例: 芝中田2丁目、本町3-5-1）任意"
          />
          <p className="text-xs text-gray-400 mt-1">💡 町名まで入力すると、近くの受注者（冒険者）に見つけてもらいやすくなります</p>
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const templated = isCategoryTemplated(cat.id);
              return (
                <button key={cat.id} type="button" onClick={() => handleCategoryChange(cat.id)}
                  className={`relative p-2.5 rounded-lg border text-center transition ${category === cat.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                  <div className="text-lg">{cat.icon}</div>
                  <div className="text-xs mt-1 leading-tight">{cat.label}</div>
                  {templated && (
                    <span className="absolute top-1 right-1 text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold leading-none">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {isWithholdingRequired(category) && (
            <p className="text-xs text-orange-500 mt-2">※ このカテゴリは源泉徴収の対象です</p>
          )}
        </div>

        {/* 作業テンプレート選択（カテゴリがテンプレート対応済みの場合のみ） */}
        {categoryHasTemplates && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業内容を選択 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              💡 あらかじめ用意された作業内容からお選びください。作業量を指定すれば、タイトルと依頼内容が自動で作成されます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templatesForCategory.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tpl.id)}
                  className={`text-left p-3 rounded-lg border transition ${templateId === tpl.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tpl.icon}</span>
                    <span className={`text-sm font-semibold ${templateId === tpl.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tpl.summary}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* テンプレートのパラメータ入力 */}
        {selectedTemplate && (
          <div className="space-y-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">作業量を指定してください</p>
            {selectedTemplate.params.map((param) => (
              <div key={param.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {param.label}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {param.options.map((opt) => {
                    const selected = templateParams[param.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setTemplateParams((prev) => ({ ...prev, [param.id]: opt.value }))
                        }
                        className={`text-left p-3 rounded-lg border transition ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className={`text-sm font-medium ${selected ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {opt.label}
                        </div>
                        {opt.hint && (
                          <div className="text-xs text-gray-500 mt-0.5">{opt.hint}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* プレビュー */}
            {templateParamsComplete && (
              <div className="bg-white border border-indigo-100 rounded-lg p-3 mt-3">
                <p className="text-xs font-semibold text-indigo-600 mb-1">自動生成される依頼</p>
                <p className="text-sm font-semibold text-gray-800">{previewTitle}</p>
                <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap font-sans leading-relaxed">
                  {previewDescription}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 説明（テンプレート未使用のカテゴリのみ自由入力） */}
        {!categoryHasTemplates && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">依頼内容</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} maxLength={5000}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm resize-none"
              placeholder={questType === 'personal'
                ? '例: 庭の草取りと落ち葉の袋詰め（45ℓ袋×3袋分）をお願いします'
                : '例: 倉庫内の商品をカテゴリ別に仕分け・棚入れ（約200点）をお願いします'} />
            {/* 時間指定キーワード検出警告 */}
            {/\d+\s*時(間|〜|から|まで)|終日|丸\d+日|〜\d+時|\d+時〜/.test(description) && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                <span className="text-amber-500 text-base flex-shrink-0">⚠️</span>
                <div className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-semibold">時間指定の表現が含まれています。</span>
                  「○時から○時まで作業」のような記載は、労働基準法上の<span className="font-semibold">雇用契約と見なされる恐れ</span>があります。
                  作業内容・量（例：「草取り 45ℓ袋×2袋分」「棚入れ 約200点」）で記載するようにしてください。
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              💡 依頼内容は<span className="font-medium">作業の内容・量</span>で記載してください。「○時から○時まで」のような時間指定のみの記載はお避けください。
            </p>
          </div>
        )}

        {/* 金額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">依頼金額（税込）</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
            <input type="number" value={totalAmount || ''} onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
              required min={50} max={100000}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
              placeholder="5,000" />
          </div>
        </div>

        {totalAmount >= 50 && (
          <PaymentBreakdown totalAmount={totalAmount} isWithholdingApplicable={isWithholdingRequired(category)} />
        )}

        {/* 希望日時候補 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            希望日時の候補（任意・最大5件）
          </label>
          <p className="text-xs text-gray-400 mb-2">
            候補を追加しておくと、チャットでの日程調整がスムーズになります
          </p>

          {preferredDates.map((pd, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={pd.date}
                onChange={(e) => {
                  const next = [...preferredDates];
                  next[idx] = { ...next[idx], date: e.target.value };
                  setPreferredDates(next);
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
              />
              <select
                value={pd.timeSlot}
                onChange={(e) => {
                  const next = [...preferredDates];
                  next[idx] = { ...next[idx], timeSlot: e.target.value };
                  setPreferredDates(next);
                }}
                className="w-32 border border-gray-200 rounded-lg px-2 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
              >
                <option value="">時間帯</option>
                <option value="morning">午前（9〜12時）</option>
                <option value="afternoon">午後（12〜17時）</option>
                <option value="evening">夕方以降（17時〜）</option>
                <option value="anytime">終日OK</option>
              </select>
              <button
                type="button"
                onClick={() => setPreferredDates(preferredDates.filter((_, i) => i !== idx))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition text-sm"
              >
                ✕
              </button>
            </div>
          ))}

          {preferredDates.length < 5 && (
            <button
              type="button"
              onClick={() => setPreferredDates([...preferredDates, { date: '', timeSlot: '' }])}
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 mt-1"
            >
              <span className="text-base leading-none">+</span> 候補を追加
            </button>
          )}
        </div>

        {/* 期限（旧） */}
        <input type="hidden" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

        {/* 毎回の禁止依頼確認 */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedProhibited}
              onChange={(e) => setConfirmedProhibited(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-500 shrink-0"
            />
            <div className="text-sm text-red-700 leading-relaxed">
              この依頼は
              <a href="/prohibited" target="_blank" className="underline font-medium hover:text-red-800">
                禁止依頼ガイドライン
              </a>
              に該当しないことを確認しました。（白タク行為・無資格医療・無資格工事・非弁行為・時間拘束型の労働契約等を含まないこと）
            </div>
          </label>
        </div>

        {/* 送信前バリデーション:
            - テンプレート対応カテゴリ: templateId + 必須パラメータが全て埋まっている
            - それ以外: タイトル・説明が自由入力されている */}
        <button
          type="submit"
          disabled={
            loading ||
            totalAmount < 50 ||
            !prefecture ||
            !city ||
            !confirmedProhibited ||
            (categoryHasTemplates
              ? !selectedTemplate || !templateParamsComplete
              : !title || !description)
          }
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-medium transition text-sm"
        >
          {loading ? '作成中...' : '依頼を登録する'}
        </button>
      </form>

      {showTermsModal && (
        <TermsAgreementModal
          mode="post"
          onAgreed={() => {
            setShowTermsModal(false);
            doSubmit();
          }}
          onCancel={() => setShowTermsModal(false)}
        />
      )}
    </div>
  );
}
