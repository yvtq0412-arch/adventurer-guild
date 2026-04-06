import Link from 'next/link';

export const metadata = {
  title: '利用規約 | Guild',
  description: 'Guildの利用規約です。サービスをご利用いただく前に必ずお読みください。',
};

const LAST_UPDATED = '2025年1月1日';
const SERVICE_NAME = 'Guild（冒険者ギルド）';
const SUPPORT_EMAIL = 'yvtq0412@gmail.com';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ヘッダー */}
      <div className="mb-10">
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-500 transition">TOP</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">利用規約</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-sm text-gray-400">最終更新日：{LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-gray-600">

        {/* 前文 */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-amber-800 text-sm leading-relaxed">
          本利用規約（以下「本規約」）は、{SERVICE_NAME}（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上でご利用いただきます。本サービスに登録・利用した時点で、本規約に同意したものとみなします。
        </div>

        <Section title="第1条（定義）">
          <p>本規約において使用する用語の定義は以下の通りです。</p>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-3 text-xs text-gray-500">
            本サービスでは世界観として独自の用語を使用していますが、法的な意味は以下の通りです。
          </div>
          <ul>
            <li><strong>「本サービス」</strong>：当社が運営する{SERVICE_NAME}およびその関連サービス全般</li>
            <li><strong>「ユーザー」</strong>：本サービスに登録した全ての個人・法人</li>
            <li><strong>「依頼者」</strong>：本サービスを通じて作業・サービスを依頼するユーザー（発注者）</li>
            <li><strong>「冒険者」（受注者）</strong>：本サービスを通じて依頼を受注し、作業を行うユーザー。本規約における「冒険者」は一般的な「受注者」「ワーカー」「フリーランサー」と同義です。</li>
            <li><strong>「クエスト」（依頼）</strong>：依頼者が本サービス上に投稿する作業依頼。本規約における「クエスト」は一般的な「依頼」「案件」「タスク」と同義です。</li>
            <li><strong>「ギルドカード」（受注者プロフィール）</strong>：冒険者（受注者）の本人確認・スキル・実績をまとめたプロフィール。クエスト（依頼）の受注に必要です。</li>
            <li><strong>「エスクロー」（仮払い・第三者預託）</strong>：取引の安全を確保するため、当社が指定する決済事業者（Stripe, Inc.）を通じて報酬を一時的に預託する仕組み。当社自身が資金を預かるものではありません。作業完了・依頼者の承認後に冒険者（受注者）へ送金されます。</li>
            <li><strong>「ギルド手数料」（サービス利用料）</strong>：本サービスの利用対価として取引金額から差し引かれる手数料（基本15%、ランクにより10%〜15%で変動）</li>
            <li><strong>「ランク」（受注者の信頼度）</strong>：冒険者（受注者）の実績・評価に基づくF〜Sの7段階の信頼度指標。ランクが高いほどギルド手数料（サービス利用料）が優遇されます。</li>
          </ul>
        </Section>

        <Section title="第2条（アカウント登録）">
          <ol>
            <li>本サービスの利用には、正確な情報によるアカウント登録が必要です。</li>
            <li>登録できるのは満18歳以上の個人または法人の代表者・担当者に限ります。</li>
            <li>1人のユーザーが複数のアカウントを保有することは禁止します。</li>
            <li>アカウント情報（メールアドレス・パスワード）の管理はユーザー自身の責任で行ってください。</li>
            <li>アカウントの不正利用が判明した場合は、速やかに当社へ報告してください。</li>
            <li>登録情報に変更が生じた場合は、速やかに更新してください。</li>
          </ol>
        </Section>

        <Section title="第3条（サービスの内容）">
          <ol>
            <li>本サービスは、リアルな作業・サービス（清掃、草取り、引越し、イベント設営等）の依頼者（発注者）と冒険者（受注者）をマッチングするプラットフォームです。</li>
            <li>当社は仲介者として取引の場を提供するものであり、依頼者と冒険者（受注者）の間の契約当事者ではありません。</li>
            <li>取引に関する最終的な責任は、依頼者と冒険者（受注者）の間に帰属します。</li>
            <li>当社は合理的な努力をもってサービスの継続的な提供に努めますが、システムメンテナンス等により一時的に利用できない場合があります。</li>
          </ol>
        </Section>

        <Section title="第4条（エスクロー決済）">
          <ol>
            <li>依頼者はクエスト（依頼）投稿時に報酬全額をエスクロー（Stripeによる仮払い・決済預かり）します。</li>
            <li>エスクロー完了後、クエスト（依頼）は「募集中」状態となり冒険者（受注者）が応募できます。</li>
            <li>冒険者（受注者）が作業完了を報告し、依頼者が承認した時点で報酬が冒険者（受注者）に分配されます。</li>
            <li>分配額は「取引金額 − ギルド手数料（サービス利用料 15%〜10%）」です。端数は切り捨て（ギルド側が負担）とします。</li>
            <li>Stripe Connect（振込）を利用するため、冒険者（受注者）は Stripe のオンボーディング（本人確認）が必要です。</li>
          </ol>
        </Section>

        <Section title="第5条（ギルド手数料）">
          <ol>
            <li>本サービスの利用対価として、取引金額の15%をギルド手数料（サービス利用料）として徴収します。冒険者（受注者）のランクに応じて10%〜15%で変動します。</li>
            <li>手数料率は事前告知の上、変更する場合があります。</li>
            <li>手数料は冒険者（受注者）の報酬から差し引かれます（依頼者が支払う金額には含まれません）。</li>
            <li>手数料に関する消費税はギルド手数料内に含まれます。</li>
          </ol>
        </Section>

        <Section title="第6条（源泉徴収）">
          <ol>
            <li>現在、本サービスで取り扱うカテゴリ（草刈り、清掃、運搬、行列代行、SNS投稿等）には、所得税法に基づく源泉徴収の対象となるカテゴリはありません。</li>
            <li>将来、デザイン・執筆・翻訳等の源泉徴収対象カテゴリが追加された場合は、以下の税率で冒険者（受注者）への報酬から控除されます。<br />
              <span className="text-gray-500 ml-4">・100万円以下の部分：報酬額の10.21%</span><br />
              <span className="text-gray-500 ml-4">・100万円超の部分：報酬額の20.42%</span>
            </li>
            <li>源泉徴収が適用されるカテゴリが追加された場合、当社は事前にユーザーに通知します。</li>
            <li>冒険者（受注者）が得た報酬に関する所得税の申告・納付は、冒険者（受注者）本人の責任において行ってください。</li>
          </ol>
        </Section>

        <Section title="第7条（インボイス制度への対応）">
          <ol>
            <li>本サービスは適格請求書等保存方式（インボイス制度）に対応しています。</li>
            <li>適格請求書発行事業者の冒険者は、登録番号を登録することで適格請求書の発行が可能です。</li>
            <li>インボイス登録番号の真正性については、ユーザー自身が責任を持って管理・届出してください。</li>
          </ol>
        </Section>

        <Section title="第8条（キャンセル・返金）">
          <table>
            <thead>
              <tr>
                <th>キャンセルのタイミング</th>
                <th>返金対応</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>冒険者受諾前（ESCROWED）</td>
                <td>全額返金（エスクロー解除）</td>
              </tr>
              <tr>
                <td>作業中（WORK_IN_PROGRESS）</td>
                <td>90%返金、10%はギルドが維持費として保持</td>
              </tr>
              <tr>
                <td>作業完了報告後（COMPLETED）</td>
                <td>原則返金不可（紛争申立て可）</td>
              </tr>
            </tbody>
          </table>
          <ul className="mt-3">
            <li>返金はStripeを通じて行われ、クレジットカードへの返金には3〜10営業日かかる場合があります。</li>
            <li>天災・感染症等の不可抗力による場合は、個別に対応を検討します。</li>
          </ul>
        </Section>

        <Section title="第9条（紛争解決）">
          <ol>
            <li>依頼者・冒険者間で紛争が生じた場合、まず当事者間での解決を試みてください。</li>
            <li>解決が困難な場合、本サービスの紛争申立て機能から申告してください。</li>
            <li>当社は当事者の意見を踏まえて仲裁を行いますが、拘束力のある判断を下す義務は負いません。</li>
            <li>当社の仲裁結果に従わない場合、アカウントを停止する場合があります。</li>
          </ol>
        </Section>

        <Section title="第10条（禁止事項）">
          <p>以下の行為を禁止します。違反した場合、アカウント停止・法的措置を取ることがあります。</p>
          <SubSection title="決済・取引に関する禁止事項">
            <ul>
              <li>本サービスを介さない「直接取引」（プラットフォーム外での報酬授受）</li>
              <li>虚偽の作業完了報告・承認</li>
              <li>不正な返金・チャージバック申請</li>
              <li>マネーロンダリングその他の不正な金銭取引</li>
            </ul>
          </SubSection>
          <SubSection title="コミュニティに関する禁止事項">
            <ul>
              <li>虚偽情報によるアカウント登録</li>
              <li>他のユーザーへのハラスメント・脅迫・差別的言動</li>
              <li>個人情報の無断収集・漏洩</li>
              <li>スパム・迷惑メッセージの送信</li>
              <li>他ユーザーへの成りすまし</li>
            </ul>
          </SubSection>
          <SubSection title="法令・その他">
            <ul>
              <li>違法な作業依頼・受注（許認可が必要な業務を無許可で行う等）</li>
              <li>資格・免許が必要な作業において、虚偽の資格申告を行うこと</li>
              <li>当社システムへの不正アクセス・破壊行為</li>
              <li>本サービスの競合サービスへのユーザー誘導</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="第10条の2（資格・免許が必要な作業について）">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-red-800 text-xs leading-relaxed">
            ⚠️ 本条は、免許・資格・許認可が必要な作業に関する責任の所在と、虚偽申告に対する対応を定めます。必ずお読みください。
          </div>
          <ol>
            <li><strong>依頼者の確認義務：</strong>依頼者は、クエストとして依頼しようとする作業に資格・免許・許認可が必要かどうかを、事前に自己の責任で確認してください。当社はその判断を保証しません。</li>
            <li><strong>冒険者の自己申告：</strong>冒険者は、資格・免許・許認可が必要な作業を受注する場合、当該資格等を現に保有していることを保証するものとします。プロフィールへの資格記載はユーザー自身の自己申告であり、当社はその真正性を審査・保証しません。</li>
            <li><strong>虚偽申告の禁止と責任：</strong>資格・免許を保有していないにもかかわらず、これを保有しているとして受注した場合、依頼者に生じた一切の損害について、当該冒険者が全責任を負います。</li>
            <li><strong>記録の開示：</strong>資格・免許に関する虚偽申告が疑われ、当事者間で民事上の紛争が生じた場合、当社は裁判所その他法令に基づく機関からの要請、または被害を受けた当事者からの正当な申立てに基づき、以下の記録を開示することがあります。
              <ul className="mt-2">
                <li>受注時のユーザー登録情報（氏名・住所・メールアドレス等の本人確認情報）</li>
                <li>プロフィールに記載された資格・スキル情報の登録履歴</li>
                <li>依頼者・冒険者間のメッセージ・チャット履歴</li>
                <li>受注・作業完了・報酬受取に関する取引履歴</li>
                <li>アクセスログ（IPアドレス・端末情報等）</li>
              </ul>
            </li>
            <li><strong>抑止について：</strong>本サービスでは本人確認（Stripe Connect によるKYC）が完了したユーザーのみが報酬を受け取れる仕組みとなっています。資格・免許に関する虚偽申告は、身元が特定された状態での不正行為となるため、民事・刑事上の責任を問われる可能性が極めて高くなります。</li>
            <li><strong>アカウント措置：</strong>虚偽申告が確認または強く疑われる場合、当社は予告なくアカウントを停止・永久BANし、関係当局への情報提供を行うことがあります。</li>
          </ol>
        </Section>

        <Section title="第11条（知的財産権）">
          <ol>
            <li>本サービスのロゴ・デザイン・コンテンツ等の著作権・商標権は当社に帰属します。</li>
            <li>ユーザーが投稿した依頼内容・プロフィール等の著作権はユーザーに帰属しますが、サービス改善・マーケティング目的での利用を許諾するものとします。</li>
            <li>取引で冒険者が制作した成果物の著作権は、別途当事者間での合意に基づきます。</li>
          </ol>
        </Section>

        <Section title="第12条（免責事項）">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-amber-800 text-sm">
            本条は運営の責任範囲を明確にする重要な条項です。必ずご確認ください。
          </div>
          <SubSection title="一般的な免責事項">
            <ol>
              <li>当社は、ユーザー間の取引によって生じたトラブル・損害について、当社の故意または重大な過失がある場合を除き、一切の責任を負いません。</li>
              <li>本サービスは現状有姿（as-is）で提供され、特定目的への適合性・正確性・完全性を保証しません。</li>
              <li>天災・通信障害・StripeやFirebase等の外部サービス障害による損害について責任を負いません。</li>
              <li>当社の損害賠償責任が認められる場合でも、その上限は当該ユーザーが過去3ヶ月間に支払ったギルド手数料相当額とします。</li>
            </ol>
          </SubSection>
          <SubSection title="依頼内容の法的適合性に関する免責">
            <ol>
              <li>当社は、ユーザーが投稿した依頼内容が日本国の法令に適合しているかどうかを保証するものではありません。依頼内容の法的適合性の判断は、依頼者および受注者の双方の責任において行うものとします。</li>
              <li>当社は、禁止依頼ガイドラインの策定・公表、利用規約における禁止事項の明示、依頼投稿時および受注時の確認チェックの設置等、法令違反を防止するための合理的な措置を講じていますが、ユーザーがこれらに違反した場合に生じた損害について、当社は一切の責任を負いません。</li>
              <li>ユーザー間で法令違反の依頼が行われた場合、違反行為を行ったユーザーが全ての法的責任を負うものとします。</li>
              <li>法令に違反する依頼の投稿または受注が発覚した場合、当社は当該依頼の削除、関係ユーザーのアカウント停止、関係当局への情報提供等の措置を取ることができます。</li>
            </ol>
          </SubSection>
          <SubSection title="資格・免許に関する免責">
            <ol>
              <li>当社は、受注者が保有する資格・免許の真正性を確認・保証するものではありません。資格・免許の確認は依頼者の責任において行うものとします。</li>
              <li>受注者が虚偽の資格申告を行い、これにより損害が生じた場合、当社は一切の責任を負いません。虚偽の申告を行った受注者が全ての法的責任を負うものとします。</li>
            </ol>
          </SubSection>
          <SubSection title="通報制度に関する免責">
            <ol>
              <li>当社は、ユーザーからの通報に基づきアカウントの停止等の措置を行いますが、通報内容の正確性を保証するものではありません。</li>
              <li>通報に基づく措置により不利益を被ったユーザーに対し、当社は故意または重大な過失がある場合を除き、責任を負いません。</li>
            </ol>
          </SubSection>
        </Section>

        <Section title="第13条（サービスの変更・終了）">
          <ol>
            <li>当社は、必要と判断した場合、事前告知の上でサービス内容の変更・停止・終了を行うことができます。</li>
            <li>サービス終了の場合、エスクロー中の資金については適切に返金処理を行います。</li>
            <li>サービス変更・終了によってユーザーに損害が生じても、当社は責任を負いません。</li>
          </ol>
        </Section>

        <Section title="第14条（アカウント停止・退会）">
          <ol>
            <li>ユーザーはいつでも退会申請が可能です。ただし、進行中の取引がある場合は完了後に退会処理されます。</li>
            <li>当社は以下の場合にアカウントを停止・削除できます。
              <ul className="mt-2">
                <li>本規約に違反した場合</li>
                <li>不正行為が確認された場合</li>
                <li>長期間（1年以上）利用がない場合</li>
                <li>その他当社が不適切と判断した場合</li>
              </ul>
            </li>
            <li>アカウント停止・削除に際して、事前通知が困難な場合はこの限りではありません。</li>
          </ol>
        </Section>

        <Section title="第15条（規約の変更）">
          <ol>
            <li>当社は、ユーザーの一般の利益に適合する場合、または社会情勢・法令の変化等により必要と判断した場合、本規約を変更できます。</li>
            <li>重要な変更を行う場合、変更の内容と施行日をサービス上またはメールにて通知します。</li>
            <li>変更後もサービスを継続利用した場合、変更後の規約に同意したものとみなします。</li>
          </ol>
        </Section>

        <Section title="第16条（準拠法・裁判管轄）">
          <ol>
            <li>本規約は日本法に準拠し、日本法に従って解釈されます。</li>
            <li>本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
          </ol>
        </Section>

        <Section title="第17条（お問い合わせ）">
          <p>本規約に関するご質問・ご相談は以下の窓口までご連絡ください。</p>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
            <p><strong>Guild サポート窓口</strong></p>
            <p><Link href="/contact" className="text-indigo-600 hover:underline">お問い合わせフォームはこちら</Link></p>
            <p className="text-gray-400 text-xs mt-2">受付時間：平日10:00〜18:00（土日祝・年末年始を除く）</p>
          </div>
        </Section>

      </div>

      {/* フッターリンク */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
        <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600 transition">プライバシーポリシー</Link>
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
      <div className="space-y-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-600 [&_p]:text-gray-600 [&_strong]:text-gray-700 [&_strong]:font-medium [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:mt-2 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-gray-700 [&_th]:border [&_th]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-600">
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
