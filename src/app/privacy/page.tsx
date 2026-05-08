import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | Guild',
  description: 'Guildのプライバシーポリシーです。個人情報の取り扱いについて説明します。',
};

const LAST_UPDATED = '2025年1月1日';
const SERVICE_NAME = 'Guild';
const COMPANY_EMAIL = 'yvtq0412@gmail.com';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ヘッダー */}
      <div className="mb-10">
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition">TOP</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">プライバシーポリシー</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-400">最終更新日：{LAST_UPDATED}</p>
      </div>

      <div className="prose-custom space-y-8 text-sm leading-relaxed text-gray-600">

        {/* 前文 */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-indigo-800 text-sm leading-relaxed">
          {SERVICE_NAME}（以下「本サービス」）を運営する運営者（以下「当社」）は、ユーザーの個人情報の保護を重要な責務と捉え、以下のプライバシーポリシー（以下「本ポリシー」）に従い、適切に取り扱います。
        </div>

        <Section title="第1条（収集する情報）">
          <p>当社は、本サービスの提供にあたり、以下の情報を収集します。</p>
          <SubSection title="1. ユーザーが直接提供する情報">
            <ul>
              <li>氏名・表示名</li>
              <li>メールアドレス</li>
              <li>パスワード（暗号化して保存）</li>
              <li>役割区分（依頼者・ワーカー・両方）</li>
              <li>適格請求書発行事業者登録番号（任意）</li>
              <li>住所（請求書発行時のみ、任意）</li>
            </ul>
          </SubSection>
          <SubSection title="2. 決済関連情報">
            <p>クレジットカード情報等の決済情報は、決済代行サービス「Stripe」が直接収集・管理します。当社はカード番号等の機密情報を保有しません。Stripeのプライバシーポリシーについては<a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stripe社のサイト</a>をご確認ください。</p>
          </SubSection>
          <SubSection title="3. 自動的に収集される情報">
            <ul>
              <li>IPアドレス・アクセスログ</li>
              <li>ブラウザの種類・バージョン</li>
              <li>アクセス日時・利用履歴</li>
              <li>Cookie・類似技術による情報</li>
            </ul>
          </SubSection>
          <SubSection title="4. 取引に関する情報">
            <ul>
              <li>依頼・受注の内容および履歴</li>
              <li>取引金額・決済情報</li>
              <li>ユーザー間のチャットメッセージ</li>
              <li>評価・レビュー情報</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="第2条（利用目的）">
          <p>収集した情報は、以下の目的に利用します。</p>
          <ol>
            <li>本サービスの提供・運営・改善</li>
            <li>ユーザー認証およびアカウント管理</li>
            <li>エスクロー決済・報酬分配の処理</li>
            <li>適格請求書（インボイス）の発行</li>
            <li>源泉徴収に関する税務処理</li>
            <li>本人確認・不正利用の防止</li>
            <li>カスタマーサポートへの対応</li>
            <li>サービスに関する重要なお知らせの送信</li>
            <li>利用規約違反の調査・対応</li>
            <li>統計情報の作成（個人を特定しない形式）</li>
          </ol>
        </Section>

        <Section title="第3条（第三者提供）">
          <p>当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          <ol>
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合（警察・裁判所等からの照会など）</li>
            <li>人の生命・身体・財産の保護に必要で、本人の同意が困難な場合</li>
            <li>本サービスの運営に必要な業務委託先への提供（守秘義務あり）</li>
          </ol>
          <SubSection title="利用する主な外部サービス">
            <ul>
              <li><strong>Firebase / Google Cloud（Google LLC）</strong>：認証・データベース・ホスティング</li>
              <li><strong>Stripe（Stripe, Inc.）</strong>：決済処理・振込・本人確認</li>
              <li><strong>Vercel, Inc.</strong>：Webアプリケーションのホスティング</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="第4条（データの保管と安全管理）">
          <ol>
            <li>個人情報は、Firebase（Google Cloud）のサーバーに保管されます。データセンターは主に東京リージョン（asia-northeast1）を使用します。</li>
            <li>通信はTLS/SSLにより暗号化されます。</li>
            <li>パスワードはFirebase Authenticationにより安全にハッシュ化されます。</li>
            <li>カード情報はStripeのPCI DSS準拠環境でのみ管理されます。</li>
            <li>従業員によるアクセスは業務上の必要に限定し、最小権限の原則を適用します。</li>
          </ol>
        </Section>

        <Section title="第5条（チャットメッセージの取り扱い）">
          <ol>
            <li>ユーザー間のチャットメッセージは、取引の円滑な進行のために保存されます。</li>
            <li>メッセージは取引に関係するユーザー（依頼者・受注者）のみが閲覧できます。</li>
            <li>不正利用の調査・紛争解決のために、当社スタッフが必要に応じてメッセージを確認する場合があります。</li>
            <li>取引完了後も一定期間（原則として取引終了から1年間）保存します。</li>
          </ol>
        </Section>

        <Section title="第6条（Cookieの使用）">
          <p>本サービスでは、以下の目的でCookieを使用します。</p>
          <ul>
            <li>ログイン状態の維持（セッション管理）</li>
            <li>サービスの利便性向上（設定の保存）</li>
            <li>アクセス解析（サービス改善目的）</li>
          </ul>
          <p>ブラウザの設定によりCookieを無効にすることが可能ですが、一部機能が使用できなくなる場合があります。</p>
        </Section>

        <Section title="第7条（保存期間）">
          <p>個人情報の保存期間は以下の通りです。</p>
          <ul>
            <li><strong>アカウント情報</strong>：退会後3年間（法令上の義務がある場合はその期間）</li>
            <li><strong>取引記録・決済情報</strong>：取引完了後7年間（税務上の保存義務）</li>
            <li><strong>チャットメッセージ</strong>：取引完了後1年間</li>
            <li><strong>アクセスログ</strong>：90日間</li>
          </ul>
        </Section>

        <Section title="第8条（ユーザーの権利）">
          <p>ユーザーは以下の権利を有します。</p>
          <ul>
            <li><strong>開示請求</strong>：保有する個人情報の内容確認</li>
            <li><strong>訂正・削除請求</strong>：誤りのある情報の修正・削除</li>
            <li><strong>利用停止請求</strong>：目的外利用の停止</li>
            <li><strong>退会・アカウント削除</strong>：マイページから申請可能</li>
          </ul>
          <p>各種請求は <Link href="/contact" className="text-indigo-600 hover:underline">お問い合わせフォーム</Link> よりご連絡ください。合理的な期間内に対応します。</p>
          <p className="text-gray-400 text-xs mt-2">※ 法令上の保存義務がある情報は、請求に応じられない場合があります。</p>
        </Section>

        <Section title="第9条（未成年者の利用）">
          <p>本サービスは18歳以上を対象としています。18歳未満の方が利用する場合は、保護者の同意が必要です。未成年者から個人情報を収集したと判明した場合、速やかに削除します。</p>
        </Section>

        <Section title="第10条（プライバシーポリシーの変更）">
          <p>当社は、法令の改正やサービス内容の変更に伴い、本ポリシーを改定することがあります。重要な変更の場合は、サービス上またはメールにて事前にお知らせします。改定後もサービスを継続してご利用いただいた場合、改定後のポリシーに同意したものとみなします。</p>
        </Section>

        <Section title="第11条（お問い合わせ）">
          <p>本ポリシーに関するご質問・苦情・ご相談は以下の窓口までご連絡ください。</p>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
            <p><strong>Guild 個人情報取り扱い窓口</strong></p>
            <p><Link href="/contact" className="text-indigo-600 hover:underline">お問い合わせフォームはこちら</Link></p>
            <p className="text-gray-400 text-xs mt-2">受付時間：平日10:00〜18:00（土日祝・年末年始を除く）</p>
          </div>
        </Section>

      </div>

      {/* フッターリンク */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
        <Link href="/terms" className="text-indigo-500 hover:text-indigo-600 transition">利用規約</Link>
        <Link href="/about" className="text-gray-400 hover:text-gray-600 transition">Guildについて</Link>
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition">TOPへ戻る</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-600 [&_p]:text-gray-600 [&_strong]:text-gray-700 [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-600 [&_p]:text-gray-600">
        {children}
      </div>
    </div>
  );
}
