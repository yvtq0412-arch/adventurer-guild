'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import type { GuildInvoice } from '@/types/invoice';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<GuildInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'invoices'),
          where('recipientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setInvoices(snapshot.docs.map((d) => d.data() as GuildInvoice));
      } catch (err) {
        console.error('インボイス取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [user]);

  const formatYen = (amount: number) => `¥${amount.toLocaleString()}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">請求書一覧</h1>
        <p className="text-sm text-gray-500 mt-1">発行された請求書の履歴</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">読み込み中...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📜</div>
            <p className="text-gray-400">まだ請求書がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <Link
                key={invoice.invoiceId}
                href={`/invoices/${invoice.invoiceId}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-900 font-medium">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {invoice.transactionDescription}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-semibold">
                      {formatYen(invoice.breakdown.totalAmountIncludingTax)}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        invoice.status === 'issued'
                          ? 'bg-blue-50 text-blue-600'
                          : invoice.status === 'paid'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {invoice.status === 'issued' ? '発行済み' : invoice.status === 'paid' ? '支払済み' : invoice.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
