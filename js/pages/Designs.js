/* Nail design management */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Input, Select } = UI;

  const Designs = () => {
    const [designs, setDesigns] = React.useState(data.designs);
    const [filter, setFilter] = React.useState('all');
    const [season, setSeason] = React.useState('all');
    const [search, setSearch] = React.useState('');
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);

    const categories = ['all', ...new Set(designs.map((d) => d.category))];
    const seasons = ['all', '春', '夏', '秋', '冬', '秋冬', '春夏', '通年'];

    const filtered = designs.filter((d) => {
      if (filter !== 'all' && d.category !== filter) return false;
      if (season !== 'all' && d.season !== season) return false;
      if (search && !d.name.includes(search)) return false;
      return true;
    });

    const save = (form) => {
      if (form.id) setDesigns(designs.map((d) => d.id === form.id ? { ...d, ...form } : d));
      else setDesigns([...designs, { id: 'd' + Date.now(), likes: 0, tags: [], ...form }]);
      setModalOpen(false);
    };
    const remove = (id) => { setDesigns(designs.filter((d) => d.id !== id)); setModalOpen(false); };

    return (
      <div className="p-6 space-y-4 fade-in">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="デザイン名で検索..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-brand-400" />
              <span className="absolute left-2.5 top-2.5 text-slate-400"><Icons.Search size={18} /></span>
            </div>
            <Select value={filter}  onChange={setFilter}  options={categories.map((c) => ({ value: c, label: c === 'all' ? 'カテゴリ(全て)' : c }))} />
            <Select value={season}  onChange={setSeason}  options={seasons.map((s) => ({ value: s, label: s === 'all' ? 'シーズン(全て)' : s }))} />
          </div>
          <Button icon={<Icons.Plus size={16} />} onClick={() => { setEditing(null); setModalOpen(true); }}>デザイン追加</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="design-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer"
              onClick={() => { setEditing(d); setModalOpen(true); }}>
              <div className="aspect-square" style={{ background: d.image }}>
                <div className="h-full flex items-end p-3">
                  <div className="text-white text-xs font-semibold drop-shadow">{d.category}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-800 text-sm truncate">{d.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-brand-600 font-bold text-sm">¥{d.price.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Icons.Heart size={14} /> {d.likes}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge tone="slate">{d.season}</Badge>
                  {d.tags.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <DesignModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSave={save} onDelete={remove} />
      </div>
    );
  };

  const DesignModal = ({ open, onClose, editing, onSave, onDelete }) => {
    const [form, setForm] = React.useState({});
    React.useEffect(() => {
      if (open) setForm(editing ? { ...editing } : {
        name: '', category: 'ニュアンス', season: '通年', price: 8000,
        image: 'linear-gradient(135deg,#fde2e4,#fad2e1,#ffccd5)', tags: []
      });
    }, [open, editing]);
    if (!open) return null;
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
      <Modal open={open} onClose={onClose} title={editing?.id ? 'デザインを編集' : 'デザイン追加'}>
        <div className="aspect-video rounded-xl mb-4" style={{ background: form.image }}>
          <div className="h-full flex items-center justify-center text-white/80 text-sm">プレビュー</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input  label="デザイン名" value={form.name}     onChange={(v) => update('name', v)} />
          <Select label="カテゴリ"   value={form.category} onChange={(v) => update('category', v)} options={['ニュアンス', 'アート', 'フレンチ', 'マグネット', 'ブライダル', 'ワンカラー']} />
          <Select label="シーズン"   value={form.season}   onChange={(v) => update('season', v)}   options={['春', '夏', '秋', '冬', '秋冬', '春夏', '通年']} />
          <Input  label="価格"       type="number" value={form.price} onChange={(v) => update('price', parseInt(v) || 0)} />
        </div>
        <Input label="グラデーション(CSS linear-gradient)" value={form.image} onChange={(v) => update('image', v)} className="mt-4" />
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

  window.NUAE.Designs = Designs;
})();
