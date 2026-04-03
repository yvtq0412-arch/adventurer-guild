'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { QuestCard } from '@/components/quest/QuestCard';
import { QUEST_CATEGORIES } from '@/constants/quest-categories';
import { useAuth } from '@/hooks/useAuth';
import type { Quest, QuestCategory } from '@/types/quest';

export default function QuestBoardPage() {
  const { member } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all');

  useEffect(() => {
    async function fetchQuests() {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'quests'),
          where('status', '==', 'ESCROWED'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        if (selectedCategory !== 'all') {
          q = query(
            collection(db, 'quests'),
            where('status', '==', 'ESCROWED'),
            where('category', '==', selectedCategory),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
        }

        const snapshot = await getDocs(q);
        const questsData = snapshot.docs.map((doc) => doc.data() as Quest);
        setQuests(questsData);
      } catch (err) {
        console.error('クエスト取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuests();
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">依頼掲示板</h1>
          <p className="text-stone-400 mt-1">冒険者を募集中のクエスト一覧</p>
        </div>
        {member && (member.role === 'client' || member.role === 'both') && (
          <Link
            href="/quests/new"
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + 新しい依頼を作成
          </Link>
        )}
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          }`}
        >
          すべて
        </button>
        {QUEST_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-amber-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* クエスト一覧 */}
      {loading ? (
        <div className="text-center py-20 text-stone-500">
          依頼を読み込み中...
        </div>
      ) : quests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-stone-500">現在募集中のクエストはありません</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => (
            <QuestCard key={quest.questId} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
