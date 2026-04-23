/* Counseling feature */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea } = UI;

  const Counseling = () => {
    const [tab, setTab] = React.useState('records');
    const [records, setRecords] = React.useState(data.counselingRecords);
    const [templates, setTemplates] = React.useState(data.counselingTemplates);
    const [fillOpen, setFillOpen] = React.useState(false);
    const [tplOpen, setTplOpen] = React.useState(false);
    const [editingTpl, setEditingTpl] = React.useState(null);

    const TABS = [
      { id: 'records',   label: 'カウンセリング履歴' },
      { id: 'templates', label: 'テンプレート管理' }
    ];

    const saveRecord = (rec) => {
      setRecords([{ id: 'cs' + Date.now(), ...rec }, ...records]);
      setFillOpen(false);
    };
    const saveTpl = (t) => {
      if (t.id) setTemplates(templates.map((x) => x.id === t.id ? t : x));
      else setTemplates([...templates, { id: 't' + Date.now(), ...t }]);
      setTplOpen(false);
    };

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm ${tab === t.id ? 'bg-brand-500 text-white' : 'text-slate-600'}`}>{t.label}</button>
            ))}
          </div>
          {tab === 'records' && (
            <Button icon={<Icons.Plus size={16} />} onClick={() => setFillOpen(true)}>カウンセリングを実施</Button>
          )}
          {tab === 'templates' && (
            <Button icon={<Icons.Plus size={16} />} onClick={() => { setEditingTpl(null); setTplOpen(true); }}>テンプレート作成</Button>
          )}
        </div>

        {tab === 'records' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {records.map((r) => {
              const c = data.customers.find((x) => x.id === r.customerId);
              const t = templates.find((x) => x.id === r.templateId);
              return (
                <Card key={r.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500">{r.date}</div>
                      <div className="font-bold mt-1">{c?.name}</div>
                      <Badge tone="brand">{t?.name}</Badge>
                    </div>
                    <Badge tone={r.status === '完了' ? 'green' : 'amber'}>{r.status}</Badge>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm">{r.summary}</div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />}>詳細を見る</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">設問 {t.questions.length}問</div>
                  </div>
                  <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />} onClick={() => { setEditingTpl(t); setTplOpen(true); }}>編集</Button>
                </div>
                <div className="mt-3 space-y-1">
                  {t.questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 p-2 bg-slate-50 rounded-lg">
                      <Badge tone="slate">{q.type}</Badge>
                      <span className="flex-1">{q.q}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <FillModal open={fillOpen} onClose={() => setFillOpen(false)} templates={templates} onSave={saveRecord} />
        <TemplateModal open={tplOpen} onClose={() => setTplOpen(false)} editing={editingTpl} onSave={saveTpl} />
      </div>
    );
  };

  const FillModal = ({ open, onClose, templates, onSave }) => {
    const [customerId, setCustomerId] = React.useState(data.customers[0].id);
    const [templateId, setTemplateId] = React.useState(templates[0].id);
    const [answers, setAnswers] = React.useState({});
    const [summary, setSummary] = React.useState('');
    React.useEffect(() => { if (open) { setCustomerId(data.customers[0].id); setTemplateId(templates[0].id); setAnswers({}); setSummary(''); } }, [open]);

    const template = templates.find((t) => t.id === templateId);
    if (!open) return null;

    return (
      <Modal open={open} onClose={onClose} title="カウンセリング記録" size="lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="顧客"       value={customerId} onChange={setCustomerId} options={data.customers.map((c) => ({ value: c.id, label: c.name }))} />
          <Select label="テンプレート" value={templateId} onChange={setTemplateId} options={templates.map((t) => ({ value: t.id, label: t.name }))} />
        </div>
        <div className="space-y-3">
          {template?.questions.map((q, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50">
              <div className="text-sm font-medium mb-2">Q{i + 1}. {q.q}</div>
              {q.type === 'textarea' && <Textarea value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} rows={2} />}
              {q.type === 'text'     && <Input    value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} />}
              {q.type === 'date'     && <Input    type="date" value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} />}
              {q.type === 'select'   && <Select   value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} options={[{ value: '', label: '選択...' }, ...q.options]} />}
              {q.type === 'radio'    && (
                <div className="flex gap-3">
                  {q.options.map((o) => (
                    <label key={o} className="inline-flex items-center gap-1 text-sm">
                      <input type="radio" name={`q${i}`} checked={answers[i] === o} onChange={() => setAnswers({ ...answers, [i]: o })} /> {o}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'multi' && (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o) => {
                    const checked = (answers[i] || []).includes(o);
                    return (
                      <label key={o} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer border ${checked ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => {
                          const cur = answers[i] || [];
                          setAnswers({ ...answers, [i]: checked ? cur.filter((x) => x !== o) : [...cur, o] });
                        }} />
                        {o}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <Textarea label="担当者サマリ" value={summary} onChange={setSummary} rows={3} className="mt-4" />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave({ customerId, templateId, date: data.today, status: '完了', summary, answers })}>保存</Button>
        </div>
      </Modal>
    );
  };

  const TemplateModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm(editing ? { ...editing } : { name: '', questions: [{ q: '', type: 'text' }] }); }, [open, editing]);
    if (!open) return null;

    const updateQ = (i, patch) => {
      const qs = [...form.questions];
      qs[i] = { ...qs[i], ...patch };
      setForm({ ...form, questions: qs });
    };
    const addQ    = () => setForm({ ...form, questions: [...form.questions, { q: '', type: 'text' }] });
    const removeQ = (i) => setForm({ ...form, questions: form.questions.filter((_, x) => x !== i) });

    return (
      <Modal open={open} onClose={onClose} title={editing ? 'テンプレートを編集' : 'テンプレート作成'} size="lg">
        <Input label="テンプレート名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className="mb-4" />
        <div className="text-xs font-semibold uppercase text-slate-500 mb-2">質問項目</div>
        <div className="space-y-2">
          {form.questions?.map((q, i) => (
            <div key={i} className="flex gap-2 items-start p-2 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-400 pt-2">Q{i + 1}</div>
              <Input className="flex-1" value={q.q} onChange={(v) => updateQ(i, { q: v })} placeholder="質問文" />
              <Select value={q.type} onChange={(v) => updateQ(i, { type: v })} options={['text', 'textarea', 'date', 'select', 'radio', 'multi']} />
              <button onClick={() => removeQ(i)} className="p-2 text-slate-400 hover:text-rose-500"><Icons.Trash size={16} /></button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" icon={<Icons.Plus size={14} />} onClick={addQ} className="mt-3">質問を追加</Button>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave(form)}>保存</Button>
        </div>
      </Modal>
    );
  };

  window.NUAE.Counseling = Counseling;
})();
