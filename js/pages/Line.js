/* LINE integration - with chat preview */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea, Toggle, SegmentedTabs, useToast } = UI;

  const Line = () => {
    const [tab, setTab] = React.useState('templates');
    const [templates, setTemplates] = React.useState(data.lineTemplates);
    const [settings, setSettings] = React.useState({
      channelId: '2001234567', channelSecret: '••••••••••••••••', connected: true,
      autoReminder24h: true, autoReminder1h: false, birthdayAuto: true, autoFollowup: true
    });
    const [broadcastOpen, setBroadcastOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [tplOpen, setTplOpen] = React.useState(false);
    const toast = useToast();

    const saveTpl = (form) => {
      if (form.id) setTemplates(templates.map((t) => t.id === form.id ? { ...t, ...form } : t));
      else setTemplates([...templates, { id: 'l' + Date.now(), ...form }]);
      setTplOpen(false);
      toast({ tone: 'success', title: 'テンプレートを保存しました' });
    };

    return (
      <div className="p-6 space-y-4 page-enter">
        {/* Account header */}
        <Card className="p-5 overflow-hidden relative" gradient>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="relative flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-3xl shadow-[0_10px_30px_-10px_rgba(16,185,129,.6)]">💚</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-bold text-slate-800 text-base">LINE公式アカウント</div>
                <Badge tone={settings.connected ? 'green' : 'slate'} dot live={settings.connected}>
                  {settings.connected ? '接続中' : '未接続'}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">@nuae-nail · 友だち <b className="text-slate-700">1,248</b>名 · ブロック率 2.3%</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Sync size={16} />} onClick={() => toast({ tone: 'success', title: '同期完了' })}>再同期</Button>
              <Button variant="subtle" icon={<Icons.Upload size={16} />} onClick={() => setBroadcastOpen(templates[0])}>一斉配信</Button>
            </div>
          </div>
        </Card>

        <SegmentedTabs value={tab} onChange={setTab} options={[
          { value: 'templates', label: 'テンプレート' }, { value: 'broadcast', label: '配信履歴' }, { value: 'settings', label: 'アカウント設定' }
        ]} />

        {tab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="テンプレート一覧" actions={<Button size="sm" icon={<Icons.Plus size={14} />} onClick={() => { setEditing(null); setTplOpen(true); }}>追加</Button>}>
              <div className="divide-y divide-slate-100/70 stagger-children">
                {templates.map((t) => (
                  <div key={t.id} className="p-4 flex items-start gap-3 hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => { setEditing(t); setTplOpen(true); }}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-500 flex items-center justify-center shrink-0"><Icons.Chat /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">{t.name}</div>
                        <Badge tone={t.type === 'birthday' ? 'amber' : t.type === 'campaign' ? 'brand' : 'slate'}>{t.type}</Badge>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 whitespace-pre-line line-clamp-2">{t.body}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" icon={<Icons.Upload size={14} />} onClick={(e) => { e.stopPropagation(); setBroadcastOpen(t); }}>配信</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chat preview */}
            <Card title="プレビュー" actions={<Badge tone="green" dot live>LINE</Badge>}>
              <div className="p-5 bg-gradient-to-b from-slate-50 to-white min-h-[280px]">
                <ChatPreview template={templates[0]} />
              </div>
            </Card>
          </div>
        )}

        {tab === 'broadcast' && (
          <Card title="配信履歴">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-slate-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">日時</th>
                    <th className="text-left px-4 py-3">テンプレート</th>
                    <th className="text-left px-4 py-3">対象</th>
                    <th className="text-right px-4 py-3">配信</th>
                    <th className="text-right px-4 py-3">開封</th>
                    <th className="text-right px-4 py-3">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 stagger-children">
                  {data.lineBroadcasts.map((b) => {
                    const t = templates.find((x) => x.id === b.templateId);
                    const openRate = Math.round(b.opens / b.recipients * 100);
                    const ctr = Math.round(b.clicks / b.recipients * 100);
                    return (
                      <tr key={b.id} className="hover:bg-emerald-50/30 cursor-pointer">
                        <td className="px-4 py-3 text-xs text-slate-500">{b.sentAt}</td>
                        <td className="px-4 py-3 font-medium">{t?.name}</td>
                        <td className="px-4 py-3"><Badge tone="slate">{b.audience}</Badge></td>
                        <td className="px-4 py-3 text-right font-semibold">{b.recipients}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: openRate + '%' }} /></div>
                            <span className="text-xs">{openRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-brand-400" style={{ width: Math.min(100, ctr * 2) + '%' }} /></div>
                            <span className="text-xs">{ctr}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <Card title="API認証">
              <div className="p-5 space-y-3">
                <Input label="Channel ID"     value={settings.channelId}     onChange={(v) => setSettings({ ...settings, channelId: v })} />
                <Input label="Channel Secret" value={settings.channelSecret} onChange={(v) => setSettings({ ...settings, channelSecret: v })} />
                <Input label="Webhook URL"    value="https://nuae-nail.jp/webhook/line" />
                <Button variant="secondary" icon={<Icons.Sync size={16} />} onClick={() => toast({ tone: 'success', title: '接続テスト成功' })}>接続テスト</Button>
              </div>
            </Card>

            <Card title="自動送信ルール">
              <div className="p-5 space-y-4">
                <SettingRow icon="⏰" title="予約前日リマインド (24h)"    desc="予約日の前日にテンプレートを自動送信" value={settings.autoReminder24h} onChange={(v) => setSettings({ ...settings, autoReminder24h: v })} />
                <SettingRow icon="🕑" title="当日1時間前リマインド"        desc="来店1時間前に通知"                  value={settings.autoReminder1h}  onChange={(v) => setSettings({ ...settings, autoReminder1h: v })} />
                <SettingRow icon="🎂" title="誕生日クーポン自動送信"        desc="誕生月の1日に送信"                  value={settings.birthdayAuto}    onChange={(v) => setSettings({ ...settings, birthdayAuto: v })} />
                <SettingRow icon="✨" title="再来店促進 (4週間後)"          desc="最終来店から28日経過で通知"         value={settings.autoFollowup}    onChange={(v) => setSettings({ ...settings, autoFollowup: v })} />
              </div>
            </Card>
          </div>
        )}

        <TemplateModal open={tplOpen} onClose={() => setTplOpen(false)} editing={editing} onSave={saveTpl} />
        <BroadcastModal open={!!broadcastOpen} onClose={() => setBroadcastOpen(false)} template={broadcastOpen} onSent={() => { setBroadcastOpen(false); toast({ tone: 'success', title: '配信を開始しました', description: '送信完了まで少し時間がかかります' }); }} />
      </div>
    );
  };

  const SettingRow = ({ icon, title, desc, value, onChange }) => (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-lg">{icon}</div>
        <div>
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-slate-500">{desc}</div>
        </div>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </div>
  );

  const ChatPreview = ({ template }) => {
    if (!template) return null;
    const body = (template.body || '')
      .replace('{{name}}', '山田 花子')
      .replace('{{time}}', '10:00')
      .replace('{{date}}', '4/24');
    return (
      <div className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">N</div>
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">Nuae Nail</div>
            <div className="max-w-xs bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 text-sm whitespace-pre-line shadow-sm scale-in">
              {body}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-end justify-end">
          <div>
            <div className="max-w-xs bg-emerald-400 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm shadow-sm">
              ありがとうございます！
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-end justify-end">
          <div>
            <div className="max-w-xs bg-emerald-400 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm shadow-sm">
              楽しみにしています 💅
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-0.5">既読 · 10:32</div>
          </div>
        </div>
      </div>
    );
  };

  const TemplateModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm(editing ? { ...editing } : { name: '', type: 'campaign', body: '' }); }, [open, editing]);
    if (!open) return null;
    return (
      <Modal open={open} onClose={onClose} title={editing ? 'テンプレート編集' : 'テンプレート追加'} size="lg"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button></div>}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Input  label="名前" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Select label="種別" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={['reminder', 'nurture', 'birthday', 'campaign']} />
            <Textarea label="本文" rows={8} value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="変数: {{name}} {{time}} {{date}}" />
            <div className="text-xs text-slate-500">💡 変数: <code className="bg-slate-100 px-1 rounded">{`{{name}}`}</code> <code className="bg-slate-100 px-1 rounded">{`{{time}}`}</code> <code className="bg-slate-100 px-1 rounded">{`{{date}}`}</code></div>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">プレビュー</div>
            <div className="p-4 rounded-2xl bg-slate-50">
              <ChatPreview template={form} />
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const BroadcastModal = ({ open, onClose, template, onSent }) => {
    const [audience, setAudience] = React.useState('all');
    if (!open || !template) return null;
    const count = audience === 'all' ? 1248 : audience === 'vip' ? 42 : audience === 'risk' ? 87 : 200;
    return (
      <Modal open={open} onClose={onClose} title="一斉配信" size="md"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button icon={<Icons.Upload size={14} />} onClick={onSent}>今すぐ配信</Button></div>}>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl"><ChatPreview template={template} /></div>
          <Select label="配信対象" value={audience} onChange={setAudience}
            options={[
              { value: 'all',  label: '全員 (1,248名)' },
              { value: 'vip',  label: 'VIP顧客 (42名)' },
              { value: 'risk', label: '離脱リスク (87名)' },
              { value: '30d',  label: '30日以内来店 (200名)' }
            ]} />
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 flex items-center gap-3">
            <div className="text-3xl">📣</div>
            <div>
              <div className="font-bold text-lg">約 {count} 名</div>
              <div className="text-xs">に配信されます</div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  window.NUAE.Line = Line;
})();
