'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { getServiceTypeById } from '@/constants/service-types';
import { getCities } from '@/constants/cities';
import { PaymentBreakdown } from '@/components/payment/PaymentBreakdown';
import type { Service, ServicePackage } from '@/types/service';

export default function ServiceDetailPage() {
  const params = useParams<{ serviceId: string }>();
  const serviceId = params?.serviceId as string;
  const router = useRouter();
  const { user, member, getIdToken } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');
  const [preferredDates, setPreferredDates] = useState<{ date: string; timeSlot: string }[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'services', serviceId));
        if (snap.exists()) {
          setService({ ...snap.data(), serviceId } as Service);
        }
      } catch (err) {
        console.error('failed to fetch service', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);

  const def = useMemo(
    () => (service ? getServiceTypeById(service.serviceType) : undefined),
    [service]
  );

  const selectedPackage: ServicePackage | undefined = useMemo(() => {
    return service?.packages.find((p) => p.packageId === selectedPackageId);
  }, [service, selectedPackageId]);

  const isOwner = !!user && service?.ownerId === user.uid;

  // 対応エリアの都道府県（重複排除）
  const supportedPrefectures = useMemo(() => {
    if (!service) return [] as string[];
    return Array.from(new Set(service.areas.map((a) => a.prefecture)));
  }, [service]);

  // 選択された都道府県で対応している市区町村
  const supportedCities = useMemo(() => {
    if (!service || !prefecture) return [] as string[];
    const area = service.areas.find((a) => a.prefecture === prefecture);
    if (!area) return [];
    if (area.cities.length === 0) return getCities(prefecture);
    return area.cities;
  }, [service, prefecture]);

  async function handlePurchase() {
    if (!serviceId || !selectedPackageId || !prefecture || !city) {
      setError('プラン・作業場所を選択してください');
      return;
    }
    setError('');
    setPurchasing(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('ログインが必要です');

      const res = await fetch(`/api/services/${serviceId}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: selectedPackageId,
          prefecture,
          city,
          town: town || undefined,
          preferredDates: preferredDates.length > 0
            ? preferredDates.map((d) => ({
                date: d.date,
                ...(d.timeSlot ? { timeSlot: d.timeSlot } : {}),
              }))
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '注文の作成に失敗しました');

      // 既存のクエスト詳細ページへ（決済へ進む）
      router.push(`/quests/${data.questId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '購入に失敗しました');
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">読み込み中...</div>;
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-gray-500">出品が見つかりません</p>
        <Link href="/services" className="text-indigo-500 hover:underline text-sm mt-3 inline-block">
          ← 一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/services" className="text-sm text-gray-400 hover:text-indigo-500 mb-4 inline-block">
        ← 一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{def?.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{def?.name}</h1>
            <p className="text-xs text-gray-500">{def?.summary}</p>
          </div>
        </div>
        {service.bio && (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-4">
            {service.bio}
          </p>
        )}
        {service.completedCount > 0 && (
          <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            完了実績 {service.completedCount}件
            {service.averageRating && ` ・ ⭐ ${service.averageRating.toFixed(1)}`}
          </div>
        )}
        {def?.description && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-4 text-xs text-amber-700 leading-relaxed">
            ℹ️ {def.description}
          </div>
        )}
      </div>

      {/* 対応エリア */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">対応エリア</h2>
        <div className="space-y-2">
          {service.areas.map((a, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <span className="font-medium">{a.prefecture}</span>
              {a.cities.length > 0 ? (
                <span className="text-gray-500 text-xs ml-2">
                  {a.cities.slice(0, 5).join('、')}
                  {a.cities.length > 5 ? ` 他${a.cities.length - 5}件` : ''}
                </span>
              ) : (
                <span className="text-gray-500 text-xs ml-2">全域</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* プラン選択 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">料金プラン</h2>
        <div className="space-y-2">
          {service.packages.map((p) => (
            <button
              key={p.packageId}
              type="button"
              onClick={() => !isOwner && setSelectedPackageId(p.packageId)}
              disabled={isOwner}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selectedPackageId === p.packageId
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${isOwner ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                <span className="text-lg font-bold text-indigo-600">
                  ¥{p.priceJpy.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 購入フォーム（自分の出品でなく、プラン選択済みのとき） */}
      {!isOwner && selectedPackage && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800">作業場所と希望日時</h2>

          {/* 作業場所 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              作業場所 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={prefecture}
                onChange={(e) => {
                  setPrefecture(e.target.value);
                  setCity('');
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
              >
                <option value="">都道府県を選択</option>
                {supportedPrefectures.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!prefecture}
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">市区町村を選択</option>
                {supportedCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm mt-2"
              placeholder="町名・番地（例: 芝中田2丁目）任意"
            />
          </div>

          {/* 希望日時 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              希望日時の候補（任意・最大5件）
            </label>
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

          <PaymentBreakdown totalAmount={selectedPackage.priceJpy} isWithholdingApplicable={false} />

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* 発注資格未充足の警告 */}
          {member && (member.identityStatus !== 'verified' || !member.stripeCustomerId) && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
              ⚠️ 購入には本人確認とStripe決済登録が必要です。
              <Link href="/profile" className="underline font-medium ml-1">
                プロフィールから設定
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={handlePurchase}
            disabled={purchasing || !prefecture || !city}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-medium transition text-sm"
          >
            {purchasing ? '注文作成中...' : `¥${selectedPackage.priceJpy.toLocaleString()} で注文する`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            注文を作成すると、決済画面で支払いを行います。
          </p>
        </div>
      )}

      {isOwner && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          ℹ️ あなたが出品したサービスです。自分自身では購入できません。
        </div>
      )}
    </div>
  );
}
