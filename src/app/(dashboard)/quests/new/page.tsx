'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 旧「クエスト新規作成」ページ。
 * ココナラ型へのリプレースに伴い、掲載作成ページへリダイレクトする。
 */
export default function LegacyNewQuestRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/services/new');
  }, [router]);
  return (
    <div className="py-16 text-center text-sm text-gray-400">
      新しい掲載ページへ移動しています...
    </div>
  );
}
