import Link from 'next/link';

export const metadata = {
  title: '特定商取引法に基づく表記 | Guild',
  description: 'Guildの特定商取引法に基づく表記です。',
};

const SERVICE_NAME = 'Guild（冒険者ギルド）';

export default function LawPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ヘッダー */}
      <div className="mb-10">
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition">TOP</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">特定商取引法に基づく表記</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">特定商取引法に基づく表記</h1>
        <p className="text-sm text-gray-400 mt-3">最終更新日: 2025年6月</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 w-1/3 align-top">事業者名（屋号）</td>
              <td className="px-6 py-4 text-gray-600">{SERVICE_NAME}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">代表者名（運営責任者）</td>
              <td className="px-6 py-4 text-gray-600">堀内 雄太</td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">所在地</td>
              <td className="px-6 py-4 text-gray-600">〒160-0023 東京都新宿区西新宿3丁目3番13号 西新宿水間ビル2F</td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">連絡先</td>
              <td className="px-6 py-4 text-gray-600">
                <p>メール：veltiq.info@proton.me</p>
                <p className="mt-1">
                  <Link href="/contact" className="text-indigo-500 hover:text-indigo-600 underline">お問い合わせフォーム</Link>
                  もご利用いただけます
                </p>
                <p className="text-xs text-gray-400 mt-1">※ お問い合わせには原則3日以内に返信いたします</p>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">サービスの内容</td>
              <td className="px-6 py-4 text-gray-600">
                リアルな軽作業（草刈り、掃除、運搬、倉庫作業等）の依頼者（発注者）と
                冒険者（受注者）をマッチングするプラットフォームの提供
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">サービスの対価（手数料）</td>
              <td className="px-6 py-4 text-gray-600">
                <p>取引金額に対して以下のサービス利用料（ギルド手数料）を徴収します。</p>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li>F〜Dランク：15%</li>
                  <li>Cランク：13%</li>
                  <li>Bランク：12%</li>
                  <li>Aランク：11%</li>
                  <li>Sランク：10%</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">※ 手数料は受注者（冒険者）の報酬から差し引かれます。依頼者が支払う金額に追加料金はありません。</p>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">支払方法</td>
              <td className="px-6 py-4 text-gray-600">
                クレジットカード（Visa / Mastercard / American Express / JCB）
                <p className="text-xs text-gray-400 mt-1">決済処理はStripe, Inc.が行います。当社はカード情報を保持しません。</p>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">支払時期</td>
              <td className="px-6 py-4 text-gray-600">
                依頼（クエスト）作成時に全額をエスクロー（仮払い）します。
                作業完了後、依頼者が承認した時点で決済が確定し、受注者に報酬が分配されます。
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">役務の提供時期</td>
              <td className="px-6 py-4 text-gray-600">
                依頼者と受注者がチャットで合意した日時に作業を実施します。
                プラットフォーム機能はアカウント登録完了後すぐにご利用いただけます。
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">キャンセル・返金について</td>
              <td className="px-6 py-4 text-gray-600">
                <ul className="space-y-2 text-xs">
                  <li>
                    <span className="font-medium text-gray-700">受注者確定前のキャンセル：</span>
                    <span>全額返金</span>
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">作業開始後のキャンセル：</span>
                    <span>取引金額の90%を返金。残り10%はキャンセル手数料として徴収。</span>
                  </li>
                  <li>
                    <span className="font-medium text-gray-700">紛争（DISPUTE）：</span>
                    <span>作業完了後に問題がある場合、紛争申立てが可能。運営が状況を確認し判断します。</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  詳細は<Link href="/terms" className="text-indigo-500 underline">利用規約 第8条（キャンセル・返金）</Link>をご確認ください。
                </p>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">動作環境</td>
              <td className="px-6 py-4 text-gray-600">
                <p>Google Chrome / Safari / Firefox / Edge の最新版を推奨</p>
                <p className="text-xs text-gray-400 mt-1">スマートフォン・タブレット・PCに対応</p>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 bg-gray-50 font-medium text-gray-700 align-top">特別の販売条件</td>
              <td className="px-6 py-4 text-gray-600">
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>・サービスの利用にはGoogleアカウントによるユーザー登録が必要です</li>
                  <li>・依頼の投稿および受注には本人確認（KYC）が必要です</li>
                  <li>・受注者は決済サービス（Stripe Connect）の設定が必要です</li>
                  <li>・法令に違反する依頼の投稿は禁止されています（<Link href="/prohibited" className="text-indigo-500 underline">禁止依頼ガイドライン</Link>）</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/terms" className="text-sm text-indigo-500 hover:text-indigo-600 underline">利用規約</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="text-sm text-indigo-500 hover:text-indigo-600 underline">プライバシーポリシー</Link>
          <span className="text-gray-300">|</span>
          <Link href="/prohibited" className="text-sm text-indigo-500 hover:text-indigo-600 underline">禁止依頼ガイドライン</Link>
        </div>
      </div>
    </div>
  );
}
