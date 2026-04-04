import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* ヘッダー */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Guild について
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          スキルを持つワーカーと依頼を持つクライアントを、
          安全なエスクロー決済でつなぐプラットフォームです。
        </p>
      </div>

      {/* サービスの仕組み */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">サービスの仕組み</h2>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-semibold text-indigo-600 mb-3">クライアント（依頼者）</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>依頼内容と報酬金額を設定して、クエストを作成</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>報酬全額をエスクロー（仮払い）で安全に預託</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>納品物を確認し、問題なければ承認して報酬を分配</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="text-base font-semibold text-emerald-600 mb-3">ワーカー（受注者）</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>掲示板から自分のスキルに合ったクエストを選んで受諾</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>作業を進め、完了したら完了報告を送信</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>クライアントの承認後、報酬が自動的に振り込まれる</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* エスクロー決済フロー */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">エスクロー決済フロー</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'クエスト作成・仮払い', desc: 'クライアントが依頼を作成し、報酬全額をGuildに預けます。この時点でクレジットカードに課金は行われますが、ワーカーへの送金はまだ行われません。', color: 'bg-blue-500' },
            { step: '2', title: '冒険者募集・受諾', desc: '掲示板にクエストが公開され、ワーカーが受諾します。報酬はGuildのエスクロー口座で安全に保管されています。', color: 'bg-purple-500' },
            { step: '3', title: '作業・完了報告', desc: 'ワーカーが作業を完了し、完了報告を送信します。クライアントに通知が届き、納品物の確認を依頼します。', color: 'bg-cyan-500' },
            { step: '4', title: '承認・報酬分配', desc: 'クライアントが納品物を承認すると、エスクロー口座から自動的に報酬が分配されます。ワーカーに90%、Guildに10%。', color: 'bg-emerald-500' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className={`w-8 h-8 ${item.color} text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5`}>
                {item.step}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 手数料 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">手数料について</h2>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <div className="flex h-3 rounded-full overflow-hidden mb-6">
            <div className="bg-emerald-500 rounded-l-full" style={{ width: '90%' }} />
            <div className="bg-indigo-500 rounded-r-full" style={{ width: '10%' }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">シンプルな一律10%</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Guildの手数料は依頼金額の10%のみ。残りの90%がワーカーの報酬になります。
                隠れた追加料金、月額費用、サブスクリプションはありません。
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">依頼金額 ¥100,000 の場合</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ワーカー報酬</span>
                <span className="text-emerald-600 font-bold">¥90,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">プラットフォーム手数料</span>
                <span className="text-indigo-600 font-bold">¥10,000</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">端数処理</span>
                <span className="text-xs text-gray-400">1円未満切り捨て（ワーカー有利）</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 安全性 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">安全性・信頼性</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Stripe決済基盤', desc: '世界最大級の決済プラットフォームStripeを採用。PCI DSS準拠でカード情報を安全に処理します。' },
            { title: 'エスクロー保護', desc: '報酬は作業完了・承認まで安全に保管。未完了の場合は全額返金されます。' },
            { title: 'キャンセル保護', desc: '作業開始前のキャンセルは全額返金。作業開始後も90%が返金されます。' },
            { title: '紛争解決', desc: '納品物に問題がある場合は紛争申立てが可能。公正な解決をサポートします。' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* インボイス対応 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">インボイス・税務対応</h2>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">適格請求書（インボイス）自動生成</h3>
            <p className="text-sm text-gray-500">
              取引完了後、法定記載事項を満たした適格請求書を自動生成します。
              登録番号、税率区分、消費税額の全てが記載されます。
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">源泉徴収対応</h3>
            <p className="text-sm text-gray-500">
              デザイン、ライティング、コンサルティングなど、源泉徴収が必要なカテゴリでは
              自動的に税額を計算し、記録します（100万円以下: 10.21%、100万円超: 20.42%）。
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">個人・法人どちらも対応</h3>
            <p className="text-sm text-gray-500">
              フリーランスの確定申告から法人の経理処理まで、必要な書類を全て提供します。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: '登録は無料ですか？', a: 'はい、アカウント登録は完全無料です。手数料は実際に取引が成立した場合のみ発生します。' },
            { q: 'どのような支払い方法に対応していますか？', a: 'Visa、Mastercard、American Express、JCBなど主要なクレジットカードに対応しています。' },
            { q: '報酬はいつ受け取れますか？', a: 'クライアントの承認後、自動的にStripeアカウントに送金されます。Stripeからの銀行振込は通常2-3営業日です。' },
            { q: 'キャンセルした場合はどうなりますか？', a: 'ワーカー受諾前のキャンセルは全額返金です。作業開始後のキャンセルは、報酬の90%が返金され、10%がキャンセル手数料として徴収されます。' },
            { q: '海外の取引にも対応していますか？', a: '現在は日本国内（JPY）の取引のみ対応しています。今後、対応通貨を拡大予定です。' },
          ].map((item) => (
            <div key={item.q} className="border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">始めてみませんか？</h2>
        <p className="text-gray-500 mb-8">登録は無料。すぐに依頼の作成・受注を始められます。</p>
        <div className="flex justify-center gap-3">
          <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-medium transition">
            無料で登録
          </Link>
          <Link href="/quests" className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl text-sm font-medium transition border border-gray-200">
            依頼掲示板を見る
          </Link>
        </div>
      </section>
    </div>
  );
}
