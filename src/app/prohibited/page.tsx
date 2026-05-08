import Link from 'next/link';

export const metadata = {
  title: '禁止サービスガイドライン | Guild',
  description: 'Guildで投稿が禁止されている依頼の一覧です。法令違反となる依頼や、プラットフォームのルールに反する行為を確認してください。',
};

function CategorySection({
  icon,
  title,
  description,
  items,
}: {
  icon: string;
  title: string;
  description: string;
  items: { example: string; reason: string; law: string }[];
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-sm font-bold shrink-0 mt-0.5">NG</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{item.example}</p>
                <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                <p className="text-[10px] text-red-400 mt-1">根拠法: {item.law}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProhibitedPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* ヘッダー */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>🚫</span> 禁止サービスガイドライン
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          投稿が禁止されている依頼
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          以下に該当する依頼はGuildでの投稿・受注が禁止されています。
          違反した場合はアカウント停止（BAN）の対象となります。
        </p>
      </div>

      {/* 重要な注意書き */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-12">
        <h3 className="text-sm font-bold text-red-700 mb-2">重要</h3>
        <ul className="space-y-1.5 text-sm text-red-600 leading-relaxed">
          <li>以下は代表的な禁止例です。ここに記載されていない場合でも、法令に違反する依頼は全て禁止です。</li>
          <li>「知らなかった」は免責事由になりません。利用規約同意時にこのページの確認を求めています。</li>
          <li>禁止依頼を投稿した場合、依頼の削除・アカウント停止・法的措置の対象となります。</li>
          <li>禁止依頼と知りつつ受注した場合も同様の処分対象です。</li>
        </ul>
      </div>

      {/* ========== カテゴリ別禁止依頼 ========== */}

      <CategorySection
        icon="🚗"
        title="運送・交通系"
        description="人や物の運送には法律上の許可・届出が必要です。"
        items={[
          { example: '「〇〇まで車で送ってください」', reason: '報酬を得て人を車で運ぶ行為は、二種免許＋旅客運送事業許可が必要。無許可は「白タク行為」に該当。', law: '道路運送法 第4条・第96条' },
          { example: '「飲んだので運転代行してください」', reason: '運転代行業には都道府県公安委員会への届出が必要。無届は違法。', law: '自動車運転代行業法 第3条' },
          { example: '「バイクで荷物を届けてください」（業として反復継続）', reason: '貨物軽自動車運送事業の届出が必要な場合がある。単発の個人的な頼みごとはOK。', law: '貨物自動車運送事業法 第36条' },
        ]}
      />

      <CategorySection
        icon="🏥"
        title="医療・健康系"
        description="医療行為・医業類似行為は国家資格が必須です。"
        items={[
          { example: '「マッサージ・整体をしてください」', reason: '「マッサージ」は、あん摩マッサージ指圧師の国家資格が必要。無資格での施術は違法。', law: 'あはき法（あん摩マッサージ指圧師、はり師、きゆう師等に関する法律）第1条' },
          { example: '「注射・点滴をしてください」', reason: '医師または医師の指示を受けた看護師以外が行うことは違法。', law: '医師法 第17条' },
          { example: '「薬を処方・調合してください」', reason: '薬剤師免許なしでの調剤は違法。', law: '薬剤師法 第19条' },
          { example: '「歯のクリーニング・ホワイトニングをしてください」', reason: '歯科医師または歯科衛生士の資格が必要。', law: '歯科医師法 第17条' },
          { example: '「カウンセリング（臨床心理）をしてください」', reason: '「心理師」を名乗っての業務は公認心理師の資格が必要。※ 経験者の相談・アドバイスとして明確に区分すればOK。', law: '公認心理師法 第2条' },
        ]}
      />

      <CategorySection
        icon="🔧"
        title="建設・工事系"
        description="電気・ガス・水道・建設工事には資格や許可が必要です。"
        items={[
          { example: '「コンセントの増設・配線工事をしてください」', reason: '電気工事士の資格が必要。無資格での工事は感電・火災リスク。', law: '電気工事士法 第3条' },
          { example: '「ガスコンロの設置・ガス管工事をしてください」', reason: 'ガス消費機器設置工事監督者等の資格が必要。', law: 'ガス事業法 第159条' },
          { example: '「水道管の修理・配管工事をしてください」', reason: '給水装置工事は指定給水装置工事事業者でなければ施工不可。', law: '水道法 第16条の2' },
          { example: '「家の増築・リフォーム工事をしてください」（500万円以上）', reason: '500万円以上の建設工事は建設業許可が必要。', law: '建設業法 第3条' },
          { example: '「エアコンの取り付け（配管含む）をしてください」', reason: '冷媒配管の接続にはフロン排出抑制法に基づく技術者が必要な場合あり。電気工事も伴う。', law: '電気工事士法・フロン排出抑制法' },
        ]}
      />

      <CategorySection
        icon="⚖️"
        title="法務・士業系"
        description="法律・税務・登記等の専門業務は有資格者のみが行えます。"
        items={[
          { example: '「裁判の相談に乗ってください」（報酬を得て法的助言）', reason: '報酬を得て法律事務を行うことは弁護士でなければ違法（非弁行為）。', law: '弁護士法 第72条' },
          { example: '「確定申告書を作成してください」', reason: '税務書類の作成は税理士の独占業務。', law: '税理士法 第2条・第52条' },
          { example: '「会社の登記申請書を作ってください」', reason: '登記申請書類の作成は司法書士の独占業務。', law: '司法書士法 第3条' },
          { example: '「許認可の申請書を作ってください」', reason: '官公署に提出する書類の作成は行政書士の独占業務。', law: '行政書士法 第1条の2' },
          { example: '「特許の出願手続きをしてください」', reason: '特許出願の代理は弁理士の独占業務。', law: '弁理士法 第4条' },
        ]}
      />

      <CategorySection
        icon="🛡️"
        title="安全・警備・調査系"
        description="警備業務や探偵業務は許可・届出が必要です。"
        items={[
          { example: '「工事現場で交通誘導をしてください」', reason: '交通誘導警備は警備業の認定が必要。', law: '警備業法 第2条・第4条' },
          { example: '「ボディガード・護衛をしてください」', reason: '身辺警護は警備業の認定が必要。', law: '警備業法 第2条' },
          { example: '「浮気調査・素行調査をしてください」', reason: '探偵業は公安委員会への届出が必要。無届は違法。', law: '探偵業法 第4条' },
        ]}
      />

      <CategorySection
        icon="🌍"
        title="環境・廃棄物系"
        description="廃棄物の収集運搬や特殊な除去作業には許可が必要です。"
        items={[
          { example: '「産業廃棄物を運んでください」', reason: '産業廃棄物の収集運搬には都道府県知事の許可が必要。', law: '廃棄物の処理及び清掃に関する法律 第14条' },
          { example: '「アスベスト（石綿）の除去をしてください」', reason: '石綿除去は特別教育を受けた作業者が必要。極めて危険。', law: '石綿障害予防規則 第4条' },
          { example: '「PCB（ポリ塩化ビフェニル）を処理してください」', reason: '特別管理産業廃棄物。専門の許可業者のみが処理可能。', law: 'PCB廃棄物特別措置法' },
        ]}
      />

      <CategorySection
        icon="🍺"
        title="販売・営業系"
        description="許可なく販売すると違法になる商品・サービスがあります。"
        items={[
          { example: '「お酒を仕入れて販売してください」', reason: '酒類の販売には税務署長の免許が必要。', law: '酒税法 第9条' },
          { example: '「中古品の買取・転売をしてください」', reason: '業として古物の売買を行うには古物商許可が必要。', law: '古物営業法 第3条' },
          { example: '「ペットを預かって世話してください」（業として反復継続）', reason: '動物取扱業の登録が必要な場合がある。個人の一時的な依頼はOK。', law: '動物愛護管理法 第10条' },
        ]}
      />

      <CategorySection
        icon="🚨"
        title="犯罪・公序良俗系"
        description="犯罪行為や公序良俗に反する依頼は全面禁止です。"
        items={[
          { example: '「銀行口座を開設してください」', reason: '他人名義の口座売買・開設は犯罪（マネーロンダリング）。', law: '犯罪収益移転防止法' },
          { example: '「選挙で投票してください」「選挙の応援をしてください」', reason: '選挙運動への報酬は公職選挙法違反（買収罪）。', law: '公職選挙法 第221条' },
          { example: '「宗教への勧誘活動を手伝ってください」', reason: 'プラットフォームの性質上禁止。', law: '利用規約 第10条' },
          { example: '「出会い系・マッチング目的の依頼」', reason: 'サービスの目的外利用。', law: '利用規約 第10条' },
          { example: '「他人の個人情報を調べてください」', reason: '個人情報の不正取得は違法。', law: '個人情報保護法' },
          { example: '「著作物を無断コピー・複製してください」', reason: '著作権侵害。', law: '著作権法 第21条' },
        ]}
      />

      <CategorySection
        icon="⏰"
        title="労働契約リスクのある依頼"
        description="時間拘束型の依頼は雇用契約（労働契約）と判断されるリスクがあります。"
        items={[
          { example: '「10時〜16時まで農業の手伝いをしてください」', reason: '時間指定＋指揮命令下の労働は雇用契約と見なされる可能性が高い。作業内容・量で記載してください。', law: '労働基準法 第9条・第15条' },
          { example: '「毎週月〜金の9時〜17時で事務をしてください」', reason: '反復継続の時間拘束は完全に雇用契約。Guildで依頼できる範囲を超えています。', law: '労働基準法・労働契約法' },
        ]}
      />

      {/* OKな依頼の例 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-12">
        <h3 className="text-base font-bold text-emerald-800 mb-3 flex items-center gap-2">
          <span>✅</span> こんな依頼はOKです
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { text: '庭の草取り・落ち葉の袋詰め', note: '作業量で定義' },
            { text: '引越しの荷物運び', note: '運送業ではなく手伝い' },
            { text: '部屋の掃除・片付け', note: '家事代行として適切' },
            { text: '家具の組み立て', note: '資格不要' },
            { text: '買い物代行', note: '日用品の購入代行' },
            { text: 'SNS投稿・口コミ', note: '成果報酬型' },
            { text: '行列の並び代行', note: '代行サービス' },
            { text: '経験者への相談（1回あたり報酬）', note: '士業の独占業務でなければOK' },
            { text: 'イベントの設営・撤去', note: '力仕事の手伝い' },
            { text: '倉庫の棚卸し・仕分け', note: '軽作業' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-2 text-sm">
              <span className="text-emerald-500 shrink-0">✓</span>
              <div>
                <span className="text-emerald-800">{item.text}</span>
                <span className="text-emerald-500 text-xs ml-1">({item.note})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 包括条項 */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12">
        <h3 className="text-sm font-bold text-gray-700 mb-2">包括条項</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          上記は代表的な禁止依頼の例示であり、全てを網羅するものではありません。
          日本国の法令に違反する依頼、または違反の恐れがある依頼は、
          <strong>記載の有無にかかわらず全て禁止</strong>です。
          判断に迷う場合は、投稿前に必ず専門家にご相談ください。
        </p>
      </div>

      {/* 免責 */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
        <h3 className="text-sm font-bold text-amber-700 mb-2">運営の免責について</h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          Guildは依頼者と受注者をつなぐプラットフォームであり、個々の依頼内容の法的適合性を保証するものではありません。
          依頼内容が法令に違反しないかどうかの判断は、依頼者および受注者の双方の責任において行ってください。
          ユーザー間の取引において法令違反が発覚した場合、運営は一切の責任を負いません。
        </p>
      </div>

      {/* CTA */}
      <section className="text-center py-8 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/terms" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
            利用規約を読む
          </Link>
          <Link href="/guide" className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition border border-gray-200">
            ご利用ガイドを見る
          </Link>
        </div>
      </section>

    </div>
  );
}
