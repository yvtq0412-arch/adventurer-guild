'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ProfilePage() {
  const { user, member, getIdToken } = useAuth();
  const [displayName, setDisplayName] = useState(member?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Stripe Identity ステート
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');

  const avatarUrl = user?.photoURL || member?.avatarUrl;

  const identityLabel = {
    unverified: '未確認',
    pending: '審査中',
    verified: '本人確認済み',
    failed: '確認失敗',
  }[member?.identityStatus ?? 'unverified'];

  const identityColor = {
    unverified: 'bg-gray-100 text-gray-500',
    pending: 'bg-yellow-50 text-yellow-600',
    verified: 'bg-green-50 text-green-600',
    failed: 'bg-red-50 text-red-600',
  }[member?.identityStatus ?? 'unverified'];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleStartIdentityVerification() {
    setIdentityError('');
    setIdentityLoading(true);
    try {
      const idToken = await getIdToken();
      const res = await fetch('/api/identity/create-session', {
        method: 'POST',
        headers: { authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '本人確認セッションの作成に失敗しました');
      }
      const { clientSecret } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripeの読み込みに失敗しました');

      const { error } = await stripe.verifyIdentity(clientSecret);
      if (error) {
        throw new Error(error.message || '本人確認に失敗しました');
      }
      // verifyIdentity完了後はWebhookがidentityStatusを更新する
    } catch (err) {
      setIdentityError(err instanceof Error ? err.message : '本人確認に失敗しました');
    } finally {
      setIdentityLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">アカウント設定</h1>

      {/* プロフィール */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">プロフィール</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-indigo-600 text-2xl font-bold">
                  {displayName.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{member?.displayName || user?.displayName}</p>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${identityColor}`}>
              {identityLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 表示名変更 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">表示名の変更</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            {saved && <p className="text-sm text-green-600 font-medium">✓ 保存しました</p>}
          </div>
        </form>
      </div>

      {/* 本人確認（Stripe Identity） */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">本人確認</h2>
        <p className="text-xs text-gray-400 mb-4">
          発注・受注には本人確認が必要です。運転免許証またはパスポートで確認します（1回のみ）。
        </p>

        {member?.identityStatus === 'verified' ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">本人確認済みです</span>
          </div>
        ) : member?.identityStatus === 'pending' ? (
          <div className="flex items-center gap-2 text-yellow-600">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4M4 12h4m8 0h4" />
            </svg>
            <span className="text-sm font-medium">審査中です（通常数分で完了します）</span>
          </div>
        ) : (
          <div className="space-y-3">
            {identityError && <p className="text-sm text-red-500">{identityError}</p>}
            {member?.identityStatus === 'failed' && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 mb-2">
                確認に失敗しました。書類を確認して再度お試しください。
              </div>
            )}
            <button
              onClick={handleStartIdentityVerification}
              disabled={identityLoading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {identityLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4M4 12h4m8 0h4" />
                  </svg>
                  準備中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  {member?.identityStatus === 'failed' ? '再度確認する' : '本人確認を開始'}
                </>
              )}
            </button>
            <p className="text-xs text-gray-400">※ Stripeの安全な画面で処理されます</p>
          </div>
        )}
      </div>

      {/* アカウント情報（読み取り専用） */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">アカウント情報</h2>
        <dl className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <dt className="text-sm text-gray-500">メールアドレス</dt>
            <dd className="text-sm text-gray-900 font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <dt className="text-sm text-gray-500">ログイン方法</dt>
            <dd className="text-sm text-gray-900 font-medium">
              {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'メール/パスワード'}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <dt className="text-sm text-gray-500">本人確認</dt>
            <dd>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${identityColor}`}>{identityLabel}</span>
            </dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-sm text-gray-500">ユーザーID</dt>
            <dd className="text-xs text-gray-400 font-mono">{user?.uid}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
