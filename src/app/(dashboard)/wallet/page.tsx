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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ウォレット</h1>
        <p className="text-sm text-gray-500 mt-1">出金設定と取引履歴</p>
      </div>

      {/* Stripe Connect ステータス */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">出金設定</h2>
        {member?.stripeOnboardingComplete ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-600 font-medium">出金設定完了</span>
            </div>
            <button
              onClick={handleOpenDashboard}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Stripeダッシュボードを開く
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-sm text-orange-600">
                出金を受け取るにはStripeアカウントの設定が必要です
              </span>
            </div>
            <button
              onClick={handleSetupStripe}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              設定を開始
            </button>
          </div>
        )}
      </div>

      {/* トランザクション履歴 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">取引履歴</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">読み込み中...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-gray-400">まだ取引がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.transactionId} className="p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-400">{tx.type}</span>
                  <div className="text-gray-900 font-medium mt-0.5">
                    {tx.type === 'distribution'
                      ? formatYen(tx.adventurerRewardAmount)
                      : tx.type.includes('refund')
                        ? `-${formatYen(tx.totalAmount)}`
                        : formatYen(tx.totalAmount)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tx.status === 'succeeded'
                      ? 'bg-green-50 text-green-600'
                      : tx.status === 'refunded'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tx.status === 'succeeded' ? '完了' : tx.status === 'refunded' ? '返金済み' : tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
