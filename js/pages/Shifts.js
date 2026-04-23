/* Shift management - animated grid */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, useToast } = UI;

  const TYPES = {
    work: { label: '出勤', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' },
    off:  { label: '休み', bg: 'bg-slate-50 text-slate-400 border-slate-100' },
    paid: { label: '有給', bg: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700 border-amber-200' }
  };

  const Shifts = () => {
    const [shifts, setShifts] = React.useState(data.shifts);
    const [startOffset, setStartOffset] = React.useState(-3);
    const [editing, setEditing] = React.useState(null);
    const toast = useToast();

    const days = Array.from({ length: 14 }, (_, i) => data.offset(startOffset + i));

    const getShift = (staffId, date) => shifts.find((s) => s.staffId === staffId && s.date === date);

    const cycle = (staffId, date) => {
      const current = getShift(staffId, date);
      const next = { work: 'off', off: 'paid', paid: 'work' }[current?.type || 'work'];
      setShifts(shifts.map((s) =>
        s.staffId === staffId && s.date === date
          ? { ...s, type: next, start: next === 'work' ? '10:00' : null, end: next === 'work' ? '19:00' : null }
          : s
      ));
    };

    const save = (form) => { setShifts(shifts.map((s) => s.staffId === form.staffId && s.date === form.date ? form : s)); setEditing(null); toast({ tone: 'success', title: 'シフトを更新' }); };

    const summary = data.staff.map((s) => {
      const sts = shifts.filter((x) => x.staffId === s.id && days.includes(x.date));
      return { id: s.id,
        work: sts.filter((x) => x.type === 'work').length,
        off:  sts.filter((x) => x.type === 'off').length,
        paid: sts.filter((x) => x.type === 'paid').length
      };
    });

    return (
      <div className="p-6 space-y-4 page-enter">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 glass rounded-xl border border-white/50 px-1 py-1">
            <button onClick={() => setStartOffset(startOffset - 7)} className="w-8 h-8 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 press flex items-center justify-center"><Icons.ChevronLeft size={16} /></button>
            <div className="px-3 text-sm font-semibold">{days[0]} 〜 {days[13]}</div>
            <button onClick={() => setStartOffset(startOffset + 7)} className="w-8 h-8 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 press flex items-center justify-center"><Icons.ChevronRight size={16} /></button>
            <button onClick={() => setStartOffset(-3)} className="px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-600 hover:bg-brand-50 press">今日</button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Icons.Copy size={16} />} onClick={() => toast({ tone: 'info', title: '先週をコピーしました' })}>先週コピー</Button>
            <Button icon={<Icons.Upload size={16} />} onClick={() => toast({ tone: 'success', title: 'シフトを確定しました' })}>確定</Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1040px]">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="text-left px-3 py-3 sticky left-0 bg-slate-50/80 backdrop-blur z-10 border-b border-slate-100">スタッフ</th>
                  {days.map((d) => {
                    const date = new Date(d);
                    const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                    const isToday = d === data.today;
                    const weekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <th key={d} className={`px-1 py-2.5 text-center border-b border-slate-100 ${isToday ? 'bg-brand-50/60' : ''}`}>
                        <div className={`${isToday ? 'text-brand-600 font-bold' : weekend ? 'text-rose-500' : 'text-slate-500'}`}>{date.getMonth() + 1}/{date.getDate()}</div>
                        <div className={`text-[10px] ${isToday ? 'text-brand-500' : 'text-slate-400'}`}>{dow}</div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-center text-slate-500 border-b border-slate-100">集計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 stagger-children">
                {data.staff.map((s) => {
                  const sm = summary.find((x) => x.id === s.id);
                  return (
                    <tr key={s.id}>
                      <td className="px-3 py-2 sticky left-0 bg-white/95 backdrop-blur z-10">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{ background: `linear-gradient(135deg, ${s.color}44, ${s.color}22)` }}>{s.avatar}</span>
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.role}</div>
                          </div>
                        </div>
                      </td>
                      {days.map((d) => {
                        const sh = getShift(s.id, d);
                        const type = sh?.type || 'work';
                        const isToday = d === data.today;
                        return (
                          <td key={d} className="px-1 py-1 text-center">
                            <button
                              onClick={() => cycle(s.id, d)}
                              onDoubleClick={() => setEditing(sh || { staffId: s.id, date: d, type: 'work', start: '10:00', end: '19:00' })}
                              className={`w-full h-14 rounded-xl border text-[10px] flex flex-col items-center justify-center transition-all press ${TYPES[type].bg} ${isToday ? 'ring-2 ring-brand-300' : ''}`}>
                              <div className="font-bold">{TYPES[type].label}</div>
                              {type === 'work' && <div className="text-[9px] opacity-80">{sh?.start}-{sh?.end}</div>}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex flex-col gap-0.5 items-center">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">● {sm.work}</span>
                          <span className="inline-flex items-center gap-1 text-slate-400">○ {sm.off}</span>
                          <span className="inline-flex items-center gap-1 text-amber-600">◆ {sm.paid}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4 flex-wrap">
            <span>💡 セルをクリックで切替:</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200"/>出勤</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200"/>休み</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200"/>有給</span>
            <span>（ダブルクリックで時間編集）</span>
          </div>
        </Card>

        <ShiftEditModal open={!!editing} onClose={() => setEditing(null)} shift={editing} onSave={save} />
      </div>
    );
  };

  const ShiftEditModal = ({ open, onClose, shift, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm({ ...shift }); }, [open, shift]);
    if (!open) return null;
    return (
      <Modal open={open} onClose={onClose} title="シフトを編集" size="sm"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button></div>}>
        <div className="space-y-3">
          <div className="text-sm text-slate-500">{form.date}</div>
          <Select label="種別" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: 'work', label: '出勤' }, { value: 'off', label: '休み' }, { value: 'paid', label: '有給' }]} />
          {form.type === 'work' && (
            <div className="grid grid-cols-2 gap-2">
              <Input label="開始" type="time" value={form.start || ''} onChange={(v) => setForm({ ...form, start: v })} />
              <Input label="終了" type="time" value={form.end || ''}   onChange={(v) => setForm({ ...form, end: v })} />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  window.NUAE.Shifts = Shifts;
})();
