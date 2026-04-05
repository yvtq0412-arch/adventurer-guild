'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function ProfilePage() {
  const { user, member } = useAuth();
  const [displayName, setDisplayName] = useState(member?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const avatarUrl = user?.photoURL || member?.avatarUrl;

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

  const identityLabel = {
    unverified: '未確認',
    pending: '審査中',
    verified: '本人確認済み',
    failed: '確認失敗',
  }[member?.identityStatus ?? 'unverified'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">アカウント設定</h1>

      {/* アバター */}
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
            <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
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
            <dt className="text-sm text-gray-500">役割</dt>
            <dd className="text-sm text-gray-900 font-medium">{identityLabel}</dd>
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
