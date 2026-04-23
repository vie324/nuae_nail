/* Customer management - with timeline & avatars */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea, SegmentedTabs, Ring, useToast } = UI;

  const gradientFor = (name) => {
    const seeds = ['#fb9fb8', '#e94572', '#a78bfa', '#60a5fa', '#f59e0b', '#14b8a6', '#f472b6', '#6ee7b7'];
    const h = Array.from(name || '').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const a = seeds[h % seeds.length];
    const b = seeds[(h + 3) % seeds.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
  };

  const initials = (name) => (name || '').replace(/\s/g, '').slice(0, 2);

  const Customers = () => {
    const [search, setSearch] = React.useState('');
    const [filter, setFilter] = React.useState('all');
    const [selected, setSelected] = React.useState(null);
    const [customers, setCustomers] = React.useState(data.customers);
    const [modalOpen, setModalOpen] = React.useState(false);
    const toast = useToast();

    const filtered = customers.filter((c) => {
      if (search && !(c.name.includes(search) || c.kana.includes(search) || c.phone.includes(search))) return false;
      if (filter === 'vip'  && !c.tags.includes('VIP')) return false;
      if (filter === 'new'  && !c.tags.includes('新規')) return false;
      if (filter === 'risk' && !c.tags.includes('離脱リスク')) return false;
      return true;
    });

    const save = (form) => {
      if (form.id) {
        setCustomers(customers.map((c) => c.id === form.id ? { ...c, ...form } : c));
        toast({ tone: 'success', title: '顧客情報を更新' });
      } else {
        setCustomers([{ id: 'c' + Date.now(), visits: 0, totalSpent: 0, tags: ['新規'], ...form }, ...customers]);
        toast({ tone: 'success', title: '新規顧客を登録' });
      }
      setModalOpen(false);
    };

    return (
      <div className="p-6 space-y-4 page-enter">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="名前・カナ・電話番号で検索..."
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100/60 transition-shadow" />
              <span className="absolute left-3 top-3 text-slate-400"><Icons.Search size={18} /></span>
            </div>
            <SegmentedTabs value={filter} onChange={setFilter} options={[
              { value: 'all', label: '全て' }, { value: 'vip', label: 'VIP' }, { value: 'new', label: '新規' }, { value: 'risk', label: '離脱リスク' }
            ]} />
          </div>
          <Button icon={<Icons.Plus size={16} />} onClick={() => { setSelected(null); setModalOpen(true); }}>新規顧客</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-slate-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">顧客</th>
                    <th className="text-left px-4 py-3">タグ</th>
                    <th className="text-right px-4 py-3">来店</th>
                    <th className="text-right px-4 py-3">累計</th>
                    <th className="text-left px-4 py-3">最終来店</th>
                    <th className="text-left px-4 py-3">チャネル</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 stagger-children">
                  {filtered.map((c) => (
                    <tr key={c.id} className={`hover:bg-brand-50/30 cursor-pointer transition-colors ${selected?.id === c.id ? 'bg-brand-50/40 ring-1 ring-inset ring-brand-200' : ''}`} onClick={() => setSelected(c)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm shrink-0" style={{ background: gradientFor(c.name) }}>
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">{c.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{c.kana}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <Badge key={t} tone={t === 'VIP' ? 'amber' : t === '離脱リスク' ? 'rose' : t === '新規' ? 'blue' : 'slate'} dot>{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{c.visits}</td>
                      <td className="px-4 py-3 text-right">¥{c.totalSpent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{c.lastVisit}</td>
                      <td className="px-4 py-3"><Badge tone="slate">{c.channel}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="scale-in">
            {selected ? (
              <CustomerDetail customer={selected} onEdit={() => setModalOpen(true)} onNote={(n) => setCustomers(customers.map((c) => c.id === selected.id ? { ...c, note: n } : c))} />
            ) : (
              <Card>
                <div className="py-12 text-center">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-3xl aurora-bg flex items-center justify-center text-white shadow-[0_12px_30px_-10px_rgba(233,69,114,.5)]">
                      <Icons.Users size={28} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-white glow-pulse" />
                  </div>
                  <div className="mt-4 font-semibold text-slate-700">顧客を選択</div>
                  <div className="text-sm text-slate-500 mt-1">左のリストから選ぶと<br/>詳細が表示されます</div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} editing={selected} onSave={save} />
      </div>
    );
  };

  const CustomerDetail = ({ customer, onEdit }) => {
    const visits = data.reservations.filter((r) => r.customerId === customer.id).sort((a, b) => b.date.localeCompare(a.date));
    const counseling = data.counselingRecords.filter((c) => c.customerId === customer.id);
    const avgSpent = customer.visits ? Math.round(customer.totalSpent / customer.visits) : 0;
    const loyaltyPct = Math.min(100, customer.visits * 5);

    return (
      <Card className="overflow-hidden">
        {/* Hero */}
        <div className="relative h-20 aurora-bg" />
        <div className="px-5 pb-5 -mt-10">
          <div className="flex items-end justify-between gap-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[0_10px_30px_-6px_rgba(0,0,0,.35)] ring-4 ring-white" style={{ background: gradientFor(customer.name) }}>
              {customer.name.replace(/\s/g, '').slice(0, 2)}
            </div>
            <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />} onClick={onEdit}>編集</Button>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-lg font-bold text-slate-800">{customer.name}</div>
              {customer.tags.map((t) => <Badge key={t} tone={t === 'VIP' ? 'amber' : t === '離脱リスク' ? 'rose' : 'brand'} dot>{t}</Badge>)}
            </div>
            <div className="text-xs text-slate-500">{customer.kana}</div>
          </div>

          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-slate-600"><Icons.Phone size={14} className="text-brand-400"/> {customer.phone}</div>
            {customer.line && <div className="flex items-center gap-2 text-emerald-600"><Icons.Chat size={14}/> LINE: {customer.line}</div>}
            <div className="flex items-center gap-2 text-slate-600"><Icons.Tag size={14} className="text-violet-400"/> 誕生日 {customer.birthday}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-50 to-rose-50 text-center">
              <div className="text-[10px] text-slate-500 uppercase">来店</div>
              <div className="font-bold text-slate-800 text-lg">{customer.visits}</div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-center">
              <div className="text-[10px] text-slate-500 uppercase">平均</div>
              <div className="font-bold text-slate-800 text-sm">¥{avgSpent.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-center flex items-center justify-center">
              <Ring value={loyaltyPct} size={48} stroke={5} color="#10b981" label="LOYAL" />
            </div>
          </div>

          {customer.note && (
            <div className="mt-3 p-3 text-xs bg-amber-50/60 text-amber-800 rounded-xl border border-amber-100">
              <span className="font-semibold">📝 施術メモ </span>{customer.note}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">来店タイムライン</div>
          <div className="relative pl-4 space-y-3 max-h-56 overflow-y-auto stagger-children">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-brand-300 to-transparent" />
            {visits.length === 0 && <div className="text-xs text-slate-400">まだ来店履歴はありません</div>}
            {visits.map((v) => {
              const s = data.staff.find((x) => x.id === v.staffId);
              const m = v.menuIds.map((id) => data.menus.find((mm) => mm.id === id)?.name).join(', ');
              return (
                <div key={v.id} className="relative text-xs">
                  <span className="absolute -left-[12px] top-1 w-3 h-3 rounded-full bg-white border-2" style={{ borderColor: s?.color }} />
                  <div className="font-semibold text-slate-700">{v.date} · {v.start}</div>
                  <div className="text-slate-600 truncate">{m}</div>
                  <div className="text-slate-400">担当: {s?.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {counseling.length > 0 && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">カウンセリング</div>
            <div className="space-y-2">
              {counseling.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 text-xs">
                  <div className="font-medium flex items-center justify-between">
                    <span>{c.date}</span>
                    <Badge tone="brand">{data.counselingTemplates.find((t) => t.id === c.templateId)?.name}</Badge>
                  </div>
                  <div className="text-slate-600 mt-1">{c.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const CustomerModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => {
      if (open) setForm(editing ? { ...editing } : { name: '', kana: '', phone: '', line: '', birthday: '', channel: 'LINE', note: '', tags: ['新規'] });
    }, [open, editing]);
    if (!open) return null;
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? '顧客情報を編集' : '新規顧客'} size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button>
          </div>
        }>
        <div className="grid grid-cols-2 gap-4">
          <Input label="お名前"       value={form.name}     onChange={(v) => update('name', v)} />
          <Input label="カナ"         value={form.kana}     onChange={(v) => update('kana', v)} />
          <Input label="電話番号"     value={form.phone}    onChange={(v) => update('phone', v)} />
          <Input label="LINE ID"      value={form.line}     onChange={(v) => update('line', v)} />
          <Input label="誕生日" type="date" value={form.birthday} onChange={(v) => update('birthday', v)} />
          <Select label="流入チャネル" value={form.channel} onChange={(v) => update('channel', v)} options={data.channels} />
        </div>
        <Textarea label="施術メモ / 特記事項" value={form.note} onChange={(v) => update('note', v)} className="mt-4" />
      </Modal>
    );
  };

  window.NUAE.Customers = Customers;
})();
