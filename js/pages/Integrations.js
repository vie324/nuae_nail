/* External reservation platform sync */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Toggle } = UI;

  const PLATFORM_INFO = {
    minimo:    { desc: 'minimoから新着予約を自動取り込み、メニューマッピング可能。', features: ['予約自動取込', 'メニュー同期', 'スタッフマッピング', 'クーポン連動'] },
    nailie:    { desc: 'ネイリー(Nailie)から予約情報を双方向同期。',                features: ['予約自動取込', 'デザイン同期', 'レビュー取得']                        },
    hotpepper: { desc: 'ホットペッパービューティーAPI経由で統合管理。',             features: ['予約自動取込', 'メニュー同期', 'クーポン連動', 'レビュー取得']     },
    line:      { desc: 'LINE公式アカウントのMessaging APIを使用した連携。',          features: ['メッセージ送信', '友だち追加自動化', 'リマインダ']                    },
    google:    { desc: 'Googleビジネスプロフィールから予約/レビューを取り込み。',    features: ['予約取得', 'レビュー管理', 'Q&A対応']                                },
    instagram: { desc: 'Instagram Graph API連携。投稿スケジュールとDM自動応答。',    features: ['投稿予約', 'DM自動応答', 'インサイト取得']                           }
  };

  const Integrations = () => {
    const [integrations, setIntegrations] = React.useState(data.integrations);
    const [selected, setSelected] = React.useState(null);
    const [connectModal, setConnectModal] = React.useState(null);
    const [pendingOpen, setPendingOpen] = React.useState(false);

    const toggleConnect = (id) => {
      setIntegrations(integrations.map((i) => i.id === id ? { ...i, connected: !i.connected, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : i));
    };

    const syncAll = () => {
      setIntegrations(integrations.map((i) => i.connected ? { ...i, lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : i));
    };

    const newTotal   = integrations.reduce((s, i) => s + i.newReservations, 0);
    const pendingTot = integrations.reduce((s, i) => s + i.pending, 0);

    return (
      <div className="p-6 space-y-4 fade-in">
        <Card className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold">外部予約サイト連携</h2>
              <p className="text-sm text-slate-500 mt-1">minimo / ネイリー / ホットペッパー等の予約を自動で取り込み、ダブルブッキングを防止します。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Bell size={16} />} onClick={() => setPendingOpen(true)}>
                未確定 {pendingTot}件
              </Button>
              <Button icon={<Icons.Sync size={16} />} onClick={syncAll}>全て同期</Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniBox label="接続済み"     value={`${integrations.filter((i) => i.connected).length}/${integrations.length}`} color="emerald" />
            <MiniBox label="新着予約"     value={`${newTotal}件`} color="brand" />
            <MiniBox label="未確定"       value={`${pendingTot}件`} color="amber" />
            <MiniBox label="最終同期"     value="9:30"  color="slate" />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((i) => {
            const info = PLATFORM_INFO[i.id] || {};
            return (
              <Card key={i.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{i.icon}</div>
                    <div>
                      <div className="font-bold">{i.name}</div>
                      <div className="text-xs text-slate-500">{i.account || '未接続'}</div>
                    </div>
                  </div>
                  <Badge tone={i.connected ? 'green' : 'slate'}>{i.connected ? '接続中' : '未接続'}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-3">{info.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(info.features || []).map((f) => <Badge key={f} tone="slate">{f}</Badge>)}
                </div>
                {i.connected && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <div className="text-slate-500 text-[10px]">新着</div>
                      <div className="font-bold text-brand-600">{i.newReservations}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <div className="text-slate-500 text-[10px]">未確定</div>
                      <div className="font-bold text-amber-600">{i.pending}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <div className="text-slate-500 text-[10px]">同期</div>
                      <div className="font-bold text-[10px]">{i.lastSync.split(' ')[1] || '-'}</div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setSelected(i)}>詳細設定</Button>
                  {i.connected
                    ? <Button size="sm" variant="danger"  className="flex-1" onClick={() => toggleConnect(i.id)}>切断</Button>
                    : <Button size="sm"                   className="flex-1" onClick={() => setConnectModal(i)}>接続する</Button>}
                </div>
              </Card>
            );
          })}
        </div>

        <DetailModal open={!!selected} onClose={() => setSelected(null)} integration={selected} />
        <ConnectModal open={!!connectModal} onClose={() => setConnectModal(null)} integration={connectModal} onConnect={(id) => { toggleConnect(id); setConnectModal(null); }} />
        <PendingModal open={pendingOpen} onClose={() => setPendingOpen(false)} integrations={integrations} />
      </div>
    );
  };

  const MiniBox = ({ label, value, color }) => {
    const colors = { emerald: 'bg-emerald-50 text-emerald-700', brand: 'bg-brand-50 text-brand-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-50 text-slate-700' };
    return (
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <div className="text-xs opacity-80">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    );
  };

  const DetailModal = ({ open, onClose, integration }) => {
    if (!open || !integration) return null;
    const info = PLATFORM_INFO[integration.id] || {};
    return (
      <Modal open={open} onClose={onClose} title={`${integration.name} 詳細設定`}>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm">{info.desc}</div>
          <Input label="アカウントID" value={integration.account} />
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div className="text-sm">新着予約の自動取込</div><Toggle checked={true} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">メニュー自動マッピング</div><Toggle checked={true} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">重複予約の自動マージ</div><Toggle checked={false} /></div>
            <div className="flex items-center justify-between"><div className="text-sm">同期エラー時に通知</div><Toggle checked={true} /></div>
          </div>
          <div className="pt-3 border-t">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">同期ログ</div>
            <div className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-3 rounded-lg max-h-40 overflow-y-auto">
              <div>[{integration.lastSync}] ✅ sync OK — 新着{integration.newReservations}件</div>
              <div>[2026-04-23 08:30] ✅ sync OK — 新着0件</div>
              <div>[2026-04-23 07:30] ✅ sync OK — 新着1件</div>
              <div>[2026-04-22 22:00] ⚠️  rate limit 30s retry</div>
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
      <Modal open={open} onClose={onClose} title={`${integration.name} に接続`} size="sm">
        <div className="space-y-4">
          <div className="text-sm text-slate-600">各プラットフォームから発行された API キー / 連携トークンを入力してください。</div>
          <Input label="APIキー / アクセストークン" value={key} onChange={setKey} placeholder="••••••••••••••" />
          <Input label="アカウントID"             placeholder="nuae_nail など" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button onClick={() => onConnect(integration.id)}>接続</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const PendingModal = ({ open, onClose, integrations }) => {
    if (!open) return null;
    const pending = integrations.flatMap((i) => Array.from({ length: i.pending }, (_, k) => ({
      id: `${i.id}-${k}`, platform: i.name, customer: ['新規K様', '新規T様', '新規M様'][k] || '新規顧客',
      date: data.offset(1 + k), time: '14:00', menu: 'ワンカラー'
    })));
    return (
      <Modal open={open} onClose={onClose} title="未確定予約" size="md">
        <div className="space-y-2">
          {pending.length === 0 && <div className="text-center text-slate-400 py-8">未確定の予約はありません</div>}
          {pending.map((p) => (
            <div key={p.id} className="p-3 border border-slate-100 rounded-xl flex items-center gap-3">
              <Badge tone="amber">{p.platform}</Badge>
              <div className="flex-1">
                <div className="font-medium text-sm">{p.customer} · {p.menu}</div>
                <div className="text-xs text-slate-500">{p.date} {p.time}</div>
              </div>
              <Button size="sm" variant="secondary">却下</Button>
              <Button size="sm">承認</Button>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  window.NUAE.Integrations = Integrations;
})();
