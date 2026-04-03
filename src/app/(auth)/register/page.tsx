'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import type { GuildRole } from '@/types/user';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<GuildRole>('adventurer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUpWithEmail(email, password, displayName, role);
      router.push('/quests');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle(role);
      router.push('/quests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">⚔️</span>
            <h1 className="text-2xl font-bold text-amber-400 mt-4">
              ギルドに登録
            </h1>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* 役割選択 */}
          <div className="mb-6">
            <label className="block text-sm text-stone-400 mb-2">
              役割を選択
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'adventurer' as const, label: '冒険者', icon: '⚔️', desc: '依頼を受ける' },
                { value: 'client' as const, label: '依頼者', icon: '📋', desc: '依頼を出す' },
                { value: 'both' as const, label: '両方', icon: '🏰', desc: '受発注両方' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`p-3 rounded-lg border text-center transition ${
                    role === option.value
                      ? 'border-amber-500 bg-amber-900/30 text-amber-400'
                      : 'border-stone-600 bg-stone-900 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-stone-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-1">
                冒険者名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
                placeholder="勇者タロウ"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
                placeholder="adventurer@guild.com"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">
                パスワード（6文字以上）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? '登録中...' : 'ギルドに登録'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-stone-800/60 text-stone-500">または</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-stone-700 hover:bg-stone-600 disabled:bg-stone-700/50 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Googleで登録
          </button>

          <p className="text-center text-sm text-stone-500 mt-6">
            すでに登録済み？{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
