'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { QuestCard } from '@/components/quest/QuestCard';
import { QUEST_CATEGORIES } from '@/constants/quest-categories';
import { PREFECTURES, formatArea } from '@/constants/areas';
import { useAuth } from '@/hooks/useAuth';
import type { Quest, QuestCategory } from '@/types/quest';

export default function QuestBoardPage() {
  const { member } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true);
      try {
        // Firestoreでは status + createdAt のクエリが基本
        // エリア・カテゴリのフィルターはクライアント側で行う
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

  // クライアント側フィルタリング
  const filteredQuests = useMemo(() => {
    let result = quests;
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
  }, [quests, selectedCategory, selectedPrefecture, selectedCity]);

  // 依頼に含まれる都道府県一覧（フィルター用）
  const availablePrefectures = useMemo(() => {
    const prefs = new Set(quests.map((q) => q.prefecture).filter(Boolean));
    return PREFECTURES.filter((p) => prefs.has(p.name));
  }, [quests]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">受注する</h1>
          <p className="text-sm text-gray-500 mt-1">募集中の依頼一覧</p>
        </div>
        {member && (
          <Link href="/quests/new" className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
            + 新しい依頼
          </Link>
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
            {availablePrefectures.length > 0 ? (
              availablePrefectures.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))
            ) : (
              PREFECTURES.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))
            )}
          </select>
          <input type="text" value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="市区町村で検索"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-6">
        <button onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
          すべて
        </button>
        {QUEST_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat.id ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* 件数 */}
      <div className="text-sm text-gray-400 mb-4">
        {filteredQuests.length}件の依頼
        {selectedPrefecture && ` - ${selectedPrefecture}${selectedCity ? ` ${selectedCity}` : ''}`}
      </div>

      {/* クエスト一覧 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400">
            {selectedPrefecture || selectedCity
              ? 'このエリアには募集中の依頼がありません'
              : '現在募集中の依頼はありません'}
          </p>
          {(selectedPrefecture || selectedCity) && (
            <button onClick={() => { setSelectedPrefecture(''); setSelectedCity(''); }}
              className="text-indigo-500 hover:text-indigo-600 text-sm font-medium mt-2">
              全国の依頼を見る
            </button>
          )}
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
