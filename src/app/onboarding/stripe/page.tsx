'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const isRefresh = searchParams.get('refresh') === 'true';

  if (isRefresh) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🔄</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">
            オンボーディングを再開
          </h1>
          <p className="text-stone-400 mb-8">
            セッションが期限切れです。もう一度お試しください。
          </p>
          <Link
            href="/wallet"
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ウォレットに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-4">
            設定完了！
          </h1>
          <p className="text-stone-400 mb-8">
            Stripeアカウントの設定が完了しました。
            クエストの報酬を受け取る準備ができました。
          </p>
          <Link
            href="/quests"
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            クエストを探しに行く
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center text-stone-500">リダイレクト中...</div>
    </div>
  );
}

export default function StripeOnboardingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-stone-500">読み込み中...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
