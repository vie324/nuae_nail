/* Mock data for the nail salon dashboard */
window.NUAE = window.NUAE || {};

(() => {
  const today = new Date('2026-04-23T00:00:00');
  const fmt = (d) => d.toISOString().split('T')[0];
  const offset = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return fmt(d);
  };

  const staff = [
    { id: 's1', name: '田中 美咲',   role: 'オーナー/ネイリスト', color: '#e94572', avatar: '👩🏻‍🎨', line: true,  email: 'misaki@nuae.jp',  specialty: ['ジェル', 'アート'] },
    { id: 's2', name: '佐藤 ゆい',   role: 'シニアネイリスト',   color: '#f59e0b', avatar: '💇🏻‍♀️', line: true,  email: 'yui@nuae.jp',      specialty: ['フレンチ', 'ワンカラー'] },
    { id: 's3', name: '鈴木 あかり', role: 'ネイリスト',         color: '#8b5cf6', avatar: '👩🏻', line: true,  email: 'akari@nuae.jp',    specialty: ['マグネット', 'ニュアンス'] },
    { id: 's4', name: '高橋 りな',   role: 'アシスタント',       color: '#14b8a6', avatar: '👩🏻‍🦰', line: false, email: 'rina@nuae.jp',     specialty: ['オフ', 'ケア'] }
  ];

  const customers = [
    { id: 'c1', name: '山田 花子',   kana: 'ヤマダ ハナコ',   phone: '090-1111-2222', line: 'hanako_y', birthday: '1995-03-14', visits: 18, lastVisit: offset(-14), totalSpent: 162000, tags: ['VIP', 'ジェル派'], channel: 'LINE',      note: '爪が薄いため補強必須' },
    { id: 'c2', name: '伊藤 さやか', kana: 'イトウ サヤカ',   phone: '090-3333-4444', line: 'sayaka.i',  birthday: '1988-07-02', visits: 32, lastVisit: offset(-7),  totalSpent: 312000, tags: ['VIP'],        channel: 'ホットペッパー', note: '定期マグネット派' },
    { id: 'c3', name: '渡辺 あゆみ', kana: 'ワタナベ アユミ', phone: '080-5555-6666', line: null,         birthday: '2000-11-20', visits: 4,  lastVisit: offset(-60), totalSpent: 28000,  tags: ['新規'],       channel: 'minimo',       note: '' },
    { id: 'c4', name: '中村 えみ',   kana: 'ナカムラ エミ',   phone: '070-7777-8888', line: 'emi_n',      birthday: '1992-01-08', visits: 11, lastVisit: offset(-30), totalSpent: 98000,  tags: ['ブライダル相談'], channel: 'ネイリー',    note: '結婚式2026/06/10' },
    { id: 'c5', name: '小林 まい',   kana: 'コバヤシ マイ',   phone: '090-9999-0000', line: 'mai.k',      birthday: '1998-05-25', visits: 7,  lastVisit: offset(-21), totalSpent: 63000,  tags: ['フレンチ好き'], channel: 'LINE',       note: '' },
    { id: 'c6', name: '加藤 しおり', kana: 'カトウ シオリ',   phone: '080-1212-3434', line: 'shiori_k',   birthday: '1990-09-12', visits: 2,  lastVisit: offset(-90), totalSpent: 16000,  tags: ['離脱リスク'],   channel: 'minimo',      note: '3か月来店なし' }
  ];

  const menus = [
    { id: 'm1', name: 'ワンカラージェル',         duration: 60,  price: 6600 },
    { id: 'm2', name: 'フレンチジェル',           duration: 75,  price: 7700 },
    { id: 'm3', name: 'アートジェル（10本）',      duration: 120, price: 11000 },
    { id: 'm4', name: 'マグネットネイル',         duration: 90,  price: 9900 },
    { id: 'm5', name: 'オフのみ',                 duration: 30,  price: 3300 },
    { id: 'm6', name: 'ケア＋ベース',             duration: 45,  price: 4400 },
    { id: 'm7', name: 'ブライダル（デザイン込み）', duration: 150, price: 16500 }
  ];

  const designs = [
    { id: 'd1', name: 'ニュアンスミルキー',   category: 'ニュアンス', season: '春', price: 11000, likes: 128, image: 'linear-gradient(135deg,#fde2e4,#fad2e1,#ffccd5)', tags: ['人気', '春夏'] },
    { id: 'd2', name: 'ワンホンガーリー',     category: 'アート',     season: '通年', price: 13200, likes: 98,  image: 'linear-gradient(135deg,#ffe4ec,#fb9fb8,#e94572)', tags: ['SNS映え'] },
    { id: 'd3', name: 'シンプルフレンチ',     category: 'フレンチ',   season: '通年', price: 7700,  likes: 210, image: 'linear-gradient(135deg,#ffffff,#f8fafc,#e2e8f0)', tags: ['オフィス', '定番'] },
    { id: 'd4', name: 'マグネットオーロラ',   category: 'マグネット', season: '秋冬', price: 9900,  likes: 156, image: 'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)', tags: ['人気'] },
    { id: 'd5', name: 'ブライダルホワイト',   category: 'ブライダル', season: '通年', price: 16500, likes: 64,  image: 'linear-gradient(135deg,#ffffff,#fef3c7,#fde68a)', tags: ['ブライダル'] },
    { id: 'd6', name: 'サマーマリン',         category: 'アート',     season: '夏',   price: 12100, likes: 77,  image: 'linear-gradient(135deg,#67e8f9,#60a5fa,#818cf8)', tags: ['夏'] },
    { id: 'd7', name: 'ベージュミラー',       category: 'ニュアンス', season: '秋',   price: 10450, likes: 144, image: 'linear-gradient(135deg,#fde68a,#fcd34d,#d6bcfa)', tags: ['秋冬'] },
    { id: 'd8', name: 'チェックツイード',     category: 'アート',     season: '秋冬', price: 13200, likes: 112, image: 'linear-gradient(135deg,#fca5a5,#f87171,#7f1d1d)', tags: ['秋冬'] }
  ];

  const status = ['確定', '来店待ち', '施術中', '完了', 'キャンセル'];
  const channels = ['LINE', 'ホットペッパー', 'minimo', 'ネイリー', '電話', 'ウォークイン'];

  const reservations = [
    { id: 'r1', date: offset(0),  start: '10:00', end: '11:00', customerId: 'c1', staffId: 's1', menuIds: ['m1'],       designId: 'd1', status: '確定',   channel: 'LINE',         price: 6600,  note: '' },
    { id: 'r2', date: offset(0),  start: '11:30', end: '13:30', customerId: 'c2', staffId: 's2', menuIds: ['m3'],       designId: 'd2', status: '確定',   channel: 'ホットペッパー', price: 11000, note: '' },
    { id: 'r3', date: offset(0),  start: '14:00', end: '15:15', customerId: 'c5', staffId: 's3', menuIds: ['m2'],       designId: 'd3', status: '確定',   channel: 'minimo',       price: 7700,  note: '初来店' },
    { id: 'r4', date: offset(0),  start: '15:30', end: '17:00', customerId: 'c4', staffId: 's1', menuIds: ['m4'],       designId: 'd4', status: '確定',   channel: 'LINE',         price: 9900,  note: '' },
    { id: 'r5', date: offset(1),  start: '10:00', end: '12:30', customerId: 'c4', staffId: 's1', menuIds: ['m7'],       designId: 'd5', status: '確定',   channel: 'LINE',         price: 16500, note: 'ブライダル相談同時' },
    { id: 'r6', date: offset(1),  start: '13:00', end: '14:00', customerId: 'c1', staffId: 's2', menuIds: ['m1'],       designId: 'd6', status: '確定',   channel: 'ネイリー',     price: 6600,  note: '' },
    { id: 'r7', date: offset(2),  start: '10:30', end: '11:15', customerId: 'c3', staffId: 's4', menuIds: ['m6'],       designId: null, status: '確定',   channel: 'minimo',       price: 4400,  note: '' },
    { id: 'r8', date: offset(2),  start: '13:00', end: '14:15', customerId: 'c2', staffId: 's3', menuIds: ['m2'],       designId: 'd3', status: '確定',   channel: 'ホットペッパー', price: 7700,  note: '' },
    { id: 'r9', date: offset(3),  start: '11:00', end: '12:30', customerId: 'c5', staffId: 's2', menuIds: ['m4'],       designId: 'd7', status: '確定',   channel: 'LINE',         price: 9900,  note: '' },
    { id: 'r10', date: offset(-1),start: '14:00', end: '15:00', customerId: 'c6', staffId: 's3', menuIds: ['m1'],       designId: 'd1', status: '完了',   channel: 'minimo',       price: 6600,  note: '' },
    { id: 'r11', date: offset(-2),start: '16:00', end: '17:30', customerId: 'c2', staffId: 's1', menuIds: ['m4'],       designId: 'd4', status: '完了',   channel: 'LINE',         price: 9900,  note: '' },
    { id: 'r12', date: offset(4), start: '15:00', end: '16:15', customerId: 'c3', staffId: 's2', menuIds: ['m2'],       designId: 'd3', status: '確定',   channel: 'minimo',       price: 7700,  note: '' }
  ];

  // Shift: availability per staff per date. Types: work | off | paid
  const shifts = [];
  staff.forEach((s, idx) => {
    for (let i = -3; i <= 10; i++) {
      const d = offset(i);
      let type = 'work';
      if ((i + idx) % 7 === 0) type = 'off';
      else if ((i + idx) % 11 === 0) type = 'paid';
      shifts.push({
        staffId: s.id,
        date: d,
        type,
        start: type === 'work' ? '10:00' : null,
        end:   type === 'work' ? '19:00' : null
      });
    }
  });

  // Ad / marketing campaigns
  const campaigns = [
    { id: 'ad1', name: 'Instagram 春ニュアンスキャンペーン', platform: 'Instagram',      budget: 60000,  spent: 42500, impressions: 128400, clicks: 3120, conversions: 48, cpa: 885,  status: 'active'  },
    { id: 'ad2', name: 'Google 指名検索',                   platform: 'Google Ads',     budget: 30000,  spent: 28200, impressions: 22100,  clicks: 1530, conversions: 62, cpa: 455,  status: 'active'  },
    { id: 'ad3', name: 'ホットペッパー初回クーポン',         platform: 'ホットペッパー', budget: 80000,  spent: 80000, impressions: 98000,  clicks: 4100, conversions: 71, cpa: 1126, status: 'ended'   },
    { id: 'ad4', name: 'LINE 友だち追加クーポン',            platform: 'LINE公式',        budget: 20000,  spent: 8400,  impressions: 15600,  clicks: 900,  conversions: 34, cpa: 247,  status: 'active'  },
    { id: 'ad5', name: 'TikTok ブライダル訴求',              platform: 'TikTok',          budget: 40000,  spent: 0,     impressions: 0,      clicks: 0,    conversions: 0,  cpa: 0,    status: 'draft'   }
  ];

  // External platform sync status
  const integrations = [
    { id: 'minimo',     name: 'minimo',           connected: true,  lastSync: '2026-04-23 09:20', newReservations: 3, pending: 0, account: 'nuae_nail', icon: '💎' },
    { id: 'nailie',     name: 'ネイリー (Nailie)', connected: true,  lastSync: '2026-04-23 09:18', newReservations: 1, pending: 2, account: 'nuae-salon', icon: '💅' },
    { id: 'hotpepper',  name: 'ホットペッパー',    connected: true,  lastSync: '2026-04-23 08:45', newReservations: 2, pending: 1, account: 'H000123456', icon: '🌶️' },
    { id: 'line',       name: 'LINE公式',          connected: true,  lastSync: '2026-04-23 09:30', newReservations: 4, pending: 0, account: '@nuae-nail',  icon: '💚' },
    { id: 'google',     name: 'Googleビジネス',    connected: false, lastSync: '-',                newReservations: 0, pending: 0, account: '',            icon: '🔎' },
    { id: 'instagram',  name: 'Instagram',         connected: true,  lastSync: '2026-04-23 09:05', newReservations: 0, pending: 0, account: '@nuae.nail',  icon: '📷' }
  ];

  // Counseling templates + records
  const counselingTemplates = [
    { id: 't1', name: '初回カウンセリング', questions: [
      { q: '爪のお悩みを教えてください', type: 'textarea' },
      { q: '好みの長さは？', type: 'select', options: ['ショート', 'ミディアム', 'ロング'] },
      { q: '希望デザインの雰囲気', type: 'multi', options: ['シンプル', '可愛い', '上品', '派手', 'オフィス向け'] },
      { q: 'アレルギーの有無', type: 'radio', options: ['なし', 'あり'] }
    ]},
    { id: 't2', name: 'ブライダルカウンセリング', questions: [
      { q: '挙式予定日', type: 'date' },
      { q: 'ドレスの色味', type: 'text' },
      { q: '希望の雰囲気', type: 'textarea' },
      { q: 'ブーケの色', type: 'text' },
      { q: '参考画像URL', type: 'text' }
    ]}
  ];

  const counselingRecords = [
    { id: 'cs1', customerId: 'c1', templateId: 't1', date: offset(-14), summary: '爪が薄く補強優先。ミルキーカラー希望。', status: '完了', answers: [] },
    { id: 'cs2', customerId: 'c4', templateId: 't2', date: offset(-30), summary: '6/10挙式。白ドレス、ピンクブーケ。上品系希望。', status: '完了', answers: [] },
    { id: 'cs3', customerId: 'c3', templateId: 't1', date: offset(-60), summary: '新規。オフィス向けシンプル志向。',             status: '完了', answers: [] }
  ];

  // LINE message templates + broadcast history
  const lineTemplates = [
    { id: 'l1', name: '来店前日リマインド', type: 'reminder', body: '{{name}}様\n明日{{time}}よりご予約をいただいております。ご来店お待ちしております🌸' },
    { id: 'l2', name: '再来店促進（1か月）', type: 'nurture',  body: '{{name}}様\nご来店から1か月が経ちました。そろそろオフ＋新デザインはいかがですか？💅' },
    { id: 'l3', name: '誕生日クーポン',      type: 'birthday', body: '{{name}}様🎂\nお誕生日おめでとうございます！来月使える10%OFFクーポンをプレゼント🎁' },
    { id: 'l4', name: 'キャンペーン告知',    type: 'campaign', body: '新作ニュアンスデザイン登場✨4月末までの予約で20%OFFキャンペーン実施中！' }
  ];

  const lineBroadcasts = [
    { id: 'b1', templateId: 'l4', sentAt: '2026-04-10 12:00', audience: 'all',     recipients: 240, opens: 198, clicks: 62 },
    { id: 'b2', templateId: 'l2', sentAt: '2026-04-05 19:00', audience: '1ヶ月未来店', recipients: 58,  opens: 42,  clicks: 19 },
    { id: 'b3', templateId: 'l3', sentAt: '2026-04-01 10:00', audience: '4月誕生日', recipients: 14,  opens: 14,  clicks: 9  }
  ];

  // Revenue / KPI time series (last 12 weeks)
  const weeklyRevenue = [];
  for (let w = 11; w >= 0; w--) {
    weeklyRevenue.push({
      week: `W-${w}`,
      revenue: 380000 + Math.round(Math.random() * 180000),
      newCustomers: 3 + Math.floor(Math.random() * 7),
      repeatCustomers: 18 + Math.floor(Math.random() * 12)
    });
  }

  window.NUAE.data = {
    today: fmt(today),
    offset,
    staff,
    customers,
    menus,
    designs,
    reservations,
    shifts,
    campaigns,
    integrations,
    counselingTemplates,
    counselingRecords,
    lineTemplates,
    lineBroadcasts,
    weeklyRevenue,
    status,
    channels
  };
})();
