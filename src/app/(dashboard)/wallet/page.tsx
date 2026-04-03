'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import type { GuildTransaction } from '@/types/payment';

export default function WalletPage() {
  const { user, member, getIdToken } = useAuth();
  const [transactions, setTransactions] = useState<GuildTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;
      try {
        // 自分に関連するトランザクションを取得
        const q = query(
          collection(db, 'transactions'),
          where('adventurerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setTransactions(snapshot.docs.map((d) => d.data() as GuildTransaction));
      } catch (err) {
        console.error('トランザクション取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user]);

  async function handleOpenDashboard() {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/stripe-connect/dashboard-link', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.dashboardUrl) {
        window.open(data.dashboardUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSetupStripe() {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (err) {
      console.error(err);
    }
  }

  const formatYen = (amount: number) => `¥${amount.toLocaleString()}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-400 mb-8">金庫</h1>

      {/* Stripe Connect ステータス */}
      <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">出金設定</h2>
        {member?.stripeOnboardingComplete ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400">出金設定完了</span>
            </div>
            <button
              onClick={handleOpenDashboard}
              className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Stripeダッシュボードを開く
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-orange-400">
                出金を受け取るにはStripeアカウントの設定が必要です
              </span>
            </div>
            <button
              onClick={handleSetupStripe}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              設定を開始
            </button>
          </div>
        )}
      </div>

      {/* トランザクション履歴 */}
      <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-stone-700">
          <h2 className="text-lg font-semibold text-white">取引履歴</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-stone-500">読み込み中...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-stone-500">まだ取引がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-700">
            {transactions.map((tx) => (
              <div key={tx.transactionId} className="p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-stone-400">{tx.type}</span>
                  <div className="text-white font-medium">
                    {tx.type === 'distribution'
                      ? formatYen(tx.adventurerRewardAmount)
                      : tx.type.includes('refund')
                        ? `-${formatYen(tx.totalAmount)}`
                        : formatYen(tx.totalAmount)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    tx.status === 'succeeded'
                      ? 'bg-green-900/50 text-green-400'
                      : tx.status === 'refunded'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-stone-700 text-stone-400'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
