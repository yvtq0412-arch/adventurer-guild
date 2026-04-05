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

/** チャット風吹き出し */
function ChatBubble({
  from,
  role,
  children,
}: {
  from: string;
  role: 'client' | 'adventurer';
  children: React.ReactNode;
}) {
  const isClient = role === 'client';
  return (
    <div className={`flex gap-2 ${isClient ? 'justify-end' : 'justify-start'}`}>
      {!isClient && (
        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">⚔️</div>
      )}
      <div className={`max-w-[80%] ${isClient ? 'order-first' : ''}`}>
        <p className={`text-[10px] mb-0.5 ${isClient ? 'text-right text-indigo-400' : 'text-emerald-500'}`}>{from}</p>
        <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          isClient
            ? 'bg-indigo-500 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-700 rounded-tl-sm'
        }`}>
          {children}
        </div>
      </div>
      {isClient && (
        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">📋</div>
      )}
    </div>
  );
}

/** チャットシステムメッセージ */
function ChatSystem({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <span className="text-[10px] text-gray-400 bg-gray-50 px-3 py-0.5 rounded-full">{children}</span>
    </div>
  );
}

/** モック依頼フォームカード */
function MockQuestForm({
  category,
  categoryIcon,
  title,
  description,
  amount,
  prefecture,
  city,
}: {
  category: string;
  categoryIcon: string;
  title: string;
  description: string;
  amount: string;
  prefecture: string;
  city: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{categoryIcon} {category}</span>
        <span className="text-xs text-gray-400">個人の依頼</span>
      </div>
      <div className="space-y-2 text-xs">
        <div><span className="text-gray-400 w-16 inline-block">タイトル</span><span className="text-gray-800 font-medium">{title}</span></div>
        <div><span className="text-gray-400 w-16 inline-block">場所</span><span className="text-gray-800">{prefecture} {city}</span></div>
        <div className="bg-gray-50 rounded-lg p-2 text-gray-600 leading-relaxed">{description}</div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <span className="text-gray-400">報酬金額</span>
          <span className="text-lg font-bold text-gray-900">{amount}</span>
        </div>
      </div>
    </div>
  );
}

/** フローステップ（シナリオ用の縦線付き） */
function FlowStep({
  emoji,
  title,
  children,
  isLast,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm shrink-0">{emoji}</div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>
      <div className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
        <p className="text-xs font-bold text-gray-800 mb-1">{title}</p>
        <div className="text-xs text-gray-500 leading-relaxed">{children}</div>
      </div>
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

          <StepCard step={4} title="冒険者（受注者）からの応募を待つ・チャットで詳細を詰める" color="indigo">
            <p>クエストが掲示板に公開されると、興味を持った冒険者からチャットが届きます。</p>
            <p>投稿時に<strong>希望日時の候補</strong>を入れておくと、日程調整がスムーズです。</p>
            <p className="mt-1">この段階で以下の点をすり合わせてください：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-xs">
              <li>具体的な作業範囲（どこまでやるか）</li>
              <li>日時の最終確定（候補から選んでもらう or チャットで調整）</li>
              <li>持ち物・道具について（依頼者が用意するか、冒険者が持参するか）</li>
              <li>駐車場・アクセス情報</li>
              <li>その他の注意点（ペットがいる、近隣に配慮が必要、等）</li>
            </ul>
            <Tip>
              受注ボタンが押される前にチャットで十分に話し合うことで、
              作業当日のトラブルを防げます。<strong>お互い納得した上で受注してもらいましょう。</strong>
            </Tip>
          </StepCard>

          <StepCard step={5} title="冒険者（受注者）が受注 → 作業開始" color="indigo">
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
          title="冒険者（受注者）としての使い方"
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

          <StepCard step={3} title="クエスト（依頼）掲示板から依頼を探す" color="emerald">
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
              <h3 className="text-sm font-bold text-gray-700 mb-3">冒険者（受注者）が確認すること</h3>
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

      {/* ========== シナリオ別：草刈り ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="🌿"
          title="シナリオ例 1：庭の草刈り"
          sub="最も多い依頼パターン。具体的な流れを見てみましょう"
        />

        {/* 依頼フォーム入力例 */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">依頼者が投稿する内容</p>
          <MockQuestForm
            category="庭仕事・草取り"
            categoryIcon="🌿"
            title="自宅の庭の草取り＋袋詰めをお願いしたい"
            description="庭（約20平米）の草取りと、抜いた草の45Lゴミ袋への袋詰めをお願いします。袋は3〜4袋分の想定です。ゴミ袋・軍手はこちらで用意します。"
            amount="¥5,000"
            prefecture="埼玉県"
            city="さいたま市"
          />
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-3">
            <p className="text-[10px] text-indigo-400 mb-1 font-medium">📅 希望日時の候補</p>
            <div className="space-y-0.5 text-xs text-indigo-700">
              <div className="flex justify-between"><span>4月12日（土）</span><span className="bg-white/80 px-1.5 py-0.5 rounded text-[10px]">午前</span></div>
              <div className="flex justify-between"><span>4月13日（日）</span><span className="bg-white/80 px-1.5 py-0.5 rounded text-[10px]">午前</span></div>
            </div>
          </div>
        </div>

        {/* チャット例 */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">チャットでのやり取り例</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <ChatSystem>冒険者「タケシ」さんがチャットを開始しました</ChatSystem>
            <ChatBubble from="タケシ（冒険者）" role="adventurer">
              はじめまして！草刈りの依頼を拝見しました。20平米で45L袋3〜4袋とのことですが、草の高さはどのくらいですか？膝丈くらいまで伸びてる場合は少し時間がかかるかもしれません。
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              こんにちは！膝丈まではいかないです。足首〜すね位です。前回の草取りから2ヶ月くらい放置してしまいました。
            </ChatBubble>
            <ChatBubble from="タケシ（冒険者）" role="adventurer">
              なるほど、それなら大丈夫です！道具は鎌とレーキを持参します。ゴミ袋と軍手はお借りできるとのことでありがたいです。駐車場はありますか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              駐車スペース1台分あります。希望日時の候補に土曜と日曜を入れてあるんですが、どちらか都合いい日はありますか？
            </ChatBubble>
            <ChatBubble from="タケシ（冒険者）" role="adventurer">
              候補拝見しました！土曜の午前で大丈夫です。9時スタートでいかがですか？天気が雨の場合は日曜に延期でいいですか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              はい、雨天時は日曜に変更でお願いします。それでは受注よろしくお願いします！
            </ChatBubble>
            <ChatSystem>タケシさんがクエストを受注しました ⚔️</ChatSystem>
          </div>
        </div>

        {/* フロー */}
        <div>
          <p className="text-xs font-bold text-gray-600 mb-3">この後の流れ</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <FlowStep emoji="⚔️" title="受注確定">
              タケシさんが受注ボタンを押し、契約成立。
            </FlowStep>
            <FlowStep emoji="🌿" title="作業当日">
              土曜9時にタケシさんが訪問。草取り＋袋詰めを実施。
            </FlowStep>
            <FlowStep emoji="✅" title="完了報告">
              タケシさんが作業完了報告を送信。「45L袋 × 4袋分完了しました」
            </FlowStep>
            <FlowStep emoji="🎉" title="承認・報酬分配">
              あなたが承認ボタンを押す → タケシさんに ¥4,500（手数料10%差引後）が自動送金。
            </FlowStep>
            <FlowStep emoji="⭐" title="相互評価" isLast>
              お互いに星評価とコメントを送信。タケシさんのランクポイントがアップ！
            </FlowStep>
          </div>
        </div>
      </section>

      {/* ========== シナリオ別：行列代行 ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="🪑"
          title="シナリオ例 2：行列の並び代行"
          sub="人気店や整理券の列に代わりに並んでもらうパターン"
        />

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">依頼者が投稿する内容</p>
          <MockQuestForm
            category="行列・順番待ち代行"
            categoryIcon="🪑"
            title="人気ラーメン店の並び代行（整理券受取まで）"
            description="〇〇駅前の△△ラーメンに並んで整理券を受け取ってほしいです。開店30分前（10:30頃）に到着し、整理券を受け取ったら写真で確認を送ってください。整理券受取後に完了です。"
            amount="¥2,000"
            prefecture="東京都"
            city="渋谷区"
          />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">チャットでのやり取り例</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <ChatSystem>冒険者「ミサキ」さんがチャットを開始しました</ChatSystem>
            <ChatBubble from="ミサキ（冒険者）" role="adventurer">
              行列代行の依頼を見ました！渋谷なら対応できます。整理券は番号制ですか？それとも先着順で席に案内されるタイプですか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              番号の書いてある紙を渡されるタイプです。開店前に並んで、配布されたら写真を送ってもらえれば大丈夫です。
            </ChatBubble>
            <ChatBubble from="ミサキ（冒険者）" role="adventurer">
              了解です！10:30に店の前にいればOKですね？万が一、配布が遅れたりして長引いた場合はどうしましょう？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              11:30までに整理券がもらえなかったら、その時点で終了で大丈夫です。報酬はお支払いします。
            </ChatBubble>
            <ChatBubble from="ミサキ（冒険者）" role="adventurer">
              ありがとうございます！では受注させていただきます。
            </ChatBubble>
            <ChatSystem>ミサキさんがクエストを受注しました ⚔️</ChatSystem>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 mb-3">この後の流れ</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <FlowStep emoji="⚔️" title="受注確定">
              ミサキさんが受注。当日の並びを待つ。
            </FlowStep>
            <FlowStep emoji="🪑" title="当日：行列に並ぶ">
              ミサキさんが10:30に到着し、列に並ぶ。
            </FlowStep>
            <FlowStep emoji="📸" title="整理券を受け取り、写真送付">
              整理券の写真をチャットで送信。
            </FlowStep>
            <FlowStep emoji="✅" title="完了報告">
              ミサキさんが完了報告を送信。
            </FlowStep>
            <FlowStep emoji="🎉" title="承認・報酬分配">
              写真を確認して承認 → ミサキさんに ¥1,800 が自動送金。
            </FlowStep>
            <FlowStep emoji="⭐" title="相互評価" isLast>
              「時間通りに並んでくれて助かりました！」★5
            </FlowStep>
          </div>
        </div>
      </section>

      {/* ========== シナリオ別：企業の倉庫作業 ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="🏭"
          title="シナリオ例 3：企業の倉庫作業"
          sub="企業案件で多い棚卸し・仕分けの依頼パターン"
        />

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">依頼者（企業）が投稿する内容</p>
          <MockQuestForm
            category="倉庫整理・棚卸し"
            categoryIcon="🏭"
            title="倉庫内の商品仕分け＋棚入れ（約300点）"
            description="弊社倉庫にて、入荷された商品（段ボール約30箱 / 合計300点）をカテゴリ別に仕分けし、指定の棚に配置してください。仕分けルールの一覧表は当日お渡しします。安全靴をお持ちの方歓迎。"
            amount="¥12,000"
            prefecture="千葉県"
            city="船橋市"
          />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">チャットでのやり取り例</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <ChatSystem>冒険者「コウタ」さんがチャットを開始しました</ChatSystem>
            <ChatBubble from="コウタ（冒険者）" role="adventurer">
              倉庫作業の依頼を拝見しました。段ボール30箱で300点とのことですが、1箱あたり10点くらいの計算ですね。商品の重量はどのくらいですか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              1箱5〜8kgくらいです。中身は日用品なので特別重いものはありません。仕分け先は棚がA〜Dの4エリアに分かれていて、ルール表を見ながら振り分けてもらう形です。
            </ChatBubble>
            <ChatBubble from="コウタ（冒険者）" role="adventurer">
              了解です。安全靴は持っています。台車は倉庫にありますか？あとフォークリフトの作業はなしですよね？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              台車は2台あります。フォークリフトの操作は不要です。手作業の仕分けと棚入れだけです。日時は来週の水曜、9時に倉庫入口集合でお願いできますか？
            </ChatBubble>
            <ChatBubble from="コウタ（冒険者）" role="adventurer">
              水曜9時で大丈夫です。駐車場はありますか？あと、お昼休憩はどうしましょう？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              駐車場あります。お昼は近くにコンビニがあるのでそちらで。作業量的に午前中で終わりそうなら休憩なしでも構いません。終わった時点で完了で大丈夫です。
            </ChatBubble>
            <ChatBubble from="コウタ（冒険者）" role="adventurer">
              了解しました！では受注します。よろしくお願いします。
            </ChatBubble>
            <ChatSystem>コウタさんがクエストを受注しました ⚔️</ChatSystem>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 mb-3">この後の流れ</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <FlowStep emoji="⚔️" title="受注確定">
              コウタさんが受注。来週水曜の作業に備える。
            </FlowStep>
            <FlowStep emoji="🏭" title="作業当日">
              9時に倉庫到着。ルール表を受け取り、仕分け・棚入れを実施。
            </FlowStep>
            <FlowStep emoji="✅" title="完了報告">
              「30箱 / 300点の仕分け＋棚入れ完了しました」と報告。
            </FlowStep>
            <FlowStep emoji="🎉" title="承認・報酬分配">
              企業担当者が確認・承認 → コウタさんに ¥10,800 が自動送金。
            </FlowStep>
            <FlowStep emoji="⭐" title="相互評価" isLast>
              「手際よく作業してくれました。またお願いしたいです」★5
            </FlowStep>
          </div>
        </div>
      </section>

      {/* ========== シナリオ別：SNS投稿 ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="📱"
          title="シナリオ例 4：SNS投稿・口コミ（飲食店の集客）"
          sub="飲食店がフォロワーの多いSNSユーザーに来店＋投稿を依頼するパターン"
        />

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">依頼者（飲食店）が投稿する内容</p>
          <MockQuestForm
            category="SNS投稿・口コミ"
            categoryIcon="📱"
            title="当店のバーガーを食べてSNSに投稿してください！"
            description="渋谷の当店にご来店いただき、看板メニューのハンバーガーを実食＋写真付きでご自身のSNS（Instagram or X）に投稿してください。投稿にはお店の位置情報タグを含めてください。投稿URLをチャットで送っていただければ完了です。※フォロワー3万人以上の方限定です。"
            amount="¥10,000"
            prefecture="東京都"
            city="渋谷区"
          />
        </div>

        <div className="mb-3">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex gap-2">
            <span className="text-purple-500 flex-shrink-0">🎯</span>
            <div className="text-xs text-purple-700 leading-relaxed">
              <span className="font-semibold">ポイント：</span>
              「フォロワー3万人以上限定」のような条件は依頼内容に明記しましょう。
              冒険者（受注者）が受注前に自分が条件を満たしているか確認できます。
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">チャットでのやり取り例</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <ChatSystem>冒険者「アヤカ」さんがチャットを開始しました</ChatSystem>
            <ChatBubble from="アヤカ（冒険者）" role="adventurer">
              SNS投稿の依頼を拝見しました！Instagramフォロワー4.2万人です。グルメ系の投稿がメインなのでちょうど合うと思います。アカウントはこちらです → @ayaka_gourmet
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              アカウント拝見しました！雰囲気ぴったりです。来店はいつ頃ご都合いいですか？ランチタイム（11:30〜14:00）だと一番映えるメニューをお出しできます。
            </ChatBubble>
            <ChatBubble from="アヤカ（冒険者）" role="adventurer">
              今週金曜の12時頃伺えます！投稿内容に何かNGワードやハッシュタグの指定はありますか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              ハッシュタグは #渋谷ランチ #ハンバーガー を入れていただけると助かります。NGは特にないですが、競合店の名前は避けてください。あと位置情報タグを忘れずにお願いします！
            </ChatBubble>
            <ChatBubble from="アヤカ（冒険者）" role="adventurer">
              了解です！金曜に伺って、翌日までに投稿しますね。それでは受注させていただきます。
            </ChatBubble>
            <ChatSystem>アヤカさんがクエストを受注しました ⚔️</ChatSystem>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 mb-3">この後の流れ</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <FlowStep emoji="⚔️" title="受注確定">
              アヤカさんが受注。金曜のランチに来店予定。
            </FlowStep>
            <FlowStep emoji="🍔" title="来店・実食">
              金曜12時に来店。ハンバーガーを実食し、写真を撮影。
            </FlowStep>
            <FlowStep emoji="📱" title="SNS投稿＋URL送付">
              翌日までにInstagramに写真付き投稿。投稿URLをチャットで送信。
            </FlowStep>
            <FlowStep emoji="✅" title="完了報告">
              アヤカさんが完了報告を送信。
            </FlowStep>
            <FlowStep emoji="🎉" title="承認・報酬分配">
              投稿内容を確認して承認 → アヤカさんに ¥9,000 が自動送金。
            </FlowStep>
            <FlowStep emoji="⭐" title="相互評価" isLast>
              「写真がとても綺麗で、来客数が増えました！」★5
            </FlowStep>
          </div>
        </div>
      </section>

      {/* ========== シナリオ別：相談・アドバイス ========== */}
      <section className="mb-20">
        <SectionHeading
          icon="💬"
          title="シナリオ例 5：相談・アドバイス"
          sub="経験者に直接相談して具体的なアドバイスをもらうパターン"
        />

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">依頼者が投稿する内容</p>
          <MockQuestForm
            category="相談・アドバイス"
            categoryIcon="💬"
            title="副業の確定申告について経験者に相談したい"
            description="副業を始めて初めての確定申告を迎えます。何を準備すればいいか、経費の考え方、青色申告と白色申告の違いなど、経験者に相談したいです。1回の相談で疑問を解消できればOKです。オンライン（Zoom等）でお願いします。"
            amount="¥3,000"
            prefecture="東京都"
            city="オンライン"
          />
        </div>

        <div className="mb-3">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
            <span className="text-amber-500 flex-shrink-0">💡</span>
            <div className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">ポイント：</span>
              相談系の依頼は「時給」ではなく<strong>「1回の相談あたり」</strong>の報酬にしましょう。
              弁護士や税理士の相談料と同じ考え方で、業務委託として適切です。
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-2">チャットでのやり取り例</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <ChatSystem>冒険者「ケンジ」さんがチャットを開始しました</ChatSystem>
            <ChatBubble from="ケンジ（冒険者）" role="adventurer">
              確定申告の相談依頼を拝見しました。自分はフリーランスエンジニア7年目で、青色申告を毎年やっています。副業の種類はどのようなものですか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              ウーバーイーツの配達と、知人から頼まれたWebサイト制作です。年間の副業収入は80万円くらいです。
            </ChatBubble>
            <ChatBubble from="ケンジ（冒険者）" role="adventurer">
              なるほど、2種類の副業ですね。それぞれ経費の考え方が少し違うので、その辺りもお話しできます。Zoomで30〜40分くらいあれば一通り解説できると思いますが、いつ頃がいいですか？
            </ChatBubble>
            <ChatBubble from="あなた（依頼者）" role="client">
              今週の木曜の20時以降ならOKです。事前に聞きたいことリストを送っても大丈夫ですか？
            </ChatBubble>
            <ChatBubble from="ケンジ（冒険者）" role="adventurer">
              もちろんです！事前にリストをもらえると準備ができるのでありがたいです。では受注しますね。ZoomのURLは前日にチャットで送ります。
            </ChatBubble>
            <ChatSystem>ケンジさんがクエストを受注しました ⚔️</ChatSystem>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 mb-3">この後の流れ</p>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <FlowStep emoji="⚔️" title="受注確定">
              ケンジさんが受注。木曜20時にZoom相談予定。
            </FlowStep>
            <FlowStep emoji="📝" title="事前準備">
              依頼者が質問リストをチャットで送信。ケンジさんが回答を準備。
            </FlowStep>
            <FlowStep emoji="💬" title="Zoom相談">
              木曜20時にZoomで相談。約40分で疑問を解消。
            </FlowStep>
            <FlowStep emoji="✅" title="完了報告">
              ケンジさんが完了報告。「確定申告相談完了。追加の質問があればチャットでどうぞ」
            </FlowStep>
            <FlowStep emoji="🎉" title="承認・報酬分配">
              承認 → ケンジさんに ¥2,700 が自動送金。
            </FlowStep>
            <FlowStep emoji="⭐" title="相互評価" isLast>
              「とても分かりやすく、具体的なアドバイスでした」★5
            </FlowStep>
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
