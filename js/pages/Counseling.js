/* Counseling feature - stepped form */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, Textarea, SegmentedTabs, Ring, useToast } = UI;

  const Counseling = () => {
    const [tab, setTab] = React.useState('records');
    const [records, setRecords] = React.useState(data.counselingRecords);
    const [templates, setTemplates] = React.useState(data.counselingTemplates);
    const [fillOpen, setFillOpen] = React.useState(false);
    const [tplOpen, setTplOpen] = React.useState(false);
    const [editingTpl, setEditingTpl] = React.useState(null);
    const toast = useToast();

    const saveRecord = (rec) => {
      setRecords([{ id: 'cs' + Date.now(), ...rec }, ...records]);
      setFillOpen(false);
      toast({ tone: 'success', title: 'カウンセリングを保存しました' });
    };
    const saveTpl = (t) => {
      if (t.id) setTemplates(templates.map((x) => x.id === t.id ? t : x));
      else setTemplates([...templates, { id: 't' + Date.now(), ...t }]);
      setTplOpen(false);
      toast({ tone: 'success', title: 'テンプレートを保存' });
    };

    return (
      <div className="p-6 space-y-4 page-enter">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <SegmentedTabs value={tab} onChange={setTab} options={[
            { value: 'records',   label: 'カウンセリング履歴' },
            { value: 'templates', label: 'テンプレート管理' }
          ]} />
          {tab === 'records' && <Button icon={<Icons.Plus size={16} />} onClick={() => setFillOpen(true)}>カウンセリングを実施</Button>}
          {tab === 'templates' && <Button icon={<Icons.Plus size={16} />} onClick={() => { setEditingTpl(null); setTplOpen(true); }}>テンプレート作成</Button>}
        </div>

        {tab === 'records' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 stagger-children">
            {records.map((r) => {
              const c = data.customers.find((x) => x.id === r.customerId);
              const t = templates.find((x) => x.id === r.templateId);
              return (
                <Card key={r.id} className="p-5 hover-lift" gradient>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500">{r.date}</div>
                      <div className="font-bold mt-1 text-slate-800">{c?.name}</div>
                      <Badge tone="brand">{t?.name}</Badge>
                    </div>
                    <Badge tone={r.status === '完了' ? 'green' : 'amber'} dot>{r.status}</Badge>
                  </div>
                  <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-brand-50/30 rounded-2xl text-sm leading-relaxed">
                    {r.summary}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />}>詳細を見る</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {templates.map((t) => (
              <Card key={t.id} className="p-5 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">設問 {t.questions.length}問</div>
                  </div>
                  <Button size="sm" variant="secondary" icon={<Icons.Edit size={14} />} onClick={() => { setEditingTpl(t); setTplOpen(true); }}>編集</Button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {t.questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 p-2 bg-slate-50/70 rounded-xl">
                      <Badge tone="slate">{q.type}</Badge>
                      <span className="flex-1 truncate">{q.q}</span>
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
    const [step, setStep] = React.useState(0);
    React.useEffect(() => { if (open) { setCustomerId(data.customers[0].id); setTemplateId(templates[0].id); setAnswers({}); setSummary(''); setStep(0); } }, [open]);

    const template = templates.find((t) => t.id === templateId);
    if (!open) return null;

    const totalSteps = (template?.questions?.length || 0) + 2;
    const progress = Math.round(step / (totalSteps - 1) * 100);

    return (
      <Modal open={open} onClose={onClose} title="カウンセリング記録" size="lg"
        subtitle={`Step ${step + 1} / ${totalSteps}`}
        footer={
          <div className="flex justify-between items-center">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>戻る</Button>
            <div className="flex items-center gap-3">
              <div className="w-40 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500" style={{ width: progress + '%' }} />
              </div>
              {step < totalSteps - 1
                ? <Button onClick={() => setStep(step + 1)} iconRight={<Icons.ChevronRight size={14} />}>次へ</Button>
                : <Button onClick={() => onSave({ customerId, templateId, date: data.today, status: '完了', summary, answers })} icon={<Icons.Check size={14} />}>保存</Button>
              }
            </div>
          </div>
        }>
        {step === 0 && (
          <div className="space-y-4 fade-in-up">
            <div className="text-center py-4">
              <div className="inline-flex w-16 h-16 rounded-3xl aurora-bg text-white items-center justify-center text-2xl">📋</div>
              <div className="mt-3 font-bold text-lg">基本情報を入力してください</div>
              <div className="text-sm text-slate-500">顧客とテンプレートを選択します</div>
            </div>
            <Select label="顧客"          value={customerId} onChange={setCustomerId} options={data.customers.map((c) => ({ value: c.id, label: c.name }))} />
            <Select label="テンプレート"  value={templateId} onChange={setTemplateId} options={templates.map((t) => ({ value: t.id, label: t.name }))} />
          </div>
        )}
        {step > 0 && step <= template.questions.length && (() => {
          const i = step - 1;
          const q = template.questions[i];
          return (
            <div className="space-y-4 fade-in-up">
              <div className="text-xs text-slate-500">質問 {i + 1} / {template.questions.length}</div>
              <div className="text-xl font-bold text-slate-800">{q.q}</div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30">
                {q.type === 'textarea' && <Textarea value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} rows={4} />}
                {q.type === 'text'     && <Input    value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} />}
                {q.type === 'date'     && <Input    type="date" value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} />}
                {q.type === 'select'   && <Select   value={answers[i] || ''} onChange={(v) => setAnswers({ ...answers, [i]: v })} options={[{ value: '', label: '選択...' }, ...q.options]} />}
                {q.type === 'radio' && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <button key={o} onClick={() => setAnswers({ ...answers, [i]: o })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all press ${answers[i] === o ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md' : 'bg-white border border-slate-200 hover:border-brand-300'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === 'multi' && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const checked = (answers[i] || []).includes(o);
                      return (
                        <button key={o} onClick={() => {
                            const cur = answers[i] || [];
                            setAnswers({ ...answers, [i]: checked ? cur.filter((x) => x !== o) : [...cur, o] });
                          }}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm cursor-pointer transition-all press ${checked ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md' : 'bg-white border border-slate-200 hover:border-brand-300'}`}>
                          {checked && <Icons.Check size={14} />} {o}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
        {step === totalSteps - 1 && (
          <div className="space-y-4 fade-in-up">
            <div className="text-center py-2">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white items-center justify-center">
                <Icons.Check size={28} />
              </div>
              <div className="mt-3 font-bold text-lg">最後に担当者サマリを入力</div>
              <div className="text-sm text-slate-500">次回来店時の参考になります</div>
            </div>
            <Textarea label="担当者サマリ" value={summary} onChange={setSummary} rows={5} placeholder="施術中に気づいた点、次回提案したいデザインなど" />
          </div>
        )}
      </Modal>
    );
  };

  const TemplateModal = ({ open, onClose, editing, onSave }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => { if (open) setForm(editing ? { ...editing } : { name: '', questions: [{ q: '', type: 'text' }] }); }, [open, editing]);
    if (!open) return null;
    const updateQ = (i, patch) => { const qs = [...form.questions]; qs[i] = { ...qs[i], ...patch }; setForm({ ...form, questions: qs }); };
    const addQ    = () => setForm({ ...form, questions: [...form.questions, { q: '', type: 'text' }] });
    const removeQ = (i) => setForm({ ...form, questions: form.questions.filter((_, x) => x !== i) });
    return (
      <Modal open={open} onClose={onClose} title={editing ? 'テンプレートを編集' : 'テンプレート作成'} size="lg"
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>キャンセル</Button><Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button></div>}>
        <Input label="テンプレート名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className="mb-4" />
        <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">質問項目</div>
        <div className="space-y-2 stagger-children">
          {form.questions?.map((q, i) => (
            <div key={i} className="flex gap-2 items-center p-3 bg-slate-50/70 rounded-2xl">
              <div className="w-7 h-7 rounded-lg bg-white text-brand-600 font-bold flex items-center justify-center text-xs shadow-sm">Q{i + 1}</div>
              <Input className="flex-1" value={q.q} onChange={(v) => updateQ(i, { q: v })} placeholder="質問文" />
              <Select value={q.type} onChange={(v) => updateQ(i, { type: v })} options={['text', 'textarea', 'date', 'select', 'radio', 'multi']} />
              <button onClick={() => removeQ(i)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center press"><Icons.Trash size={16} /></button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" icon={<Icons.Plus size={14} />} onClick={addQ} className="mt-3">質問を追加</Button>
      </Modal>
    );
  };

  window.NUAE.Counseling = Counseling;
})();
