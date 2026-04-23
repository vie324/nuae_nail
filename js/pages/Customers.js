/* Customer management */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea } = UI;

  const Customers = () => {
    const [search, setSearch] = React.useState('');
    const [filter, setFilter] = React.useState('all');
    const [selected, setSelected] = React.useState(null);
    const [customers, setCustomers] = React.useState(data.customers);
    const [modalOpen, setModalOpen] = React.useState(false);

    const filtered = customers.filter((c) => {
      if (search && !(c.name.includes(search) || c.kana.includes(search) || c.phone.includes(search))) return false;
      if (filter === 'vip' && !c.tags.includes('VIP')) return false;
      if (filter === 'new' && !c.tags.includes('新規')) return false;
      if (filter === 'risk' && !c.tags.includes('離脱リスク')) return false;
      return true;
    });

    const save = (form) => {
      if (form.id) {
        setCustomers(customers.map((c) => c.id === form.id ? { ...c, ...form } : c));
      } else {
        setCustomers([...customers, { id: 'c' + Date.now(), visits: 0, totalSpent: 0, tags: ['新規'], ...form }]);
      }
      setModalOpen(false);
    };

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="名前・カナ・電話番号で検索..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-brand-400" />
              <span className="absolute left-2.5 top-2.5 text-slate-400"><Icons.Search size={18} /></span>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden">
              {[['all', '全て'], ['vip', 'VIP'], ['new', '新規'], ['risk', '離脱リスク']].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 text-sm ${filter === k ? 'bg-brand-500 text-white' : 'text-slate-600'}`}>{l}</button>
              ))}
            </div>
          </div>
          <Button icon={<Icons.Plus size={16} />} onClick={() => { setSelected(null); setModalOpen(true); }}>新規顧客</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">顧客</th>
                    <th className="text-left px-4 py-3">タグ</th>
                    <th className="text-right px-4 py-3">来店数</th>
                    <th className="text-right px-4 py-3">累計</th>
                    <th className="text-left px-4 py-3">最終来店</th>
                    <th className="text-left px-4 py-3">チャネル</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className={`hover:bg-slate-50 cursor-pointer ${selected?.id === c.id ? 'bg-brand-50/40' : ''}`} onClick={() => setSelected(c)}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[11px] text-slate-500">{c.kana}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <Badge key={t} tone={t === 'VIP' ? 'amber' : t === '離脱リスク' ? 'rose' : t === '新規' ? 'blue' : 'slate'}>{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{c.visits}</td>
                      <td className="px-4 py-3 text-right">¥{c.totalSpent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{c.lastVisit}</td>
                      <td className="px-4 py-3 text-xs">{c.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div>
            {selected ? (
              <CustomerDetail customer={selected} onEdit={() => setModalOpen(true)} />
            ) : (
              <Card className="p-8 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl mx-auto bg-slate-100 flex items-center justify-center text-slate-400"><Icons.Users /></div>
                <div className="mt-3 font-medium text-slate-600">顧客を選択すると詳細が表示されます</div>
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
    return (
      <Card>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">{customer.name}</div>
              <div className="text-xs text-slate-500">{customer.kana}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {customer.tags.map((t) => <Badge key={t} tone={t === 'VIP' ? 'amber' : 'brand'}>{t}</Badge>)}
              </div>
            </div>
            <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />} onClick={onEdit}>編集</Button>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-slate-600"><Icons.Phone size={14} /> {customer.phone}</div>
            {customer.line && <div className="flex items-center gap-2 text-emerald-600"><Icons.Chat size={14} /> LINE: {customer.line}</div>}
            <div className="flex items-center gap-2 text-slate-600"><Icons.Tag size={14} /> 誕生日 {customer.birthday}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2 rounded-lg bg-slate-50 text-center"><div className="text-[10px] text-slate-500">来店</div><div className="font-bold">{customer.visits}</div></div>
            <div className="p-2 rounded-lg bg-slate-50 text-center"><div className="text-[10px] text-slate-500">累計</div><div className="font-bold text-xs">¥{(customer.totalSpent / 1000).toFixed(0)}k</div></div>
            <div className="p-2 rounded-lg bg-slate-50 text-center"><div className="text-[10px] text-slate-500">平均</div><div className="font-bold text-xs">¥{customer.visits ? Math.round(customer.totalSpent / customer.visits / 100) * 100 : 0}</div></div>
          </div>
          {customer.note && <div className="mt-3 p-2 text-xs bg-amber-50 text-amber-800 rounded-lg">📝 {customer.note}</div>}
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2">来店履歴</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {visits.length === 0 && <div className="text-xs text-slate-400">まだ来店履歴はありません</div>}
            {visits.map((v) => {
              const s = data.staff.find((x) => x.id === v.staffId);
              const m = v.menuIds.map((id) => data.menus.find((mm) => mm.id === id)?.name).join(', ');
              return (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs">
                  <span className="font-medium w-20">{v.date}</span>
                  <span className="flex-1 truncate">{m}</span>
                  <span className="text-slate-500">{s?.avatar}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs font-semibold uppercase text-slate-500 mt-3 mb-2">カウンセリング</div>
          <div className="space-y-1">
            {counseling.length === 0 && <div className="text-xs text-slate-400">記録はありません</div>}
            {counseling.map((c) => (
              <div key={c.id} className="p-2 rounded-lg bg-slate-50 text-xs">
                <div className="font-medium">{c.date} · {data.counselingTemplates.find((t) => t.id === c.templateId)?.name}</div>
                <div className="text-slate-600 mt-0.5">{c.summary}</div>
              </div>
            ))}
          </div>
        </div>
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
      <Modal open={open} onClose={onClose} title={editing?.id ? '顧客情報を編集' : '新規顧客'}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="お名前"   value={form.name}   onChange={(v) => update('name', v)} />
          <Input label="カナ"     value={form.kana}   onChange={(v) => update('kana', v)} />
          <Input label="電話番号" value={form.phone}  onChange={(v) => update('phone', v)} />
          <Input label="LINE ID"  value={form.line}   onChange={(v) => update('line', v)} />
          <Input label="誕生日"   type="date" value={form.birthday} onChange={(v) => update('birthday', v)} />
          <Select label="流入チャネル" value={form.channel} onChange={(v) => update('channel', v)} options={data.channels} />
        </div>
        <Textarea label="メモ" value={form.note} onChange={(v) => update('note', v)} className="mt-4" />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave(form)}>保存</Button>
        </div>
      </Modal>
    );
  };

  window.NUAE.Customers = Customers;
})();
