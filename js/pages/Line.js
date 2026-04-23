/* LINE integration */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea, Toggle } = UI;

  const Line = () => {
    const [tab, setTab] = React.useState('templates');
    const [templates, setTemplates] = React.useState(data.lineTemplates);
    const [settings, setSettings] = React.useState({
      channelId: '2001234567',
      channelSecret: '••••••••••••••••',
      connected: true,
      autoReminder24h: true,
      autoReminder1h: false,
      birthdayAuto: true,
      autoFollowup: true
    });
    const [broadcastOpen, setBroadcastOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [tplOpen, setTplOpen] = React.useState(false);

    const TABS = [
      { id: 'templates',  label: 'メッセージテンプレート' },
      { id: 'broadcast',  label: '配信履歴' },
      { id: 'settings',   label: 'アカウント設定' }
    ];

    const saveTpl = (form) => {
      if (form.id) setTemplates(templates.map((t) => t.id === form.id ? { ...t, ...form } : t));
      else setTemplates([...templates, { id: 'l' + Date.now(), ...form }]);
      setTplOpen(false);
    };

    return (
      <div className="p-6 space-y-4 fade-in">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl">💚</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold text-slate-800">LINE公式アカウント</div>
                <Badge tone={settings.connected ? 'green' : 'slate'}>{settings.connected ? '接続中' : '未接続'}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">@nuae-nail · 友だち 1,248名 · ブロック率 2.3%</div>
            </div>
            <Button variant="secondary" icon={<Icons.Sync size={16} />}>再同期</Button>
          </div>
        </Card>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm ${tab === t.id ? 'bg-brand-500 text-white' : 'text-slate-600'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'templates' && (
          <Card title="テンプレート一覧" actions={<Button size="sm" icon={<Icons.Plus size={14} />} onClick={() => { setEditing(null); setTplOpen(true); }}>追加</Button>}>
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <div key={t.id} className="p-4 flex items-start gap-3 hover:bg-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Icons.Chat /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{t.name}</div>
                      <Badge tone="slate">{t.type}</Badge>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 whitespace-pre-line">{t.body}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />} onClick={() => { setEditing(t); setTplOpen(true); }}>編集</Button>
                    <Button size="sm" icon={<Icons.Upload size={14} />} onClick={() => setBroadcastOpen(t)}>配信</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'broadcast' && (
          <Card title="配信履歴">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">日時</th>
                    <th className="text-left px-4 py-3">テンプレート</th>
                    <th className="text-left px-4 py-3">対象</th>
                    <th className="text-right px-4 py-3">配信数</th>
                    <th className="text-right px-4 py-3">開封</th>
                    <th className="text-right px-4 py-3">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.lineBroadcasts.map((b) => {
                    const t = templates.find((x) => x.id === b.templateId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs">{b.sentAt}</td>
                        <td className="px-4 py-3">{t?.name}</td>
                        <td className="px-4 py-3"><Badge tone="slate">{b.audience}</Badge></td>
                        <td className="px-4 py-3 text-right">{b.recipients}</td>
                        <td className="px-4 py-3 text-right">{b.opens} <span className="text-xs text-slate-400">({Math.round(b.opens / b.recipients * 100)}%)</span></td>
                        <td className="px-4 py-3 text-right">{Math.round(b.clicks / b.recipients * 100)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="API認証">
              <div className="p-5 space-y-3">
                <Input label="Channel ID"      value={settings.channelId}     onChange={(v) => setSettings({ ...settings, channelId: v })} />
                <Input label="Channel Secret"  value={settings.channelSecret} onChange={(v) => setSettings({ ...settings, channelSecret: v })} />
                <Input label="Webhook URL"     value="https://nuae-nail.jp/webhook/line" />
                <Button variant="secondary" icon={<Icons.Sync size={16} />}>接続テスト</Button>
              </div>
            </Card>

            <Card title="自動送信">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">予約前日リマインド (24h)</div>
                    <div className="text-xs text-slate-500">予約日の前日にテンプレートを自動送信</div>
                  </div>
                  <Toggle checked={settings.autoReminder24h} onChange={(v) => setSettings({ ...settings, autoReminder24h: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">当日1時間前リマインド</div>
                    <div className="text-xs text-slate-500">来店1時間前に通知</div>
                  </div>
                  <Toggle checked={settings.autoReminder1h} onChange={(v) => setSettings({ ...settings, autoReminder1h: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">誕生日クーポン自動送信</div>
                    <div className="text-xs text-slate-500">誕生月の1日に送信</div>
                  </div>
                  <Toggle checked={settings.birthdayAuto} onChange={(v) => setSettings({ ...settings, birthdayAuto: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">再来店促進 (4週間後)</div>
                    <div className="text-xs text-slate-500">最終来店から28日経過で通知</div>
                  </div>
                  <Toggle checked={settings.autoFollowup} onChange={(v) => setSettings({ ...settings, autoFollowup: v })} />
                </div>
              </div>
            </Card>
          </div>
        )}

        <TemplateModal open={tplOpen} onClose={() => setTplOpen(false)} editing={editing} onSave={saveTpl} />
        <BroadcastModal open={!!broadcastOpen} onClose={() => setBroadcastOpen(false)} template={broadcastOpen} />
      </div>
    );
  };

  const TemplateModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm(editing ? { ...editing } : { name: '', type: 'campaign', body: '' }); }, [open, editing]);
    if (!open) return null;
    return (
      <Modal open={open} onClose={onClose} title={editing ? 'テンプレート編集' : 'テンプレート追加'}>
        <div className="space-y-4">
          <Input  label="名前" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Select label="種別" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={['reminder', 'nurture', 'birthday', 'campaign']} />
          <Textarea label="本文" rows={6} value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="変数: {{name}} {{time}} {{date}}" />
          <div className="text-xs text-slate-500">💡 変数が本文内で使用できます: <code>{`{{name}}`}</code> / <code>{`{{time}}`}</code> / <code>{`{{date}}`}</code></div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button onClick={() => onSave(form)}>保存</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const BroadcastModal = ({ open, onClose, template }) => {
    const [audience, setAudience] = React.useState('all');
    if (!open || !template) return null;
    const count = audience === 'all' ? 1248 : audience === 'vip' ? 42 : audience === 'risk' ? 87 : 200;
    return (
      <Modal open={open} onClose={onClose} title="一斉配信">
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm whitespace-pre-line">{template.body}</div>
          <Select label="配信対象" value={audience} onChange={setAudience}
            options={[
              { value: 'all',  label: '全員 (1,248名)' },
              { value: 'vip',  label: 'VIP顧客 (42名)' },
              { value: 'risk', label: '離脱リスク (87名)' },
              { value: '30d',  label: '30日以内来店 (200名)' }
            ]} />
          <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700">
            約 <b>{count}</b> 名に配信されます。
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button icon={<Icons.Upload size={14} />}>今すぐ配信</Button>
          </div>
        </div>
      </Modal>
    );
  };

  window.NUAE.Line = Line;
})();
