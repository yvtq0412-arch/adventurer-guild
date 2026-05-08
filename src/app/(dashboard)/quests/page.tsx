'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 旧「クエスト一覧」ページ。
 * ココナラ型へのリプレースに伴い、新しいサービス一覧へリダイレクトする。
 */
export default function LegacyQuestsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/services');
  }, [router]);
  return (
    <div className="py-16 text-center text-sm text-gray-400">
      新しいサービス一覧へ移動しています...
    </div>
  );
}
