'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { QuestCard } from '@/components/quest/QuestCard';
import { PERSONAL_CATEGORIES, BUSINESS_CATEGORIES, QUEST_CATEGORIES } from '@/constants/quest-categories';
import { PREFECTURES } from '@/constants/areas';
import { useAuth } from '@/hooks/useAuth';
import type { Quest, QuestCategory, QuestType } from '@/types/quest';
import type { QuestCategoryInfo } from '@/constants/quest-categories';

const COMMON_IDS: string[] = ['consultation', 'other'];

export default function QuestBoardPage() {
  const { member } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | QuestType>('all');

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'quests'),
          where('status', '==', 'ESCROWED'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const snapshot = await getDocs(q);
        setQuests(snapshot.docs.map((doc) => doc.data() as Quest));
      } catch (err) {
        console.error('クエスト取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuests();
  }, []);

  // カテゴリ別件数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    quests.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [quests]);

  // フィルタリング
  const filteredQuests = useMemo(() => {
    let result = quests;
    if (selectedTab !== 'all') {
      const catIds = (selectedTab === 'personal'
        ? PERSONAL_CATEGORIES
        : BUSINESS_CATEGORIES
      ).map((c) => c.id) as string[];
      result = result.filter((q) => catIds.includes(q.category) || COMMON_IDS.includes(q.category));
    }
    if (selectedCategory !== 'all') {
      result = result.filter((q) => q.category === selectedCategory);
    }
    if (selectedPrefecture) {
      result = result.filter((q) => q.prefecture === selectedPrefecture);
    }
    if (selectedCity) {
      result = result.filter((q) => q.city?.includes(selectedCity));
    }
    return result;
  }, [quests, selectedCategory, selectedPrefecture, selectedCity, selectedTab]);

  // タブに応じたカテゴリ一覧
  const displayCategories: QuestCategoryInfo[] = useMemo(() => {
    if (selectedTab === 'personal') return PERSONAL_CATEGORIES;
    if (selectedTab === 'business') return BUSINESS_CATEGORIES;
    return QUEST_CATEGORIES;
  }, [selectedTab]);

  function handleCategoryClick(catId: QuestCategory) {
    setSelectedCategory(selectedCategory === catId ? 'all' : catId);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">依頼を探す</h1>
          <p className="text-sm text-gray-500 mt-1">募集中の依頼 {quests.length}件</p>
        </div>
        {member && (
          <Link href="/quests/new" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
            📋 依頼を投稿する
          </Link>
        )}
      </div>

      {/* 個人/企業タブ */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all' as const, label: 'すべて', icon: '📋' },
          { id: 'personal' as const, label: '個人の依頼', icon: '🏠' },
          { id: 'business' as const, label: '企業の依頼', icon: '🏢' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setSelectedTab(tab.id); setSelectedCategory('all'); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedTab === tab.id
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* カテゴリグリッド */}
      <div className="mb-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {displayCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative p-3 rounded-xl border text-center transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className={`text-xs font-medium leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {cat.label}
                </div>
                {count > 0 && (
                  <span className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium mt-2"
          >
            ✕ カテゴリの絞り込みを解除
          </button>
        )}
      </div>

      {/* エリアフィルター */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">エリアで絞り込み</span>
          {(selectedPrefecture || selectedCity) && (
            <button onClick={() => { setSelectedPrefecture(''); setSelectedCity(''); }}
              className="text-xs text-indigo-500 hover:text-indigo-600 ml-auto">
              クリア
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={selectedPrefecture}
            onChange={(e) => { setSelectedPrefecture(e.target.value); setSelectedCity(''); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none">
            <option value="">全国</option>
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
          <input type="text" value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="市区町村で検索"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      {/* 結果件数 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          {filteredQuests.length}件の依頼
          {selectedCategory !== 'all' && (() => {
            const cat = QUEST_CATEGORIES.find((c) => c.id === selectedCategory);
            return cat ? ` - ${cat.icon} ${cat.label}` : '';
          })()}
          {selectedPrefecture && ` - ${selectedPrefecture}${selectedCity ? ` ${selectedCity}` : ''}`}
        </div>
      </div>

      {/* クエスト一覧 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          読み込み中...
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-medium mb-1">
            {selectedCategory !== 'all' || selectedPrefecture || selectedCity
              ? 'この条件に一致する依頼はありません'
              : '現在募集中の依頼はありません'}
          </p>
          <p className="text-sm text-gray-400 mb-4">最初の依頼を投稿してみませんか？</p>
          <div className="flex flex-wrap justify-center gap-2">
            {(selectedCategory !== 'all' || selectedPrefecture || selectedCity) && (
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedPrefecture(''); setSelectedCity(''); setSelectedTab('all'); }}
                className="text-indigo-500 hover:text-indigo-600 text-sm font-medium border border-indigo-200 px-4 py-2 rounded-lg"
              >
                絞り込みを解除
              </button>
            )}
            {member && (
              <Link href="/quests/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                📋 依頼を投稿する
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.questId} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
