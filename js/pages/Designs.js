/* Nail design management - gallery with tilt & reveal */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select, SegmentedTabs, useToast } = UI;

  const Designs = () => {
    const [designs, setDesigns] = React.useState(data.designs);
    const [filter, setFilter] = React.useState('all');
    const [season, setSeason] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [sort, setSort] = React.useState('likes');
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const toast = useToast();

    const categories = ['all', ...new Set(designs.map((d) => d.category))];
    const seasons = ['all', '春', '夏', '秋', '冬', '秋冬', '春夏', '通年'];

    let filtered = designs.filter((d) => {
      if (filter !== 'all' && d.category !== filter) return false;
      if (season !== 'all' && d.season !== season) return false;
      if (search && !d.name.includes(search)) return false;
      return true;
    });
    if (sort === 'likes') filtered = filtered.sort((a, b) => b.likes - a.likes);
    if (sort === 'price') filtered = filtered.sort((a, b) => b.price - a.price);
    if (sort === 'new')   filtered = filtered.sort((a, b) => b.id.localeCompare(a.id));

    const save = (form) => {
      if (form.id) { setDesigns(designs.map((d) => d.id === form.id ? { ...d, ...form } : d)); toast({ tone: 'success', title: 'デザインを更新しました' }); }
      else { setDesigns([{ id: 'd' + Date.now(), likes: 0, tags: [], ...form }, ...designs]); toast({ tone: 'success', title: 'デザインを追加しました' }); }
      setModalOpen(false);
    };
    const remove = (id) => { setDesigns(designs.filter((d) => d.id !== id)); setModalOpen(false); toast({ tone: 'error', title: '削除しました' }); };

    return (
      <div className="p-6 space-y-4 page-enter">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="デザイン名で検索..."
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100/60 transition-shadow" />
              <span className="absolute left-3 top-3 text-slate-400"><Icons.Search size={18} /></span>
            </div>
            <Select value={filter} onChange={setFilter} options={categories.map((c) => ({ value: c, label: c === 'all' ? 'カテゴリ' : c }))} />
            <Select value={season} onChange={setSeason} options={seasons.map((s) => ({ value: s, label: s === 'all' ? 'シーズン' : s }))} />
            <SegmentedTabs value={sort} onChange={setSort} options={[{ value: 'likes', label: '人気順' }, { value: 'price', label: '価格順' }, { value: 'new', label: '新着' }]} />
          </div>
          <Button icon={<Icons.Plus size={16} />} onClick={() => { setEditing(null); setModalOpen(true); }}>デザイン追加</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
          {filtered.map((d) => (
            <div key={d.id} className="design-card bg-white cursor-pointer" onClick={() => { setEditing(d); setModalOpen(true); }}>
              <div className="relative aspect-square overflow-hidden">
                <div className="design-thumb absolute inset-0" style={{ background: d.image }} />
                <div className="design-overlay" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 backdrop-blur text-slate-700">{t}</span>
                  ))}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur text-white text-[10px] font-semibold">
                  <Icons.Heart size={12} /> {d.likes}
                </div>
                <div className="design-hover-info">
                  <div className="text-xs opacity-80">{d.category}</div>
                  <div className="text-sm font-bold">{d.name}</div>
                  <div className="text-xs">¥{d.price.toLocaleString()}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800 text-sm truncate">{d.name}</div>
                  <span className="text-[10px] text-slate-500">{d.season}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="aurora-text font-bold text-sm">¥{d.price.toLocaleString()}</span>
                  <Badge tone="slate">{d.category}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-2">🔍</div>
            <div className="font-semibold text-slate-700">該当デザインがありません</div>
            <div className="text-sm text-slate-500 mt-1">条件を変更するか、新規追加してください</div>
          </Card>
        )}

        <DesignModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={save} onDelete={remove} />
      </div>
    );
  };

  const PALETTES = [
    'linear-gradient(135deg,#fde2e4,#fad2e1,#ffccd5)',
    'linear-gradient(135deg,#ffe4ec,#fb9fb8,#e94572)',
    'linear-gradient(135deg,#ffffff,#f8fafc,#e2e8f0)',
    'linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)',
    'linear-gradient(135deg,#ffffff,#fef3c7,#fde68a)',
    'linear-gradient(135deg,#67e8f9,#60a5fa,#818cf8)',
    'linear-gradient(135deg,#fde68a,#fcd34d,#d6bcfa)',
    'linear-gradient(135deg,#fca5a5,#f87171,#7f1d1d)'
  ];

  const DesignModal = ({ open, onClose, editing, onSave, onDelete }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => {
      if (open) setForm(editing ? { ...editing } : { name: '', category: 'ニュアンス', season: '通年', price: 8000, image: PALETTES[0], tags: [] });
    }, [open, editing]);
    if (!open) return null;
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? 'デザインを編集' : 'デザイン追加'} size="md"
        footer={
          <div className="flex justify-between items-center">
            {editing?.id ? <Button variant="danger" size="sm" icon={<Icons.Trash size={14} />} onClick={() => onDelete(editing.id)}>削除</Button> : <div/>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>キャンセル</Button>
              <Button onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>保存</Button>
            </div>
          </div>
        }>
        <div className="aspect-[16/9] rounded-2xl mb-4 relative overflow-hidden shadow-inner" style={{ background: form.image }}>
          <div className="absolute inset-0 flex items-end p-4">
            <div className="text-white drop-shadow">
              <div className="text-[11px] uppercase opacity-80">{form.category} · {form.season}</div>
              <div className="text-lg font-bold">{form.name || 'プレビュー'}</div>
              <div className="text-sm">¥{(form.price || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input  label="デザイン名" value={form.name}     onChange={(v) => update('name', v)} />
          <Select label="カテゴリ"   value={form.category} onChange={(v) => update('category', v)} options={['ニュアンス', 'アート', 'フレンチ', 'マグネット', 'ブライダル', 'ワンカラー']} />
          <Select label="シーズン"   value={form.season}   onChange={(v) => update('season', v)}   options={['春', '夏', '秋', '冬', '秋冬', '春夏', '通年']} />
          <Input  label="価格"       type="number" value={form.price} onChange={(v) => update('price', parseInt(v) || 0)} />
        </div>
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">パレット</div>
          <div className="grid grid-cols-8 gap-2">
            {PALETTES.map((p, i) => (
              <button key={i} onClick={() => update('image', p)}
                className={`aspect-square rounded-lg transition-all press ${form.image === p ? 'ring-4 ring-brand-400 ring-offset-2' : 'hover:ring-2 hover:ring-brand-200'}`}
                style={{ background: p }} />
            ))}
          </div>
        </div>
      </Modal>
    );
  };

  window.NUAE.Designs = Designs;
})();
