import Link from 'next/link';

export const metadata = {
  title: 'ご利用ガイド | Guild',
  description: '依頼の出し方から報酬受取まで、冒険者ギルドの使い方をステップごとに詳しく解説します。',
};

/* ───────────── 共通パーツ ───────────── */

function StepCard({
  step,
  title,
  children,
  color,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  color: 'indigo' | 'emerald';
}) {
  const bg = color === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500';
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-8 h-8 ${bg} text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0`}>
        {step}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
        <div className="text-sm text-gray-500 leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 mt-2">
      <span className="text-amber-500 flex-shrink-0">💡</span>
      <div className="text-xs text-amber-700 leading-relaxed">{children}</div>
    </div>
  );
}

function SectionHeading({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  );
}

/* ───────────── ページ本体 ───────────── */

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* ヘッダー */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>📖</span> ご利用ガイド
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          依頼から報酬受取までの流れ
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          初めての方でも安心。依頼者・冒険者それぞれの目線で、
          ステップごとに詳しく解説します。
        </p>
      </div>

      {/* ========== 依頼者パート ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="📋"
          title="依頼者としての使い方"
          sub="「こんな作業、誰かにお願いしたい」を形にする流れ"
        />

        <div className="space-y-8">
          <StepCard step={1} title="アカウント登録・本人確認" color="indigo">
            <p>メールアドレスまたはGoogleアカウントで登録し、Stripe経由で本人確認（KYC）を完了してください。</p>
            <p>本人確認が済むと、クレジットカードでの仮払い（エスクロー）が可能になります。</p>
          </StepCard>

          <StepCard step={2} title="クエスト（依頼）を作成する" color="indigo">
            <p><strong>依頼タイプ</strong>（個人/企業）、<strong>カテゴリ</strong>、<strong>作業場所</strong>を選択し、依頼内容と報酬金額を入力します。</p>
            <p>依頼内容は<strong>「何を」「どのくらい」</strong>で記載してください。</p>
            <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-1 text-xs">
              <p className="font-medium text-gray-700">記載例（良い例）</p>
              <p className="text-emerald-600">「庭の草取りと落ち葉の袋詰め（45L袋 × 3袋分）」</p>
              <p className="text-emerald-600">「倉庫内の商品をカテゴリ別に仕分け・棚入れ（約200点）」</p>
              <p className="font-medium text-gray-700 mt-2">避けたい例</p>
              <p className="text-red-400">「10時〜16時まで農業の手伝い」（時間拘束型 = 労働契約リスク）</p>
            </div>
            <Tip>
              作業内容は「時間」ではなく「作業量・成果物」で定義すると、業務委託として適切な形になります。
              時間の調整は受注後にチャットで行えます。
            </Tip>
          </StepCard>

          <StepCard step={3} title="報酬を仮払い（エスクロー）する" color="indigo">
            <p>クエスト登録と同時に、報酬全額をGuildに預けます（クレジットカードでのオーソリゼーション）。</p>
            <p>この時点では冒険者への送金は行われません。Guildが安全に預かります。</p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2 text-xs text-indigo-700">
              🔒 報酬はGuildのエスクロー口座で保管されます。作業が完了し、あなたが「承認」するまで冒険者には支払われません。
            </div>
          </StepCard>

          <StepCard step={4} title="冒険者からの応募を待つ・チャットで詳細を詰める" color="indigo">
            <p>クエストが掲示板に公開されると、興味を持った冒険者からチャットが届きます。</p>
            <p>この段階で以下の点をすり合わせてください：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>具体的な作業範囲（どこまでやるか）</li>
              <li>希望の日時・所要時間の目安</li>
              <li>持ち物・道具について（依頼者が用意するか、冒険者が持参するか）</li>
              <li>駐車場・アクセス情報</li>
              <li>その他の注意点（ペットがいる、近隣に配慮が必要、等）</li>
            </ul>
            <Tip>
              受注ボタンが押される前にチャットで十分に話し合うことで、
              作業当日のトラブルを防げます。<strong>お互い納得した上で受注してもらいましょう。</strong>
            </Tip>
          </StepCard>

          <StepCard step={5} title="冒険者が受注 → 作業開始" color="indigo">
            <p>冒険者が「受注する」ボタンを押すと、正式に契約成立（業務委託契約）となります。</p>
            <p>作業中もチャットでやり取りできるので、進捗確認や追加の質問があれば気軽に連絡できます。</p>
          </StepCard>

          <StepCard step={6} title="完了報告を確認 → 承認する" color="indigo">
            <p>冒険者が作業を完了すると「完了報告」が届きます。内容を確認し、問題なければ「承認」してください。</p>
            <p>承認した瞬間に、以下が自動で実行されます：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>エスクローされていた報酬がキャプチャ（確定）</li>
              <li>ギルド手数料（10%〜7%）を差し引いた金額が冒険者に送金</li>
              <li>インボイス（適格請求書）が自動生成</li>
            </ul>
            <Tip>
              問題がある場合は「紛争（DISPUTE）」を申し立てることもできます。安心してご利用ください。
            </Tip>
          </StepCard>

          <StepCard step={7} title="相互評価する" color="indigo">
            <p>報酬分配が完了すると、お互いに<strong>星1〜5の評価</strong>を送ることができます。</p>
            <p>冒険者への評価は、冒険者のランクアップに直結します。正直な評価をお願いします。</p>
            <p>依頼者への評価も公開されるため、良い依頼者であることが次の受注のしやすさにつながります。</p>
          </StepCard>
        </div>
      </section>

      {/* ========== 冒険者パート ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="⚔️"
          title="冒険者としての使い方"
          sub="スキルを活かして報酬を得る流れ"
        />

        <div className="space-y-8">
          <StepCard step={1} title="アカウント登録・ギルドカード申請" color="emerald">
            <p>アカウント登録後、<strong>ギルドカード</strong>を申請してください。</p>
            <p>ギルドカードは冒険者の身分証明書のようなもので、以下の情報を登録します：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>表示名・キャッチフレーズ・自己紹介文</li>
              <li>スキルタグ（草刈り、引越し補助、倉庫作業 など）</li>
              <li>対応可能エリア（都道府県）</li>
              <li>保有資格・免許（任意）</li>
              <li>本人確認書類（免許証・マイナンバーカード等）</li>
            </ul>
          </StepCard>

          <StepCard step={2} title="Stripeアカウント連携（本人確認・報酬受取設定）" color="emerald">
            <p>報酬を受け取るには、Stripe Connect アカウントの設定が必要です。</p>
            <p>Stripeの案内に従い、本人確認（KYC）と銀行口座を登録してください。</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2 text-xs text-emerald-700">
              🔐 KYCが完了しているため、虚偽の身元で活動することはできません。これがプラットフォーム全体の信頼性を支えています。
            </div>
          </StepCard>

          <StepCard step={3} title="クエスト掲示板から依頼を探す" color="emerald">
            <p>掲示板で自分のスキル・エリアに合ったクエストを探します。</p>
            <p>カテゴリ・エリア・報酬金額で絞り込めます。</p>
            <p>気になるクエストを見つけたら、まず<strong>依頼者にチャットで連絡</strong>しましょう。</p>
          </StepCard>

          <StepCard step={4} title="チャットで依頼者と詳細を詰める" color="emerald">
            <p>受注する前に、以下の点を必ず確認してください：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>具体的な作業範囲（どこからどこまでか）</li>
              <li>作業日時の希望（互いのスケジュール調整）</li>
              <li>作業に必要な道具・持ち物</li>
              <li>現地のアクセス方法・駐車場の有無</li>
              <li>報酬金額が作業内容に見合っているか</li>
            </ul>
            <Tip>
              <strong>「受注する」ボタンを押す = 契約成立です。</strong>
              必ず事前にチャットで話し合い、お互い合意した上で受注してください。
              「思ってたのと違った」を防ぐために、この段階が最も重要です。
            </Tip>
          </StepCard>

          <StepCard step={5} title="受注して作業を行う" color="emerald">
            <p>お互い合意したら「受注する」ボタンを押して作業を開始します。</p>
            <p>作業中に追加の確認が必要な場合はチャットで連絡してください。</p>
            <p>作業が完了したら「完了報告」を送信します。</p>
          </StepCard>

          <StepCard step={6} title="依頼者の承認 → 報酬受取" color="emerald">
            <p>依頼者が完了を承認すると、報酬が自動的にStripeアカウントに振り込まれます。</p>
            <p>Stripeから銀行口座への出金は通常2〜3営業日です。</p>
            <div className="bg-gray-50 rounded-lg p-3 mt-2 text-xs space-y-1">
              <p className="font-medium text-gray-700">報酬の内訳例（依頼金額 ¥10,000 の場合）</p>
              <div className="flex justify-between"><span>依頼金額</span><span>¥10,000</span></div>
              <div className="flex justify-between text-red-500"><span>ギルド手数料（10%）</span><span>-¥1,000</span></div>
              <div className="flex justify-between font-bold text-emerald-600 border-t border-gray-200 pt-1"><span>あなたの受取額</span><span>¥9,000</span></div>
            </div>
          </StepCard>

          <StepCard step={7} title="相互評価 → ランクアップ" color="emerald">
            <p>報酬分配後、依頼者とお互いに<strong>星1〜5の評価</strong>を送ります。</p>
            <p>高い評価を積み重ねることで：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>ランクが上がる（F → E → D → C → B → A → S）</li>
              <li>手数料が下がる（10% → 最低7%）</li>
              <li>上位ランク限定クエストが受注可能に</li>
              <li>掲示板での検索優先度がアップ</li>
            </ul>
          </StepCard>
        </div>
      </section>

      {/* ========== キャンセル・紛争 ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="🛡️"
          title="キャンセル・紛争について"
          sub="万が一の場合も安心です"
        />

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">冒険者受諾前のキャンセル</h3>
            <p className="text-sm text-gray-500">依頼者が自由にキャンセルでき、<strong className="text-emerald-600">全額返金</strong>されます。</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">作業中のキャンセル</h3>
            <p className="text-sm text-gray-500">依頼者がキャンセルした場合、<strong className="text-emerald-600">報酬の90%が返金</strong>されます。残り10%はギルド維持費として徴収されます。</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">紛争（DISPUTE）の申立て</h3>
            <p className="text-sm text-gray-500">完了報告の内容に問題がある場合、依頼者は「紛争」を申し立てることができます。運営が状況を確認し、公正な判断を行います。</p>
          </div>
        </div>

        <Tip>
          チャットでの事前のすり合わせを十分に行うことで、キャンセルや紛争のリスクは大幅に低減できます。
        </Tip>
      </section>

      {/* ========== チャットでの確認チェックリスト ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="💬"
          title="受注前のチャット確認チェックリスト"
          sub="受注ボタンを押す前に、最低限これだけは確認しましょう"
        />

        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">依頼者が確認すること</h3>
              <ul className="space-y-2">
                {[
                  '冒険者のギルドカード・スキル・評価を確認した',
                  '作業範囲を具体的に伝えた',
                  '希望日時・所要時間の目安を伝えた',
                  '道具・持ち物について取り決めた',
                  '現地アクセス情報を伝えた',
                  '報酬金額に合意を得た',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">冒険者が確認すること</h3>
              <ul className="space-y-2">
                {[
                  '作業範囲を正確に理解した',
                  '自分のスキル・経験で対応可能だと判断した',
                  '日時・場所に無理なく行ける',
                  '必要な道具を準備できる',
                  '報酬金額に納得している',
                  '資格・免許が必要な作業なら保有している',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">準備はできましたか？</h2>
        <p className="text-gray-500 mb-8 text-sm">まずは掲示板を覗いてみましょう。</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/quests" className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-medium transition">
            依頼掲示板を見る
          </Link>
          <Link href="/register" className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl text-sm font-medium transition border border-gray-200">
            無料で登録する
          </Link>
        </div>
      </section>

    </div>
  );
}
