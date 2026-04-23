/* Shift management */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select } = UI;

  const TYPES = {
    work: { label: '出勤', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    off:  { label: '休み', color: 'bg-slate-100 text-slate-500 border-slate-200' },
    paid: { label: '有給', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  };

  const Shifts = () => {
    const [shifts, setShifts] = React.useState(data.shifts);
    const [startOffset, setStartOffset] = React.useState(-3);
    const [editing, setEditing] = React.useState(null);

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

    const save = (form) => {
      setShifts(shifts.map((s) => s.staffId === form.staffId && s.date === form.date ? form : s));
      setEditing(null);
    };

    // summary counts
    const summary = data.staff.map((s) => {
      const sts = shifts.filter((x) => x.staffId === s.id && days.includes(x.date));
      return {
        id: s.id,
        work: sts.filter((x) => x.type === 'work').length,
        off:  sts.filter((x) => x.type === 'off').length,
        paid: sts.filter((x) => x.type === 'paid').length
      };
    });

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2">
            <button onClick={() => setStartOffset(startOffset - 7)} className="p-1.5 text-slate-500 hover:text-slate-700"><Icons.ChevronLeft size={18} /></button>
            <span className="text-sm font-medium">{days[0]} 〜 {days[13]}</span>
            <button onClick={() => setStartOffset(startOffset + 7)} className="p-1.5 text-slate-500 hover:text-slate-700"><Icons.ChevronRight size={18} /></button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Icons.Copy size={16} />}>先週をコピー</Button>
            <Button icon={<Icons.Upload size={16} />}>シフトを確定</Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-2 sticky left-0 bg-slate-50 z-10">スタッフ</th>
                  {days.map((d) => {
                    const date = new Date(d);
                    const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                    const isToday = d === data.today;
                    const weekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <th key={d} className={`px-1 py-2 text-center ${isToday ? 'bg-brand-50 text-brand-600' : weekend ? 'text-rose-500' : 'text-slate-500'}`}>
                        <div>{date.getMonth() + 1}/{date.getDate()}</div>
                        <div className="text-[10px]">{dow}</div>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-center text-slate-500">集計</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.staff.map((s) => {
                  const sm = summary.find((x) => x.id === s.id);
                  return (
                    <tr key={s.id}>
                      <td className="px-3 py-2 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.avatar}</span>
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.role}</div>
                          </div>
                        </div>
                      </td>
                      {days.map((d) => {
                        const sh = getShift(s.id, d);
                        const type = sh?.type || 'work';
                        return (
                          <td key={d} className="px-1 py-1 text-center">
                            <button
                              onClick={() => cycle(s.id, d)}
                              onDoubleClick={() => setEditing(sh || { staffId: s.id, date: d, type: 'work', start: '10:00', end: '19:00' })}
                              className={`w-full h-12 rounded-md border text-[10px] flex flex-col items-center justify-center ${TYPES[type].color}`}>
                              <div className="font-semibold">{TYPES[type].label}</div>
                              {type === 'work' && <div className="text-[9px]">{sh?.start}-{sh?.end}</div>}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center text-[11px]">
                        <div className="text-emerald-600">{sm.work}出</div>
                        <div className="text-slate-500">{sm.off}休</div>
                        <div className="text-amber-600">{sm.paid}有</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50">
            💡 セルをクリックで 出勤 → 休み → 有給 と切り替え。ダブルクリックで時間編集。
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
      <Modal open={open} onClose={onClose} title="シフトを編集" size="sm">
        <div className="space-y-3">
          <div className="text-sm text-slate-500">{form.date}</div>
          <Select label="種別" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: 'work', label: '出勤' }, { value: 'off', label: '休み' }, { value: 'paid', label: '有給' }]} />
          {form.type === 'work' && (
            <div className="grid grid-cols-2 gap-2">
              <Input label="開始" type="time" value={form.start || ''} onChange={(v) => setForm({ ...form, start: v })} />
              <Input label="終了" type="time" value={form.end || ''}   onChange={(v) => setForm({ ...form, end: v })} />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>キャンセル</Button>
            <Button onClick={() => onSave(form)}>保存</Button>
          </div>
        </div>
      </Modal>
    );
  };

  window.NUAE.Shifts = Shifts;
})();
