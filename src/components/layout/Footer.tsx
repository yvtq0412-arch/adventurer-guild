import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">Guild</span>
          </Link>

          {/* リンク */}
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link
              href="/about"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Guildについて
            </Link>
            <Link
              href="/guide"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ご利用ガイド
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              利用規約
            </Link>
            <Link
              href="/law"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              特定商取引法に基づく表記
            </Link>
            <Link
              href="/prohibited"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              禁止依頼ガイドライン
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/contact"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              お問い合わせ
            </Link>
          </div>

          {/* コピーライト */}
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Guild
          </p>
        </div>
      </div>
    </footer>
  );
}
