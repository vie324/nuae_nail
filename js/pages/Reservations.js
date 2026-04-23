/* Reservation management */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea } = UI;

  const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i); // 9..19

  const weekDates = (start) => {
    const s = new Date(start);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const Reservations = () => {
    const [view, setView] = React.useState('week'); // week | list
    const [weekStart, setWeekStart] = React.useState(data.today);
    const [filterStaff, setFilterStaff] = React.useState('all');
    const [filterChannel, setFilterChannel] = React.useState('all');
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [reservations, setReservations] = React.useState(data.reservations);

    const days = weekDates(weekStart);

    const filtered = reservations.filter((r) => {
      if (filterStaff !== 'all' && r.staffId !== filterStaff) return false;
      if (filterChannel !== 'all' && r.channel !== filterChannel) return false;
      return true;
    });

    const shiftWeek = (n) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + n * 7);
      setWeekStart(d.toISOString().split('T')[0]);
    };

    const openNew = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (r) => { setEditing(r); setModalOpen(true); };

    const save = (form) => {
      if (editing) {
        setReservations(reservations.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      } else {
        const id = 'r' + Date.now();
        setReservations([...reservations, { id, ...form }]);
      }
      setModalOpen(false);
    };
    const remove = (id) => {
      setReservations(reservations.filter((r) => r.id !== id));
      setModalOpen(false);
    };

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button className={`px-3 py-1.5 text-sm ${view === 'week' ? 'bg-brand-500 text-white' : 'text-slate-600'}`} onClick={() => setView('week')}>週表示</button>
              <button className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-brand-500 text-white' : 'text-slate-600'}`} onClick={() => setView('list')}>一覧</button>
            </div>
            {view === 'week' && (
              <div className="inline-flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2">
                <button onClick={() => shiftWeek(-1)} className="p-1.5 text-slate-500 hover:text-slate-700"><Icons.ChevronLeft size={18} /></button>
                <span className="text-sm font-medium">{weekStart} 〜</span>
                <button onClick={() => shiftWeek(1)} className="p-1.5 text-slate-500 hover:text-slate-700"><Icons.ChevronRight size={18} /></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStaff} onChange={setFilterStaff} options={[{ value: 'all', label: 'スタッフ(全員)' }, ...data.staff.map((s) => ({ value: s.id, label: s.name }))]} />
            <Select value={filterChannel} onChange={setFilterChannel} options={[{ value: 'all', label: 'チャネル(全て)' }, ...data.channels.map((c) => ({ value: c, label: c }))]} />
            <Button icon={<Icons.Plus size={16} />} onClick={openNew}>新規予約</Button>
          </div>
        </div>

        {view === 'week' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="cal-grid text-xs min-w-[900px]">
                <div className="p-2 bg-slate-50"></div>
                {days.map((d) => {
                  const date = new Date(d);
                  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                  const isToday = d === data.today;
                  return (
                    <div key={d} className={`p-2 bg-slate-50 text-center ${isToday ? 'text-brand-600 font-bold' : 'text-slate-600'}`}>
                      <div className="text-[11px]">{dow}</div>
                      <div className="text-sm">{date.getMonth() + 1}/{date.getDate()}</div>
                    </div>
                  );
                })}
                {HOURS.map((h) => (
                  <React.Fragment key={h}>
                    <div className="p-2 bg-slate-50 text-[11px] text-slate-400 text-right pr-3">{h}:00</div>
                    {days.map((d) => (
                      <div key={d + h} className="cal-cell relative" onClick={() => { setEditing({ date: d, start: `${h}:00`, end: `${h + 1}:00` }); setModalOpen(true); }}>
                        {filtered.filter((r) => r.date === d && parseInt(r.start) === h).map((r) => {
                          const c = data.customers.find((x) => x.id === r.customerId);
                          const s = data.staff.find((x) => x.id === r.staffId);
                          return (
                            <div key={r.id}
                                 onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                                 style={{ borderLeftColor: s?.color }}
                                 className="absolute inset-x-1 top-1 bottom-1 border-l-4 bg-white shadow-sm rounded-md p-1.5 cursor-pointer hover:shadow-md">
                              <div className="text-[11px] font-semibold truncate">{c?.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{s?.avatar} {r.start}-{r.end}</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        )}

        {view === 'list' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">日時</th>
                    <th className="text-left px-4 py-3">顧客</th>
                    <th className="text-left px-4 py-3">スタッフ</th>
                    <th className="text-left px-4 py-3">メニュー</th>
                    <th className="text-left px-4 py-3">チャネル</th>
                    <th className="text-right px-4 py-3">金額</th>
                    <th className="text-left px-4 py-3">ステータス</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map((r) => {
                    const c = data.customers.find((x) => x.id === r.customerId);
                    const s = data.staff.find((x) => x.id === r.staffId);
                    const m = r.menuIds.map((id) => data.menus.find((x) => x.id === id)?.name).join('、');
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">{r.date}<br /><span className="text-xs text-slate-500">{r.start}-{r.end}</span></td>
                        <td className="px-4 py-3">{c?.name}</td>
                        <td className="px-4 py-3">{s?.avatar} {s?.name}</td>
                        <td className="px-4 py-3 max-w-[250px] truncate">{m}</td>
                        <td className="px-4 py-3"><Badge tone={r.channel === 'LINE' ? 'green' : 'violet'}>{r.channel}</Badge></td>
                        <td className="px-4 py-3 text-right font-medium">¥{r.price.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge tone={r.status === '完了' ? 'green' : r.status === 'キャンセル' ? 'rose' : 'brand'}>{r.status}</Badge></td>
                        <td className="px-4 py-3"><button onClick={() => openEdit(r)} className="text-brand-500 hover:underline text-xs">編集</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <ReservationModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={save} onDelete={remove} />
      </div>
    );
  };

  const ReservationModal = ({ open, onClose, editing, onSave, onDelete }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => {
      if (open) {
        setForm(editing ? { ...editing } : {
          date: data.today, start: '10:00', end: '11:00',
          customerId: data.customers[0].id, staffId: data.staff[0].id,
          menuIds: [data.menus[0].id], designId: null,
          status: '確定', channel: 'LINE', price: data.menus[0].price, note: ''
        });
      }
    }, [open, editing]);

    if (!open) return null;
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? '予約を編集' : '新規予約'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="日付" type="date" value={form.date} onChange={(v) => update('date', v)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="開始" type="time" value={form.start} onChange={(v) => update('start', v)} />
            <Input label="終了" type="time" value={form.end} onChange={(v) => update('end', v)} />
          </div>
          <Select label="顧客" value={form.customerId} onChange={(v) => update('customerId', v)}
            options={data.customers.map((c) => ({ value: c.id, label: c.name }))} />
          <Select label="担当スタッフ" value={form.staffId} onChange={(v) => update('staffId', v)}
            options={data.staff.map((s) => ({ value: s.id, label: s.name }))} />
          <Select label="メニュー" value={form.menuIds?.[0]} onChange={(v) => {
            const menu = data.menus.find((m) => m.id === v);
            update('menuIds', [v]); if (menu) update('price', menu.price);
          }} options={data.menus.map((m) => ({ value: m.id, label: `${m.name} (¥${m.price})` }))} />
          <Select label="デザイン" value={form.designId || ''} onChange={(v) => update('designId', v || null)}
            options={[{ value: '', label: '— 未選択 —' }, ...data.designs.map((d) => ({ value: d.id, label: d.name }))]} />
          <Select label="チャネル" value={form.channel} onChange={(v) => update('channel', v)} options={data.channels} />
          <Select label="ステータス" value={form.status} onChange={(v) => update('status', v)} options={data.status} />
          <Input label="金額" type="number" value={form.price} onChange={(v) => update('price', parseInt(v) || 0)} />
        </div>
        <Textarea label="メモ" value={form.note} onChange={(v) => update('note', v)} className="mt-4" />
        <div className="flex justify-between items-center mt-6">
          {editing?.id ? <Button variant="danger" icon={<Icons.Trash size={16} />} onClick={() => onDelete(editing.id)}>削除</Button> : <div />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button onClick={() => onSave(form)}>保存</Button>
          </div>
        </div>
      </Modal>
    );
  };

  window.NUAE.Reservations = Reservations;
})();
