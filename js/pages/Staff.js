/* Staff-only page (separate URL preview) */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Input, Toggle, Modal } = UI;

  const Staff = () => {
    const [selectedStaff, setSelectedStaff] = React.useState(data.staff[0]);
    const [showUrlModal, setShowUrlModal] = React.useState(false);

    const token = `${selectedStaff.id}-xokvh-${btoa(selectedStaff.name).slice(0, 6)}`;
    const staffUrl = `https://nuae-nail.jp/staff/${token}`;

    const myRes = data.reservations.filter((r) => r.staffId === selectedStaff.id);
    const myShifts = data.shifts.filter((s) => s.staffId === selectedStaff.id);
    const todayRes = myRes.filter((r) => r.date === data.today);

    return (
      <div className="p-6 space-y-4 fade-in">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <Icons.Link size={18} className="text-brand-500" />
                <h2 className="text-lg font-bold">スタッフ専用ページ</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">各スタッフに固有URLを発行。本人の予約・シフト・顧客カルテのみが閲覧できます。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Copy size={16} />} onClick={() => setShowUrlModal(true)}>URLを確認</Button>
              <Button icon={<Icons.Plus size={16} />}>スタッフを追加</Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.staff.map((s) => (
              <button key={s.id} onClick={() => setSelectedStaff(s)}
                className={`p-3 rounded-xl border text-left transition ${selectedStaff.id === s.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{s.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{s.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Preview of staff-only page */}
        <Card className="overflow-hidden border-2 border-dashed border-brand-200">
          <div className="bg-gradient-to-r from-brand-400 to-brand-600 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Icons.Link size={14} />
              <code className="font-mono">{staffUrl}</code>
            </div>
            <Badge tone="slate">🔒 認証 · 本人のみ閲覧可</Badge>
          </div>

          <div className="p-6 bg-slate-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{selectedStaff.avatar}</div>
              <div>
                <div className="text-lg font-bold">{selectedStaff.name} さんのマイページ</div>
                <div className="text-xs text-slate-500">{selectedStaff.role} · {selectedStaff.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <MiniStat label="本日の予約"   value={`${todayRes.length}件`} icon={<Icons.Calendar />} />
              <MiniStat label="今月売上"     value={`¥${(myRes.reduce((s, r) => s + r.price, 0) / 1000).toFixed(0)}k`} icon={<Icons.Money />} />
              <MiniStat label="来月シフト"   value={`${myShifts.filter((s) => s.type === 'work').length}日`} icon={<Icons.Clock />} />
              <MiniStat label="担当顧客"     value={`${new Set(myRes.map((r) => r.customerId)).size}名`} icon={<Icons.Users />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="📅 本日の予約">
                <div className="divide-y divide-slate-100">
                  {todayRes.length === 0 && <div className="p-4 text-center text-xs text-slate-400">本日の予約はありません</div>}
                  {todayRes.sort((a, b) => a.start.localeCompare(b.start)).map((r) => {
                    const c = data.customers.find((x) => x.id === r.customerId);
                    const m = r.menuIds.map((id) => data.menus.find((mm) => mm.id === id)?.name).join('、');
                    return (
                      <div key={r.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{r.start} - {r.end} · {c?.name}</div>
                          <Badge tone="brand">{r.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{m}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="🗓 シフト希望を提出">
                <div className="p-4 space-y-3">
                  <div className="text-xs text-slate-500">来月の希望を入力できます。確定前ならスタッフ側で修正が可能です。</div>
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                    {['日', '月', '火', '水', '木', '金', '土'].map((d) => <div key={d} className="text-slate-400 py-1">{d}</div>)}
                    {Array.from({ length: 30 }, (_, i) => (
                      <button key={i} className="aspect-square rounded-md bg-slate-100 hover:bg-brand-100 text-slate-600 text-[10px]">
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" className="w-full">希望を送信</Button>
                </div>
              </Card>

              <Card title="👥 担当顧客一覧">
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {[...new Set(myRes.map((r) => r.customerId))].map((cid) => {
                    const c = data.customers.find((x) => x.id === cid);
                    if (!c) return null;
                    return (
                      <div key={cid} className="p-2 flex items-center gap-2 hover:bg-slate-50">
                        <div className="text-sm font-medium flex-1">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.visits}回</div>
                        {c.tags.includes('VIP') && <Badge tone="amber">VIP</Badge>}
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="💬 お知らせ">
                <div className="p-4 space-y-2 text-sm">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-xs">
                    📢 5月のシフト希望を4/25までに提出してください
                  </div>
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-800 text-xs">
                    💡 新メニュー「フラワーアート」研修が来週開催です
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                    🎉 今月MVP: {selectedStaff.name}さん おめでとうございます！
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <Modal open={showUrlModal} onClose={() => setShowUrlModal(false)} title="スタッフ専用URL" size="sm">
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{selectedStaff.name} さんの専用ログインURL</div>
            <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs break-all">{staffUrl}</div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Copy size={14} />} className="flex-1" onClick={() => navigator.clipboard?.writeText(staffUrl)}>URLをコピー</Button>
              <Button icon={<Icons.Chat size={14} />} className="flex-1">LINEで送信</Button>
            </div>
            <div className="text-xs text-slate-500">💡 URLは 30日で失効し、自動で再発行されます。</div>
          </div>
        </Modal>
      </div>
    );
  };

  const MiniStat = ({ label, value, icon }) => (
    <div className="p-3 rounded-xl bg-white border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-brand-500">{icon}</div>
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );

  window.NUAE.Staff = Staff;
})();
