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
      <h1 className="text-3xl font-bold text-amber-400 mb-8">請求書一覧</h1>

      <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-stone-500">読み込み中...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📜</div>
            <p className="text-stone-500">まだ請求書がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-700">
            {invoices.map((invoice) => (
              <Link
                key={invoice.invoiceId}
                href={`/invoices/${invoice.invoiceId}`}
                className="block p-4 hover:bg-stone-800/60 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-sm text-stone-400">
                      {invoice.transactionDescription}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-semibold">
                      {formatYen(invoice.breakdown.totalAmountIncludingTax)}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        invoice.status === 'issued'
                          ? 'bg-blue-900/50 text-blue-400'
                          : invoice.status === 'paid'
                            ? 'bg-green-900/50 text-green-400'
                            : 'bg-stone-700 text-stone-400'
                      }`}
                    >
                      {invoice.status}
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
