/* Reservation management - kinetic calendar */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea, SegmentedTabs, useToast } = UI;

  const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i);

  const weekDates = (start) => {
    const s = new Date(start);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const statusTone = (s) => ({ '確定': 'brand', '来店待ち': 'blue', '施術中': 'violet', '完了': 'green', 'キャンセル': 'rose' })[s] || 'slate';

  const Reservations = () => {
    const [view, setView] = React.useState('week');
    const [weekStart, setWeekStart] = React.useState(data.today);
    const [filterStaff, setFilterStaff] = React.useState('all');
    const [filterChannel, setFilterChannel] = React.useState('all');
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [reservations, setReservations] = React.useState(data.reservations);
    const toast = useToast();

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
      if (editing?.id) {
        setReservations(reservations.map((r) => r.id === editing.id ? { ...r, ...form } : r));
        toast({ tone: 'success', title: '予約を更新しました' });
      } else {
        const id = 'r' + Date.now();
        setReservations([...reservations, { id, ...form }]);
        toast({ tone: 'success', title: '予約を作成しました', description: `${form.date} ${form.start}〜` });
      }
      setModalOpen(false);
    };
    const remove = (id) => {
      setReservations(reservations.filter((r) => r.id !== id));
      setModalOpen(false);
      toast({ tone: 'error', title: '予約を削除しました' });
    };

    return (
      <div className="p-6 space-y-4 page-enter">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedTabs value={view} onChange={setView} options={[{ value: 'week', label: '週表示' }, { value: 'list', label: '一覧' }]} />
            {view === 'week' && (
              <div className="inline-flex items-center gap-1 glass rounded-xl px-1 py-1 border border-white/50">
                <button onClick={() => shiftWeek(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50 press"><Icons.ChevronLeft size={16} /></button>
                <div className="px-3 text-sm font-semibold text-slate-700">{weekStart}</div>
                <button onClick={() => shiftWeek(1)}  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50 press"><Icons.ChevronRight size={16} /></button>
                <button onClick={() => setWeekStart(data.today)} className="px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-600 hover:bg-brand-50 press">今日</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterStaff}   onChange={setFilterStaff}
              options={[{ value: 'all', label: 'スタッフ(全員)' }, ...data.staff.map((s) => ({ value: s.id, label: s.name }))]} />
            <Select value={filterChannel} onChange={setFilterChannel}
              options={[{ value: 'all', label: 'チャネル(全て)' }, ...data.channels.map((c) => ({ value: c, label: c }))]} />
            <Button icon={<Icons.Plus size={16} />} onClick={openNew}>新規予約</Button>
          </div>
        </div>

        {view === 'week' && (
          <Card className="overflow-hidden" title="週間カレンダー" actions={
            <div className="flex items-center gap-3 text-xs">
              {data.staff.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  {s.name.split(' ')[0]}
                </div>
              ))}
            </div>
          }>
            <div className="overflow-x-auto">
              <div className="cal-grid text-xs min-w-[980px]">
                <div className="p-2 bg-slate-50/60"></div>
                {days.map((d) => {
                  const date = new Date(d);
                  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                  const isToday = d === data.today;
                  const weekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div key={d} className={`p-2.5 text-center border-b border-slate-100 ${isToday ? 'bg-brand-50/60' : 'bg-slate-50/40'}`}>
                      <div className={`text-[10px] font-semibold ${isToday ? 'text-brand-600' : weekend ? 'text-rose-500' : 'text-slate-500'}`}>{dow}</div>
                      <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-brand-600' : 'text-slate-800'}`}>
                        {date.getMonth() + 1}/{date.getDate()}
                      </div>
                      {isToday && <div className="mt-1 inline-block w-1 h-1 rounded-full bg-brand-500 glow-pulse" />}
                    </div>
                  );
                })}
                {HOURS.map((h) => (
                  <React.Fragment key={h}>
                    <div className="p-2 bg-slate-50/40 text-[11px] text-slate-400 text-right pr-3 border-b border-slate-100">{h}:00</div>
                    {days.map((d) => (
                      <div key={d + h} className="cal-cell"
                           onClick={() => { setEditing({ date: d, start: `${h}:00`, end: `${h + 1}:00` }); setModalOpen(true); }}>
                        {filtered.filter((r) => r.date === d && parseInt(r.start) === h).map((r) => {
                          const c = data.customers.find((x) => x.id === r.customerId);
                          const s = data.staff.find((x) => x.id === r.staffId);
                          return (
                            <div key={r.id}
                                 onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                                 style={{ borderLeft: `3px solid ${s?.color}`, background: `linear-gradient(90deg, ${s?.color}18, #ffffff)` }}
                                 className="cal-event">
                              <div className="flex items-center justify-between">
                                <div className="text-[11px] font-semibold text-slate-800 truncate">{c?.name}</div>
                                <span className="text-[9px]" style={{ color: s?.color }}>●</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">{r.start}-{r.end}</div>
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
          <Card title={`${filtered.length}件の予約`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-slate-500 text-[11px] uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-100/70 stagger-children">
                  {filtered.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map((r) => {
                    const c = data.customers.find((x) => x.id === r.customerId);
                    const s = data.staff.find((x) => x.id === r.staffId);
                    const m = r.menuIds.map((id) => data.menus.find((x) => x.id === id)?.name).join('、');
                    return (
                      <tr key={r.id} className="hover:bg-brand-50/30 cursor-pointer transition-colors" onClick={() => openEdit(r)}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.date}</div>
                          <div className="text-[11px] text-slate-500">{r.start} - {r.end}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{c?.name}</div>
                          {c?.tags?.includes('VIP') && <Badge tone="amber">VIP</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: s?.color + '22' }}>{s?.avatar}</span>
                            <span className="text-sm">{s?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[250px] truncate text-slate-600">{m}</td>
                        <td className="px-4 py-3"><Badge tone={r.channel === 'LINE' ? 'green' : 'violet'} dot>{r.channel}</Badge></td>
                        <td className="px-4 py-3 text-right font-semibold">¥{r.price.toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge tone={statusTone(r.status)} dot live={r.status === '施術中'}>{r.status}</Badge></td>
                        <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-brand-500 hover:text-brand-700 text-xs font-semibold">編集 →</button></td>
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
    const design = form.designId ? data.designs.find((d) => d.id === form.designId) : null;

    return (
      <Modal open={open} onClose={onClose}
        title={editing?.id ? '予約を編集' : '新規予約'}
        subtitle={editing?.id ? `ID: ${editing.id}` : '空き枠から自動で時間が設定されます'}
        size="lg"
        footer={
          <div className="flex justify-between items-center">
            {editing?.id ? <Button variant="danger" icon={<Icons.Trash size={14} />} size="sm" onClick={() => onDelete(editing.id)}>削除</Button> : <div />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>キャンセル</Button>
              <Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button>
            </div>
          </div>
        }
      >
        {design && (
          <div className="mb-4 flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="w-14 h-14 rounded-xl shadow-sm shrink-0" style={{ background: design.image }} />
            <div>
              <div className="text-xs text-slate-500">選択中のデザイン</div>
              <div className="font-semibold">{design.name}</div>
              <div className="text-xs text-brand-600">¥{design.price.toLocaleString()}</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="日付" type="date" value={form.date} onChange={(v) => update('date', v)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="開始" type="time" value={form.start} onChange={(v) => update('start', v)} />
            <Input label="終了" type="time" value={form.end}   onChange={(v) => update('end', v)} />
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
          <Select label="チャネル"   value={form.channel} onChange={(v) => update('channel', v)} options={data.channels} />
          <Select label="ステータス" value={form.status}  onChange={(v) => update('status', v)}  options={data.status} />
          <Input  label="金額" type="number" value={form.price} onChange={(v) => update('price', parseInt(v) || 0)} />
        </div>
        <Textarea label="メモ" value={form.note} onChange={(v) => update('note', v)} className="mt-4" />
      </Modal>
    );
  };

  window.NUAE.Reservations = Reservations;
})();
