'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { SERVICE_TYPES, getServiceTypeById } from '@/constants/service-types';
import { PREFECTURES } from '@/constants/areas';
import type { Service, ServiceTypeId } from '@/types/service';

export default function ServicesListPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ServiceTypeId | ''>('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'services'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ ...d.data(), serviceId: d.id } as Service));
        setServices(data);
      } catch (err) {
        console.error('failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (selectedType && s.serviceType !== selectedType) return false;
      if (selectedPrefecture) {
        if (!s.areas?.some((a) => a.prefecture === selectedPrefecture)) return false;
      }
      return true;
    });
  }, [services, selectedType, selectedPrefecture]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">サービスを探す</h1>
          <p className="text-sm text-gray-500 mt-1">
            掲載されているサービスから依頼したい人を選んで依頼できます。
          </p>
        </div>
        <Link
          href="/services/new"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
        >
          + サービスを掲載する
        </Link>
      </div>

      {/* フィルター */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-4">
        {/* サービス種別 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            サービス種別
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedType === ''
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {SERVICE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedType === t.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* エリア */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            対応エリア（都道府県）
          </label>
          <select
            value={selectedPrefecture}
            onChange={(e) => setSelectedPrefecture(e.target.value)}
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm bg-white"
          >
            <option value="">すべての都道府県</option>
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          該当する掲載はまだありません
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const def = getServiceTypeById(s.serviceType);
            const minPrice = Math.min(...s.packages.map((p) => p.priceJpy));
            const areaSummary = s.areas
              .slice(0, 2)
              .map((a) => a.prefecture)
              .join('・');
            return (
              <Link
                key={s.serviceId}
                href={`/services/${s.serviceId}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{def?.icon}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {def?.name || s.serviceType}
                  </span>
                </div>
                {s.bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                    {s.bio}
                  </p>
                )}
                <div className="text-xs text-gray-500 mb-3">
                  対応：{areaSummary}
                  {s.areas.length > 2 ? ` 他${s.areas.length - 2}件` : ''}
                </div>
                <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">最安プラン</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ¥{minPrice.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500">〜</span>
                  </span>
                </div>
                {s.completedCount > 0 && (
                  <div className="text-xs text-gray-400 mt-2">
                    完了 {s.completedCount}件
                    {s.averageRating && ` ・ ⭐ ${s.averageRating.toFixed(1)}`}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
