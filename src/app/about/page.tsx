import Link from 'next/link';
import { RANK_TABLE, RANK_ORDER } from '@/lib/guild-rank';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* ヘッダー */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🏰</span> 冒険者ギルドへようこそ
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Guild について
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          スキルを持つ冒険者（ワーカー）と依頼を持つ依頼者を、
          安全なエスクロー決済でつなぐフリーランスプラットフォームです。
        </p>
      </div>

      {/* サービスの仕組み */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">サービスの仕組み</h2>
        <p className="text-sm text-gray-500 mb-6">依頼者と冒険者、どちらの立場からも使えます。</p>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                依頼者として使う
              </h3>
              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-medium text-gray-800">クエストを作成</span>
                    <p className="text-gray-500 mt-0.5">依頼内容・報酬・カテゴリ・エリアを設定して公開します。</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-medium text-gray-800">報酬を仮払い（エスクロー）</span>
                    <p className="text-gray-500 mt-0.5">報酬全額をGuildに預けます。冒険者への支払いは承認後なので安心。</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <span className="font-medium text-gray-800">納品を確認して承認</span>
                    <p className="text-gray-500 mt-0.5">完了報告が届いたら確認し、承認すると自動的に報酬が分配されます。</p>
                  </div>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-base font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">⚔️</span>
                冒険者として使う
              </h3>
              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-medium text-gray-800">クエストを探して受諾</span>
                    <p className="text-gray-500 mt-0.5">掲示板から自分のスキルに合ったクエストを見つけて受注します。</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-medium text-gray-800">作業を完了して報告</span>
                    <p className="text-gray-500 mt-0.5">完了したら依頼者に完了報告を送ります。</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <span className="font-medium text-gray-800">承認後に報酬を受取</span>
                    <p className="text-gray-500 mt-0.5">承認されると自動的に報酬が振り込まれます。</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* エスクロー決済フロー */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">決済フロー</h2>
        <p className="text-sm text-gray-500 mb-6">エスクロー（第三者預託）で双方を守ります。</p>
        <div className="relative">
          {/* 縦線 */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200 sm:left-[1.875rem]" />
          <div className="space-y-6">
            {[
              { step: '1', title: 'クエスト作成・仮払い', desc: '依頼者が依頼を作成し、報酬全額をGuildに預けます。カードへの課金はこの時点で行われますが、冒険者への送金はまだ行われません。', color: 'bg-blue-500', icon: '📝' },
              { step: '2', title: 'クエスト公開・受諾', desc: '掲示板にクエストが公開され、冒険者が受諾します。報酬はGuildのエスクロー口座で安全に保管されています。', color: 'bg-purple-500', icon: '🗡️' },
              { step: '3', title: '作業・完了報告', desc: '冒険者が作業を完了し、完了報告を送信します。依頼者に通知が届き、納品物の確認を依頼します。', color: 'bg-cyan-500', icon: '⚙️' },
              { step: '4', title: '承認・報酬分配', desc: '依頼者が納品物を承認すると、エスクロー口座から自動的に報酬が分配されます。ランクによって手数料が変動します。', color: 'bg-emerald-500', icon: '💰' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start">
                <div className={`w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10`}>
                  {item.step}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ランクシステム */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ランクシステム</h2>
        <p className="text-sm text-gray-500 mb-6">クエストをこなすほどランクが上がり、手数料が下がります。</p>

        {/* ランク一覧 */}
        <div className="space-y-3 mb-8">
          {RANK_ORDER.map((rank) => {
            const info = RANK_TABLE[rank];
            const feeMap: Record<string, string> = { S: '7%', A: '8%', B: '8.5%', C: '9%', D: '10%', E: '10%', F: '10%' };
            return (
              <div key={rank} className={`flex gap-4 items-start p-4 rounded-xl border ${info.borderColor} ${info.bgColor}`}>
                <div className="shrink-0 text-center w-12">
                  <div className="text-2xl mb-0.5">{info.emoji}</div>
                  <div className={`text-xs font-bold ${info.color}`}>{rank}ランク</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{info.description}</span>
                    <span className={`text-xs font-bold ${info.color}`}>手数料 {feeMap[rank]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {info.perks.map((perk) => (
                      <span key={perk} className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded-full border border-white">
                        ✓ {perk}
                      </span>
                    ))}
                  </div>
                  {rank !== 'F' && (
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span>クエスト完了 {info.minCompletedQuests}件以上</span>
                      <span>ランクポイント {info.minRankPoints}pt以上</span>
                      {info.minAverageRating > 0 && <span>平均評価 {info.minAverageRating}以上</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ランクポイント計算 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">📊 ランクポイントの計算方法</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <div className="text-lg font-bold text-gray-900">+10pt</div>
              <div className="text-xs text-gray-500 mt-1">クエスト完了 1件ごと</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-lg font-bold text-gray-900">評価点 × 5pt</div>
              <div className="text-xs text-gray-500 mt-1">依頼者評価 1件ごと<br />（最大25pt）</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl mb-2">💴</div>
              <div className="text-lg font-bold text-gray-900">+5pt</div>
              <div className="text-xs text-gray-500 mt-1">累計報酬 10万円ごと</div>
            </div>
          </div>
        </div>
      </section>

      {/* 手数料 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">手数料について</h2>
        <p className="text-sm text-gray-500 mb-6">ランクが上がるほど手数料が下がります。月額費用・サブスクはありません。</p>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">依頼金額 ¥100,000 の場合</h3>
              <div className="space-y-3">
                {[
                  { rank: 'F〜D', fee: '10%', worker: '¥90,000', color: 'text-gray-600' },
                  { rank: 'C', fee: '9%', worker: '¥91,000', color: 'text-yellow-600' },
                  { rank: 'B', fee: '8.5%', worker: '¥91,500', color: 'text-orange-600' },
                  { rank: 'A', fee: '8%', worker: '¥92,000', color: 'text-purple-600' },
                  { rank: 'S', fee: '7%', worker: '¥93,000', color: 'text-amber-600' },
                ].map((row) => (
                  <div key={row.rank} className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${row.color}`}>{row.rank}ランク（手数料{row.fee}）</span>
                    <span className="text-gray-900 font-semibold">{row.worker}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">その他の費用</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>登録費用</span>
                  <span className="font-medium text-emerald-600">無料</span>
                </div>
                <div className="flex justify-between">
                  <span>月額費用</span>
                  <span className="font-medium text-emerald-600">なし</span>
                </div>
                <div className="flex justify-between">
                  <span>出金手数料</span>
                  <span className="font-medium text-emerald-600">無料</span>
                </div>
                <div className="flex justify-between">
                  <span>消費税</span>
                  <span className="text-gray-500">別途10%</span>
                </div>
                <div className="flex justify-between">
                  <span>源泉徴収（対象カテゴリのみ）</span>
                  <span className="text-gray-500">10.21%〜20.42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 安全性 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">安全性・信頼性</h2>
        <p className="text-sm text-gray-500 mb-6">依頼者・冒険者の双方を守る仕組みを用意しています。</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '🔒', title: 'Stripe決済基盤', desc: '世界最大級の決済プラットフォームStripeを採用。PCI DSS準拠でカード情報を安全に処理します。' },
            { icon: '🛡️', title: 'エスクロー保護', desc: '報酬は作業完了・承認まで安全に保管。未完了の場合は全額返金されます。' },
            { icon: '↩️', title: 'キャンセル保護', desc: '作業開始前のキャンセルは全額返金。作業開始後も90%が返金されます。' },
            { icon: '⚖️', title: '紛争解決', desc: '納品物に問題がある場合は紛争申立てが可能。公正な解決をサポートします。' },
            { icon: '🪪', title: '本人確認（KYC）', desc: '発注・受注にはStripe Identityを使った本人確認が必要。なりすましを防ぎます。' },
            { icon: '📜', title: 'インボイス自動生成', desc: '取引完了後、法定記載事項を満たした適格請求書を自動生成。確定申告・経理処理に対応。' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h2>
        <div className="space-y-3">
          {[
            { q: '登録は無料ですか？', a: 'はい、アカウント登録は完全無料です。手数料は実際に取引が成立した場合のみ発生します。' },
            { q: 'どのような支払い方法に対応していますか？', a: 'Visa、Mastercard、American Express、JCBなど主要なクレジットカードに対応しています。' },
            { q: '報酬はいつ受け取れますか？', a: '依頼者の承認後、自動的にStripeアカウントに送金されます。Stripeからの銀行振込は通常2〜3営業日です。' },
            { q: 'キャンセルした場合はどうなりますか？', a: '冒険者受諾前のキャンセルは全額返金です。作業開始後のキャンセルは、報酬の90%が返金され、10%がキャンセル手数料として徴収されます。' },
            { q: 'ランクはどうやって上がりますか？', a: 'クエスト完了数・ランクポイント・平均評価の3条件を同時に満たすと自動でランクアップします。ランクポイントはクエスト完了で+10pt、評価で最大+25pt、累計報酬10万円ごとに+5ptが付与されます。' },
            { q: 'ギルドカードとは何ですか？', a: '冒険者の実績・ランク・評価をまとめた名刺のようなプロフィールカードです。取得すると依頼者から信頼されやすくなります。' },
            { q: '海外の取引にも対応していますか？', a: '現在は日本国内（JPY）の取引のみ対応しています。今後、対応通貨を拡大予定です。' },
          ].map((item) => (
            <details key={item.q} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition list-none">
                <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                <svg className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">さっそく始めてみませんか？</h2>
        <p className="text-gray-500 mb-8">登録は無料。本人確認を完了するとすぐに依頼・受注ができます。</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-medium transition">
            無料で登録する
          </Link>
          <Link href="/quests" className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl text-sm font-medium transition border border-gray-200">
            依頼掲示板を見る
          </Link>
        </div>
      </section>

    </div>
  );
}
