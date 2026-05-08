'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SERVICE_TYPES, getServiceTypeById } from '@/constants/service-types';
import { PREFECTURES } from '@/constants/areas';
import { getCities } from '@/constants/cities';
import type { ServiceTypeId } from '@/types/service';

interface PackageDraft {
  name: string;
  priceJpy: number;
  templateParams: Record<string, string>;
}

interface AreaDraft {
  prefecture: string;
  cities: string[];
}

export default function NewServicePage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [serviceType, setServiceType] = useState<ServiceTypeId | ''>('');
  const [bio, setBio] = useState('');
  const [packages, setPackages] = useState<PackageDraft[]>([
    { name: '', priceJpy: 0, templateParams: {} },
  ]);
  const [areas, setAreas] = useState<AreaDraft[]>([{ prefecture: '', cities: [] }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const def = useMemo(
    () => (serviceType ? getServiceTypeById(serviceType) : undefined),
    [serviceType]
  );

  function handleServiceTypeChange(id: ServiceTypeId) {
    setServiceType(id);
    setPackages([{ name: '', priceJpy: 0, templateParams: {} }]);
  }

  function updatePackage(idx: number, patch: Partial<PackageDraft>) {
    const next = [...packages];
    next[idx] = { ...next[idx], ...patch };
    // パラメータが揃ったら名前を自動生成
    if (def && (patch.templateParams || patch.name === undefined)) {
      const merged = next[idx].templateParams;
      const allFilled = def.params.every((p) => !p.required || merged[p.id]);
      if (allFilled) {
        next[idx].name = def.buildPackageName(merged);
      }
    }
    setPackages(next);
  }

  function setPackageParam(idx: number, paramId: string, value: string) {
    const next = [...packages];
    next[idx] = {
      ...next[idx],
      templateParams: { ...next[idx].templateParams, [paramId]: value },
    };
    if (def) {
      const allFilled = def.params.every((p) => !p.required || next[idx].templateParams[p.id]);
      if (allFilled) {
        next[idx].name = def.buildPackageName(next[idx].templateParams);
      }
    }
    setPackages(next);
  }

  function addPackage() {
    if (packages.length >= 10) return;
    setPackages([...packages, { name: '', priceJpy: 0, templateParams: {} }]);
  }

  function removePackage(idx: number) {
    if (packages.length <= 1) return;
    setPackages(packages.filter((_, i) => i !== idx));
  }

  function updateArea(idx: number, patch: Partial<AreaDraft>) {
    const next = [...areas];
    next[idx] = { ...next[idx], ...patch };
    setAreas(next);
  }

  function toggleCity(idx: number, cityName: string) {
    const next = [...areas];
    const cities = next[idx].cities;
    next[idx] = {
      ...next[idx],
      cities: cities.includes(cityName)
        ? cities.filter((c) => c !== cityName)
        : [...cities, cityName],
    };
    setAreas(next);
  }

  function addArea() {
    if (areas.length >= 20) return;
    setAreas([...areas, { prefecture: '', cities: [] }]);
  }

  function removeArea(idx: number) {
    if (areas.length <= 1) return;
    setAreas(areas.filter((_, i) => i !== idx));
  }

  async function submit(publish: boolean) {
    setError('');

    if (!serviceType) {
      setError('サービス種別を選択してください');
      return;
    }
    if (packages.some((p) => !p.name || p.priceJpy < 50)) {
      setError('すべてのパッケージで作業量と価格（50円以上）を設定してください');
      return;
    }
    if (areas.some((a) => !a.prefecture)) {
      setError('対応エリアの都道府県を選択してください');
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('認証が必要です');

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType,
          bio,
          packages: packages.map((p) => ({
            name: p.name,
            priceJpy: p.priceJpy,
            templateParams: p.templateParams,
          })),
          areas,
          publish,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '出品の登録に失敗しました');
      router.push(`/services/${data.serviceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">サービスを出品する</h1>
      <p className="text-sm text-gray-500 mb-8">
        できる作業と料金を登録して、依頼者からの購入を待ちましょう。
      </p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* サービス種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            サービス種別 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            運営が用意したサービス種別から選んでください。今後どんどん追加していきます。
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleServiceTypeChange(t.id)}
                className={`text-left p-4 rounded-xl border transition ${
                  serviceType === t.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{t.icon}</span>
                  <span
                    className={`font-semibold text-sm ${
                      serviceType === t.id ? 'text-indigo-700' : 'text-gray-800'
                    }`}
                  >
                    {t.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{t.summary}</p>
              </button>
            ))}
          </div>
        </div>

        {def && (
          <>
            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自己紹介・アピール（任意・200文字まで）
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={200}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm resize-none"
                placeholder="例：庭師経験5年。自前の道具を持参し丁寧に作業します。雨天時は事前に相談・日程変更可能です。"
              />
              <p className="text-xs text-gray-400 mt-1">
                {bio.length}/200 文字
              </p>
            </div>

            {/* パッケージ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                料金プラン <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                作業量と価格を設定したプランを1つ以上作成してください。複数のサイズで提供する場合はプランを追加できます。
              </p>

              <div className="space-y-4">
                {packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        プラン {idx + 1}
                      </span>
                      {packages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackage(idx)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          削除
                        </button>
                      )}
                    </div>

                    {/* 各パラメータ */}
                    {def.params.map((param) => (
                      <div key={param.id} className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          {param.label}
                          {param.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {param.options.map((opt) => {
                            const selected =
                              pkg.templateParams[param.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                  setPackageParam(idx, param.id, opt.value)
                                }
                                className={`text-left p-2.5 rounded-lg border transition ${
                                  selected
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <div
                                  className={`text-xs font-medium ${
                                    selected ? 'text-indigo-700' : 'text-gray-800'
                                  }`}
                                >
                                  {opt.label}
                                </div>
                                {opt.hint && (
                                  <div className="text-[10px] text-gray-500 mt-0.5">
                                    {opt.hint}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* プラン名 */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        プラン名（自動生成・編集可）
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => updatePackage(idx, { name: e.target.value })}
                        maxLength={60}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
                        placeholder="作業量を選択するとプラン名が自動生成されます"
                      />
                    </div>

                    {/* 価格 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        1回あたりの価格（税込）
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          ¥
                        </span>
                        <input
                          type="number"
                          value={pkg.priceJpy || ''}
                          onChange={(e) =>
                            updatePackage(idx, {
                              priceJpy: parseInt(e.target.value) || 0,
                            })
                          }
                          min={50}
                          max={100000}
                          className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
                          placeholder="5,000"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {packages.length < 10 && (
                  <button
                    type="button"
                    onClick={addPackage}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    + プランを追加
                  </button>
                )}
              </div>
            </div>

            {/* 対応エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応エリア <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                作業可能な都道府県・市区町村を選択してください。市区町村を選ばなければ都道府県内全域とみなされます。
              </p>

              <div className="space-y-4">
                {areas.map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        エリア {idx + 1}
                      </span>
                      {areas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArea(idx)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          削除
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        都道府県
                      </label>
                      <select
                        value={area.prefecture}
                        onChange={(e) =>
                          updateArea(idx, { prefecture: e.target.value, cities: [] })
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
                      >
                        <option value="">都道府県を選択</option>
                        {PREFECTURES.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {area.prefecture && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          市区町村（選択しない場合は都道府県全域）
                        </label>
                        <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg p-2 grid grid-cols-2 gap-1">
                          {getCities(area.prefecture).map((c) => {
                            const selected = area.cities.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => toggleCity(idx, c)}
                                className={`text-left px-2 py-1 rounded text-xs transition ${
                                  selected
                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {selected ? '✓ ' : ''}
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {areas.length < 20 && (
                  <button
                    type="button"
                    onClick={addArea}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >
                    + エリアを追加
                  </button>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition"
              >
                下書き保存
              </button>
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={loading}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-medium transition text-sm"
              >
                {loading ? '登録中...' : '出品を公開する'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
