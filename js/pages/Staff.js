/* Staff-only page preview - cinematic */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Badge, Button, Modal, Ring, useToast } = UI;

  const Staff = () => {
    const [selectedStaff, setSelectedStaff] = React.useState(data.staff[0]);
    const [showUrlModal, setShowUrlModal] = React.useState(false);
    const toast = useToast();

    const token = `${selectedStaff.id}-xokvh-${btoa(encodeURIComponent(selectedStaff.name)).slice(0, 6)}`;
    const staffUrl = `https://nuae-nail.jp/staff/${token}`;

    const myRes = data.reservations.filter((r) => r.staffId === selectedStaff.id);
    const myShifts = data.shifts.filter((s) => s.staffId === selectedStaff.id);
    const todayRes = myRes.filter((r) => r.date === data.today);
    const monthRevenue = myRes.reduce((s, r) => s + r.price, 0);
    const completion = Math.round(myRes.filter((r) => r.status === '完了').length / Math.max(myRes.length, 1) * 100);

    return (
      <div className="p-6 space-y-4 page-enter">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icons.Link size={18} className="text-brand-500" />
                <h2 className="text-lg font-bold">スタッフ専用ページ</h2>
              </div>
              <p className="text-sm text-slate-500">各スタッフに固有URLを発行。本人の予約・シフト・顧客カルテのみが閲覧できます。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Copy size={16} />} onClick={() => setShowUrlModal(true)}>URLを確認</Button>
              <Button icon={<Icons.Plus size={16} />}>スタッフを追加</Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            {data.staff.map((s) => (
              <button key={s.id} onClick={() => setSelectedStaff(s)}
                className={`p-3 rounded-2xl text-left transition-all press hover-lift ${selectedStaff.id === s.id ? 'bg-gradient-to-br from-brand-50 to-rose-50 ring-2 ring-brand-300' : 'bg-white border border-slate-200 hover:border-brand-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{ background: `linear-gradient(135deg, ${s.color}44, ${s.color}22)` }}>{s.avatar}</div>
                    {selectedStaff.id === s.id && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{s.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden" gradient>
          <div className="relative aurora-bg text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Icons.Link size={14} />
              <code className="font-mono opacity-90">{staffUrl}</code>
            </div>
            <Badge tone="slate" dot live>🔒 認証 · 本人のみ閲覧可</Badge>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-50 to-brand-50/30">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-[0_12px_30px_-10px_rgba(233,69,114,.4)]" style={{ background: `linear-gradient(135deg, ${selectedStaff.color}55, ${selectedStaff.color}22)` }}>{selectedStaff.avatar}</div>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-brand-600 shadow-sm">MVP</span>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold">{selectedStaff.name} さんのマイページ</div>
                <div className="text-xs text-slate-500">{selectedStaff.role} · {selectedStaff.email}</div>
                <div className="flex gap-1 mt-1">
                  {selectedStaff.specialty.map((sp) => <Badge key={sp} tone="brand">{sp}</Badge>)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger-children">
              <MiniStat label="本日の予約"  value={`${todayRes.length}件`} icon={<Icons.Calendar />} />
              <MiniStat label="今月売上"    value={`¥${(monthRevenue / 1000).toFixed(0)}k`} icon={<Icons.Money />} />
              <MiniStat label="来月シフト"  value={`${myShifts.filter((s) => s.type === 'work').length}日`} icon={<Icons.Clock />} />
              <MiniStat label="担当顧客"    value={`${new Set(myRes.map((r) => r.customerId)).size}名`} icon={<Icons.Users />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
              <Card title="📅 本日の予約">
                <div className="divide-y divide-slate-100/70">
                  {todayRes.length === 0 && <div className="p-6 text-center text-xs text-slate-400">本日の予約はありません</div>}
                  {todayRes.sort((a, b) => a.start.localeCompare(b.start)).map((r) => {
                    const c = data.customers.find((x) => x.id === r.customerId);
                    const m = r.menuIds.map((id) => data.menus.find((mm) => mm.id === id)?.name).join('、');
                    return (
                      <div key={r.id} className="p-3 hover:bg-brand-50/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{r.start} - {r.end} · {c?.name}</div>
                          <Badge tone="brand" dot>{r.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{m}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="🗓 シフト希望を提出">
                <div className="p-4 space-y-3">
                  <div className="text-xs text-slate-500">来月の希望を入力できます。</div>
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                    {['日', '月', '火', '水', '木', '金', '土'].map((d) => <div key={d} className="text-slate-400 py-1 font-semibold">{d}</div>)}
                    {Array.from({ length: 30 }, (_, i) => (
                      <button key={i} className={`aspect-square rounded-lg text-slate-600 text-[10px] font-medium press transition-all ${(i % 7 === 0) ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 hover:bg-brand-100 hover:text-brand-700'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" className="w-full" onClick={() => toast({ tone: 'success', title: 'シフト希望を送信しました' })}>希望を送信</Button>
                </div>
              </Card>

              <Card title="📈 パフォーマンス">
                <div className="p-4 flex items-center gap-6">
                  <Ring value={completion} size={96} stroke={8} color={selectedStaff.color} label="完了率" />
                  <div className="flex-1 space-y-2">
                    <PerfRow label="リピート率"    value={78} color="#10b981" />
                    <PerfRow label="カウンセリング" value={64} color="#8b5cf6" />
                    <PerfRow label="顧客満足度"    value={92} color="#e94572" />
                  </div>
                </div>
              </Card>

              <Card title="💬 お知らせ">
                <div className="p-4 space-y-2 text-sm">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-start gap-2"><span>📢</span><div><b>5月のシフト希望</b>を4/25までに提出してください</div></div>
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-800 text-xs flex items-start gap-2"><span>💡</span><div>新メニュー「フラワーアート」研修が来週開催です</div></div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-start gap-2"><span>🎉</span><div>今月MVP: <b>{selectedStaff.name}</b>さん おめでとうございます！</div></div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <Modal open={showUrlModal} onClose={() => setShowUrlModal(false)} title="スタッフ専用URL" size="sm"
          footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowUrlModal(false)}>閉じる</Button></div>}>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{selectedStaff.name} さんの専用ログインURL</div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30 font-mono text-xs break-all border border-slate-100">{staffUrl}</div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Icons.Copy size={14} />} className="flex-1" onClick={() => { navigator.clipboard?.writeText(staffUrl); toast({ tone: 'success', title: 'URLをコピーしました' }); }}>URLをコピー</Button>
              <Button icon={<Icons.Chat size={14} />} className="flex-1" onClick={() => toast({ tone: 'success', title: 'LINEで送信しました' })}>LINEで送信</Button>
            </div>
            <div className="text-xs text-slate-500">💡 URLは 30日で失効し、自動で再発行されます。</div>
          </div>
        </Modal>
      </div>
    );
  };

  const MiniStat = ({ label, value, icon }) => (
    <div className="p-3 rounded-2xl bg-white border border-slate-100 hover-lift">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-brand-500">{icon}</div>
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );

  const PerfRow = ({ label, value, color }) => (
    <div>
      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-0.5">
        <span>{label}</span><span className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: value + '%', background: color }} />
      </div>
    </div>
  );

  window.NUAE.Staff = Staff;
})();
