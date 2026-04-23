/* Ad management / analytics - with animated charts */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Stat, Badge, Button, Modal, Input, Select, useChart, useToast } = UI;

  const PLATFORM_ICON = { 'Instagram': '📷', 'Google Ads': '🔎', 'ホットペッパー': '🌶️', 'LINE公式': '💚', 'TikTok': '🎵', 'YouTube': '▶️' };

  const Marketing = () => {
    const [campaigns, setCampaigns] = React.useState(data.campaigns);
    const [editing, setEditing] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const toast = useToast();

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent  = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalConv   = campaigns.reduce((s, c) => s + c.conversions, 0);
    const avgCpa      = totalConv ? Math.round(totalSpent / totalConv) : 0;

    const barRef  = React.useRef(null);
    const lineRef = React.useRef(null);
    const pieRef  = React.useRef(null);

    useChart(barRef, {
      type: 'bar',
      data: {
        labels: campaigns.map((c) => c.name.slice(0, 12)),
        datasets: [
          { label: '予算', data: campaigns.map((c) => c.budget), backgroundColor: '#e8d2c8', borderRadius: 8, barThickness: 16 },
          { label: '消化', data: campaigns.map((c) => c.spent),  backgroundColor: '#b08c80', borderRadius: 8, barThickness: 16 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle' } } },
        scales: { y: { grid: { color: 'rgba(176,140,128,.10)' }, ticks: { callback: (v) => '¥' + v / 1000 + 'k' } }, x: { grid: { display: false } } },
        animation: { duration: 1200, easing: 'easeOutCubic' }
      }
    }, [campaigns]);

    useChart(lineRef, {
      type: 'line',
      data: {
        labels: data.weeklyRevenue.map((w) => w.week),
        datasets: [
          { label: '新規顧客',   data: data.weeklyRevenue.map((w) => w.newCustomers),    borderColor: '#b08c80', backgroundColor: 'rgba(176,140,128,.18)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 6 },
          { label: 'リピーター', data: data.weeklyRevenue.map((w) => w.repeatCustomers), borderColor: '#b78a54', backgroundColor: 'rgba(183,138,84,.18)',  fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle' } } },
        scales: { y: { grid: { color: 'rgba(176,140,128,.10)' } }, x: { grid: { display: false } } },
        animation: { duration: 1200 }
      }
    }, []);

    useChart(pieRef, {
      type: 'doughnut',
      data: {
        labels: campaigns.map((c) => c.platform),
        datasets: [{ data: campaigns.map((c) => c.conversions), backgroundColor: ['#b08c80', '#b78a54', '#c39d8e', '#967060', '#d6b5a7'], borderWidth: 0, hoverOffset: 12 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }
    }, [campaigns]);

    const save = (form) => {
      if (form.id) { setCampaigns(campaigns.map((c) => c.id === form.id ? { ...c, ...form } : c)); toast({ tone: 'success', title: 'キャンペーンを更新' }); }
      else { setCampaigns([{ id: 'ad' + Date.now(), impressions: 0, clicks: 0, conversions: 0, spent: 0, cpa: 0, status: 'draft', ...form }, ...campaigns]); toast({ tone: 'success', title: 'キャンペーンを作成' }); }
      setModalOpen(false);
    };

    return (
      <div className="p-6 space-y-4 page-enter">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          <Stat label="総予算"    numeric={totalBudget} prefix="¥" delta={5}  icon={<Icons.Money />} tone="brand" />
          <Stat label="消化額"    numeric={totalSpent}  prefix="¥" delta={8}  icon={<Icons.Chart />} tone="violet" />
          <Stat label="CV (予約)" numeric={totalConv}   suffix="件" delta={12} icon={<Icons.Tag />}   tone="emerald" />
          <Stat label="平均CPA"   numeric={avgCpa}      prefix="¥" delta={-4} icon={<Icons.Star />}  tone="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
          <Card className="lg:col-span-2 p-5" title="キャンペーン別 予算/消化">
            <div className="h-64"><canvas ref={barRef} /></div>
          </Card>
          <Card className="p-5" title="プラットフォーム別 CV">
            <div className="h-64"><canvas ref={pieRef} /></div>
          </Card>
        </div>

        <Card className="p-5" title="新規 / リピート推移">
          <div className="h-64"><canvas ref={lineRef} /></div>
        </Card>

        <Card title="キャンペーン一覧" actions={<Button size="sm" icon={<Icons.Plus size={14} />} onClick={() => { setEditing(null); setModalOpen(true); }}>新規作成</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">キャンペーン</th>
                  <th className="text-left px-4 py-3">媒体</th>
                  <th className="text-left px-4 py-3">予算 / 消化</th>
                  <th className="text-right px-4 py-3">表示</th>
                  <th className="text-right px-4 py-3">クリック</th>
                  <th className="text-right px-4 py-3">CV</th>
                  <th className="text-right px-4 py-3">CPA</th>
                  <th className="text-left px-4 py-3">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 stagger-children">
                {campaigns.map((c) => {
                  const pct = c.budget ? Math.round(c.spent / c.budget * 100) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-brand-50/30 cursor-pointer" onClick={() => { setEditing(c); setModalOpen(true); }}>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-lg">{PLATFORM_ICON[c.platform] || '📣'}</span>
                          <span className="text-xs text-slate-700">{c.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">¥{(c.spent / 1000).toFixed(0)}k / ¥{(c.budget / 1000).toFixed(0)}k</div>
                        <div className="h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden w-32">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700" style={{ width: pct + '%' }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">{c.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{c.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-600">{c.conversions}</td>
                      <td className="px-4 py-3 text-right">¥{c.cpa.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge tone={c.status === 'active' ? 'green' : c.status === 'draft' ? 'slate' : 'rose'} dot live={c.status === 'active'}>
                          {c.status === 'active' ? '運用中' : c.status === 'draft' ? '下書き' : '終了'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <CampaignModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={save} />
      </div>
    );
  };

  const CampaignModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm(editing ? { ...editing } : { name: '', platform: 'Instagram', budget: 50000, status: 'draft' }); }, [open, editing]);
    if (!open) return null;
    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? 'キャンペーンを編集' : 'キャンペーン作成'} size="md"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button></div>}>
        <div className="grid grid-cols-2 gap-4">
          <Input  label="名前"  value={form.name}     onChange={(v) => setForm({ ...form, name: v })} className="col-span-2" />
          <Select label="媒体"  value={form.platform} onChange={(v) => setForm({ ...form, platform: v })} options={['Instagram', 'Google Ads', 'LINE公式', 'ホットペッパー', 'TikTok', 'YouTube']} />
          <Input  label="予算"  type="number" value={form.budget} onChange={(v) => setForm({ ...form, budget: parseInt(v) || 0 })} />
          <Select label="状態"  value={form.status}   onChange={(v) => setForm({ ...form, status: v })}
            options={[{ value: 'draft', label: '下書き' }, { value: 'active', label: '運用中' }, { value: 'ended', label: '終了' }]} />
        </div>
      </Modal>
    );
  };

  window.NUAE.Marketing = Marketing;
})();
