/* Ad management / analytics */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Stat, Badge, Button, Modal, Input, Select, Toggle, useChart } = UI;

  const Marketing = () => {
    const [campaigns, setCampaigns] = React.useState(data.campaigns);
    const [editing, setEditing] = React.useState(null);
    const [modalOpen, setModalOpen] = React.useState(false);

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent  = campaigns.reduce((s, c) => s + c.spent, 0);
    const totalConv   = campaigns.reduce((s, c) => s + c.conversions, 0);
    const totalClick  = campaigns.reduce((s, c) => s + c.clicks, 0);
    const avgCpa = totalConv ? Math.round(totalSpent / totalConv) : 0;

    const barRef  = React.useRef(null);
    const lineRef = React.useRef(null);
    const pieRef  = React.useRef(null);

    useChart(barRef, {
      type: 'bar',
      data: {
        labels: campaigns.map((c) => c.name.replace(/[^一-龯ぁ-んァ-ヶA-Za-z0-9 ]/g, '').slice(0, 10)),
        datasets: [
          { label: '予算', data: campaigns.map((c) => c.budget), backgroundColor: '#fecdd8' },
          { label: '消化', data: campaigns.map((c) => c.spent),  backgroundColor: '#e94572' }
        ]
      },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: (v) => '¥' + v / 1000 + 'k' } } } }
    }, [campaigns]);

    useChart(lineRef, {
      type: 'line',
      data: {
        labels: data.weeklyRevenue.map((w) => w.week),
        datasets: [
          { label: '新規顧客',   data: data.weeklyRevenue.map((w) => w.newCustomers),    borderColor: '#e94572', backgroundColor: 'rgba(233,69,114,.15)', fill: true, tension: 0.3 },
          { label: 'リピーター', data: data.weeklyRevenue.map((w) => w.repeatCustomers), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.15)', fill: true, tension: 0.3 }
        ]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    }, []);

    useChart(pieRef, {
      type: 'pie',
      data: {
        labels: campaigns.map((c) => c.platform),
        datasets: [{ data: campaigns.map((c) => c.conversions), backgroundColor: ['#e94572', '#f59e0b', '#8b5cf6', '#14b8a6', '#38bdf8'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    }, [campaigns]);

    const save = (form) => {
      if (form.id) setCampaigns(campaigns.map((c) => c.id === form.id ? { ...c, ...form } : c));
      else setCampaigns([...campaigns, { id: 'ad' + Date.now(), impressions: 0, clicks: 0, conversions: 0, spent: 0, cpa: 0, status: 'draft', ...form }]);
      setModalOpen(false);
    };

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="総予算"       value={`¥${(totalBudget / 1000).toFixed(0)}k`}  delta={5}  icon={<Icons.Money />} />
          <Stat label="消化額"       value={`¥${(totalSpent / 1000).toFixed(0)}k`}   delta={8}  icon={<Icons.Chart />} />
          <Stat label="CV(予約)"     value={`${totalConv}件`}                        delta={12} icon={<Icons.Tag />}   />
          <Stat label="平均CPA"      value={`¥${avgCpa.toLocaleString()}`}           delta={-4} icon={<Icons.Star />}  />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">キャンペーン</th>
                  <th className="text-left px-4 py-3">プラットフォーム</th>
                  <th className="text-right px-4 py-3">予算/消化</th>
                  <th className="text-right px-4 py-3">表示</th>
                  <th className="text-right px-4 py-3">クリック</th>
                  <th className="text-right px-4 py-3">CV</th>
                  <th className="text-right px-4 py-3">CPA</th>
                  <th className="text-left px-4 py-3">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const pct = c.budget ? Math.round(c.spent / c.budget * 100) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setEditing(c); setModalOpen(true); }}>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3"><Badge tone="slate">{c.platform}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs">¥{(c.spent / 1000).toFixed(0)}k / ¥{(c.budget / 1000).toFixed(0)}k</div>
                        <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
                      </td>
                      <td className="px-4 py-3 text-right">{c.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{c.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold">{c.conversions}</td>
                      <td className="px-4 py-3 text-right">¥{c.cpa.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge tone={c.status === 'active' ? 'green' : c.status === 'draft' ? 'slate' : 'rose'}>
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
    React.useEffect(() => {
      if (open) setForm(editing ? { ...editing } : { name: '', platform: 'Instagram', budget: 50000, status: 'draft' });
    }, [open, editing]);
    if (!open) return null;
    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? 'キャンペーンを編集' : 'キャンペーン作成'}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="名前"       value={form.name}     onChange={(v) => setForm({ ...form, name: v })} className="col-span-2" />
          <Select label="媒体"      value={form.platform} onChange={(v) => setForm({ ...form, platform: v })}
            options={['Instagram', 'Google Ads', 'LINE公式', 'ホットペッパー', 'TikTok', 'YouTube']} />
          <Input  label="予算"      type="number" value={form.budget} onChange={(v) => setForm({ ...form, budget: parseInt(v) || 0 })} />
          <Select label="状態"      value={form.status}   onChange={(v) => setForm({ ...form, status: v })}
            options={[{ value: 'draft', label: '下書き' }, { value: 'active', label: '運用中' }, { value: 'ended', label: '終了' }]} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave(form)}>保存</Button>
        </div>
      </Modal>
    );
  };

  window.NUAE.Marketing = Marketing;
})();
