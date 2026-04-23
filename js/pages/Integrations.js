/* External reservation platform sync - polished */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Toggle, useToast } = UI;

  const PLATFORM_INFO = {
    minimo:    { desc: 'minimoから新着予約を自動取り込み、メニューマッピング可能。',  features: ['予約自動取込', 'メニュー同期', 'スタッフマッピング', 'クーポン連動'] },
    nailie:    { desc: 'ネイリー(Nailie)から予約情報を双方向同期。',                  features: ['予約自動取込', 'デザイン同期', 'レビュー取得']                        },
    hotpepper: { desc: 'ホットペッパービューティーAPI経由で統合管理。',               features: ['予約自動取込', 'メニュー同期', 'クーポン連動', 'レビュー取得']     },
    line:      { desc: 'LINE公式アカウントのMessaging APIを使用した連携。',           features: ['メッセージ送信', '友だち追加自動化', 'リマインダ']                  },
    google:    { desc: 'Googleビジネスプロフィールから予約/レビューを取り込み。',     features: ['予約取得', 'レビュー管理', 'Q&A対応']                                },
    instagram: { desc: 'Instagram Graph API連携。投稿スケジュールとDM自動応答。',     features: ['投稿予約', 'DM自動応答', 'インサイト取得']                           }
  };

  const Integrations = () => {
    const [integrations, setIntegrations] = React.useState(data.integrations);
    const [selected, setSelected] = React.useState(null);
    const [connectModal, setConnectModal] = React.useState(null);
    const [pendingOpen, setPendingOpen] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false);
    const toast = useToast();

    const toggleConnect = (id) => {
      setIntegrations(integrations.map((i) => i.id === id ? { ...i, connected: !i.connected, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : i));
    };

    const syncAll = () => {
      setSyncing(true);
      setTimeout(() => {
        setIntegrations(integrations.map((i) => i.connected ? { ...i, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : i));
        setSyncing(false);
        toast({ tone: 'success', title: '全ての連携を同期しました', description: '新着 ' + integrations.reduce((s, i) => s + i.newReservations, 0) + '件' });
      }, 1400);
    };

    const newTotal   = integrations.reduce((s, i) => s + i.newReservations, 0);
    const pendingTot = integrations.reduce((s, i) => s + i.pending, 0);
    const connected = integrations.filter((i) => i.connected).length;

    return (
      <div className="p-6 space-y-4 page-enter">
        <Card className="p-5 overflow-hidden relative" gradient>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full aurora-bg opacity-20 blur-3xl" />
          <div className="relative flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold">外部予約サイト連携</h2>
              <p className="text-sm text-slate-500 mt-1">minimo / ネイリー / ホットペッパー等の予約を自動で取り込み、ダブルブッキングを防止します。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Bell size={16} />} onClick={() => setPendingOpen(true)}>未確定 {pendingTot}件</Button>
              <Button icon={<Icons.Sync size={16} className={syncing ? 'animate-spin' : ''} />} onClick={syncAll} disabled={syncing}>
                {syncing ? '同期中...' : '全て同期'}
              </Button>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <MiniBox label="接続済み" value={`${connected}/${integrations.length}`} gradient="from-emerald-500 to-teal-500" />
            <MiniBox label="新着予約" value={`${newTotal}件`}                        gradient="from-brand-500 to-rose-500" />
            <MiniBox label="未確定"   value={`${pendingTot}件`}                      gradient="from-amber-500 to-orange-500" />
            <MiniBox label="最終同期" value="9:30"                                    gradient="from-slate-500 to-slate-700" />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {integrations.map((i) => {
            const info = PLATFORM_INFO[i.id] || {};
            return (
              <div key={i.id} className="card-base p-5 hover-lift relative overflow-hidden">
                {i.connected && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-400 glow-pulse" />}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-3xl shadow-inner">{i.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{i.name}</div>
                    <div className="text-xs text-slate-500 truncate">{i.account || '未接続'}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{info.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(info.features || []).map((f) => <Badge key={f} tone="slate">{f}</Badge>)}
                </div>
                {i.connected && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-brand-50 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">新着</div>
                      <div className="font-bold text-brand-600">{i.newReservations}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">未確定</div>
                      <div className="font-bold text-amber-600">{i.pending}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">同期</div>
                      <div className="font-bold text-[10px] text-slate-700">{(i.lastSync || '-').split(' ')[1] || '-'}</div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setSelected(i)}>詳細設定</Button>
                  {i.connected
                    ? <Button size="sm" variant="ghost" className="flex-1 text-rose-500 hover:bg-rose-50" onClick={() => toggleConnect(i.id)}>切断</Button>
                    : <Button size="sm" className="flex-1" onClick={() => setConnectModal(i)}>接続する</Button>}
                </div>
              </div>
            );
          })}
        </div>

        <DetailModal  open={!!selected}      onClose={() => setSelected(null)}      integration={selected} />
        <ConnectModal open={!!connectModal}  onClose={() => setConnectModal(null)}  integration={connectModal} onConnect={(id) => { toggleConnect(id); setConnectModal(null); toast({ tone: 'success', title: '接続しました' }); }} />
        <PendingModal open={pendingOpen}     onClose={() => setPendingOpen(false)}  integrations={integrations} />
      </div>
    );
  };

  const MiniBox = ({ label, value, gradient }) => (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white hover-lift`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );

  const DetailModal = ({ open, onClose, integration }) => {
    if (!open || !integration) return null;
    const info = PLATFORM_INFO[integration.id] || {};
    return (
      <Modal open={open} onClose={onClose} title={`${integration.name} 詳細設定`} size="md">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30 flex items-start gap-3">
            <div className="text-3xl">{integration.icon}</div>
            <div className="text-sm text-slate-600">{info.desc}</div>
          </div>
          <Input label="アカウントID" value={integration.account} />
          <div className="space-y-3 p-3 rounded-2xl bg-slate-50/50">
            <div className="flex items-center justify-between"><div className="text-sm">新着予約の自動取込</div><Toggle checked={true} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">メニュー自動マッピング</div><Toggle checked={true} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">重複予約の自動マージ</div><Toggle checked={false} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">同期エラー時に通知</div><Toggle checked={true} /></div>
          </div>
          <div className="pt-3 border-t">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">同期ログ</div>
            <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-xl max-h-40 overflow-y-auto">
              <div>[{integration.lastSync}] ✅ sync OK — 新着{integration.newReservations}件</div>
              <div>[2026-04-23 08:30] ✅ sync OK — 新着0件</div>
              <div>[2026-04-23 07:30] ✅ sync OK — 新着1件</div>
              <div className="text-amber-300">[2026-04-22 22:00] ⚠️  rate limit 30s retry</div>
              <div>[2026-04-22 20:00] ✅ sync OK</div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const ConnectModal = ({ open, onClose, integration, onConnect }) => {
    const [key, setKey] = React.useState('');
    if (!open || !integration) return null;
    return (
      <Modal open={open} onClose={onClose} title={`${integration.name} に接続`} size="sm"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button onClick={() => onConnect(integration.id)} icon={<Icons.Link size={14} />}>接続</Button></div>}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <div className="text-3xl">{integration.icon}</div>
            <div className="text-sm text-slate-600">各プラットフォームから発行された API キー / 連携トークンを入力してください。</div>
          </div>
          <Input label="APIキー / アクセストークン" value={key} onChange={setKey} placeholder="••••••••••••••" />
          <Input label="アカウントID"             placeholder="nuae_nail など" />
        </div>
      </Modal>
    );
  };

  const PendingModal = ({ open, onClose, integrations }) => {
    if (!open) return null;
    const pending = integrations.flatMap((i) => Array.from({ length: i.pending }, (_, k) => ({
      id: `${i.id}-${k}`, platform: i.name, icon: i.icon,
      customer: ['新規K様', '新規T様', '新規M様'][k] || '新規顧客',
      date: data.offset(1 + k), time: '14:00', menu: 'ワンカラー'
    })));
    return (
      <Modal open={open} onClose={onClose} title="未確定予約" size="md">
        <div className="space-y-2 stagger-children">
          {pending.length === 0 && <div className="text-center text-slate-400 py-10">未確定の予約はありません</div>}
          {pending.map((p) => (
            <div key={p.id} className="p-3 border border-slate-100 rounded-2xl flex items-center gap-3 hover-lift">
              <div className="text-2xl">{p.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{p.customer} · {p.menu}</div>
                <div className="text-xs text-slate-500">{p.date} {p.time} · {p.platform}</div>
              </div>
              <Button size="sm" variant="secondary">却下</Button>
              <Button size="sm" icon={<Icons.Check size={14} />}>承認</Button>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  window.NUAE.Integrations = Integrations;
})();
