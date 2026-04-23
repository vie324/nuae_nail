/* Dashboard overview - animated */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Stat, Badge, Button, Ring, useChart, useToast } = UI;

  const Dashboard = ({ onNavigate }) => {
    const revCanvas = React.useRef(null);
    const chCanvas  = React.useRef(null);
    const toast = useToast();

    const todayRes = data.reservations.filter((r) => r.date === data.today);
    const todayRevenue = todayRes.reduce((s, r) => s + r.price, 0);
    const weekRevenue = data.weeklyRevenue[data.weeklyRevenue.length - 1].revenue;

    useChart(revCanvas, {
      type: 'line',
      data: {
        labels: data.weeklyRevenue.map((w) => w.week),
        datasets: [{
          label: '売上',
          data: data.weeklyRevenue.map((w) => w.revenue),
          borderColor: '#b08c80',
          backgroundColor: (ctx) => {
            const c = ctx.chart?.ctx;
            if (!c) return 'rgba(176,140,128,0.22)';
            const g = c.createLinearGradient(0, 0, 0, 240);
            g.addColorStop(0, 'rgba(176,140,128,0.38)');
            g.addColorStop(1, 'rgba(176,140,128,0)');
            return g;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#b08c80',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#3f2d26', padding: 12, cornerRadius: 10 } },
        scales: {
          y: { grid: { color: 'rgba(176,140,128,.10)' }, ticks: { callback: (v) => '¥' + (v / 1000) + 'k' } },
          x: { grid: { display: false } }
        },
        animation: { duration: 1100, easing: 'easeOutCubic' }
      }
    }, []);

    useChart(chCanvas, {
      type: 'doughnut',
      data: {
        labels: data.channels,
        datasets: [{
          data: data.channels.map((c) => data.reservations.filter((r) => r.channel === c).length + Math.floor(Math.random() * 5) + 1),
          backgroundColor: ['#b08c80', '#b78a54', '#c39d8e', '#967060', '#d6b5a7', '#8b7468'],
          borderWidth: 0,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 14, usePointStyle: true, pointStyle: 'circle' } } },
        animation: { duration: 1200, animateRotate: true }
      }
    }, []);

    const lowSeatsStaff = data.staff.map((s) => ({
      ...s,
      todayCount: todayRes.filter((r) => r.staffId === s.id).length,
      capacity: 6
    }));

    return (
      <div className="p-6 space-y-6 page-enter">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl aurora-bg p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(176,140,128,.55)]">
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
            <div className="text-white">
              <div className="text-xs uppercase tracking-[0.25em] opacity-80">おかえりなさい</div>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 drop-shadow-sm">田中 美咲 さん ✨</h2>
              <p className="text-sm opacity-90 mt-2 max-w-xl">本日は <b>{todayRes.length}件</b> の予約があります。売上見込は <b>¥{todayRevenue.toLocaleString()}</b>。今日も素敵な1日を。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur" icon={<Icons.Plus size={16} />} onClick={() => onNavigate('reservations')}>
                新規予約
              </Button>
              <Button variant="secondary" className="bg-white text-brand-600 hover:bg-white hover:text-brand-700" icon={<Icons.Chat size={16} />} onClick={() => { onNavigate('line'); toast({ tone: 'success', title: 'LINE連携を開きました' }); }}>
                一斉配信
              </Button>
            </div>
          </div>
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/15 blur-3xl float" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute top-6 right-10 text-white/70 text-5xl float" style={{ animationDelay: '1s' }}>💅</div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          <Stat label="本日の予約"    numeric={todayRes.length}   suffix="件"   delta={12} icon={<Icons.Calendar />} tone="brand" />
          <Stat label="本日売上見込"  numeric={todayRevenue}      prefix="¥"    delta={8}  icon={<Icons.Money />}    tone="emerald" />
          <Stat label="今週売上"      numeric={weekRevenue}       prefix="¥"    delta={4}  icon={<Icons.Chart />}    tone="violet" />
          <Stat label="LINE友だち"    numeric={1248}              suffix="名"   delta={2}  icon={<Icons.Chat />}     tone="sky" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
          {/* Revenue chart */}
          <Card className="lg:col-span-2 p-5" title="週次売上推移" actions={<Badge tone="brand" dot live>直近12週</Badge>}>
            <div className="h-64"><canvas ref={revCanvas} /></div>
          </Card>

          {/* Channel distribution */}
          <Card className="p-5" title="予約チャネル" actions={<Badge tone="violet">割合</Badge>}>
            <div className="h-64 relative">
              <canvas ref={chCanvas} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
          {/* Today's reservations */}
          <Card className="lg:col-span-2" title="本日の予約タイムライン" actions={
            <Button size="sm" variant="secondary" iconRight={<Icons.ChevronRight size={14} />} onClick={() => onNavigate('reservations')}>全て見る</Button>
          }>
            <div className="divide-y divide-slate-100/70 stagger-children">
              {todayRes.length === 0 && <div className="p-8 text-center text-slate-400">本日の予約はありません</div>}
              {todayRes.sort((a, b) => a.start.localeCompare(b.start)).map((r, idx) => {
                const c = data.customers.find((c) => c.id === r.customerId);
                const s = data.staff.find((s) => s.id === r.staffId);
                const m = r.menuIds.map((id) => data.menus.find((x) => x.id === id)?.name).join('、');
                const d = r.designId ? data.designs.find((x) => x.id === r.designId) : null;
                return (
                  <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-brand-50/30 cursor-pointer transition-colors" onClick={() => onNavigate('reservations')}>
                    <div className="w-16 text-center shrink-0">
                      <div className="text-sm font-bold text-brand-600">{r.start}</div>
                      <div className="h-4 w-px bg-slate-200 mx-auto my-0.5" />
                      <div className="text-[10px] text-slate-400">{r.end}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl shrink-0 shadow-sm" style={{ background: d?.image || 'linear-gradient(135deg,#f3e7e2,#e8d2c8)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate flex items-center gap-2">
                        {c?.name}
                        {c?.tags?.includes('VIP') && <Badge tone="amber">VIP</Badge>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{m}{d && ` · ${d.name}`}</div>
                    </div>
                    <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: s?.color + '22' }}>{s?.avatar}</span>
                      <span>{s?.name?.split(' ')[0]}</span>
                    </div>
                    <Badge tone={r.channel === 'LINE' ? 'green' : r.channel === 'ホットペッパー' ? 'amber' : 'violet'} dot>{r.channel}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Staff today */}
          <Card title="本日の稼働" actions={<Badge tone="slate">{data.staff.length}名</Badge>}>
            <div className="p-4 space-y-3 stagger-children">
              {lowSeatsStaff.map((s) => {
                const pct = Math.round(s.todayCount / s.capacity * 100);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 press cursor-pointer" onClick={() => onNavigate('staff')}>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm" style={{ background: `linear-gradient(135deg, ${s.color}44, ${s.color}22)` }}>
                        {s.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: pct + '%', background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">{s.todayCount}</div>
                      <div className="text-[10px] text-slate-400">/{s.capacity}件</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Integration + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          <Card title="外部予約サイト" actions={<Button size="sm" variant="ghost" iconRight={<Icons.ChevronRight size={14} />} onClick={() => onNavigate('integrations')}>設定</Button>}>
            <div className="p-4 grid grid-cols-2 gap-3 stagger-children">
              {data.integrations.slice(0, 4).map((i) => (
                <div key={i.id} className="p-3 border border-slate-100 rounded-2xl flex items-center gap-3 hover-lift press cursor-pointer" onClick={() => onNavigate('integrations')}>
                  <div className="text-2xl">{i.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{i.name}</div>
                    <div className="text-[11px] text-slate-500">新着 <b className="text-brand-600">{i.newReservations}</b> / 未確定 {i.pending}</div>
                  </div>
                  <Badge tone={i.connected ? 'green' : 'slate'} dot live={i.connected}>{i.connected ? '接続' : '未接続'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="やることリスト" actions={<Badge tone="brand">4件</Badge>}>
            <div className="p-4 space-y-2 stagger-children">
              <TaskRow dot="rose"   text="伊藤さやか様のカウンセリング記録を更新" onAction={() => onNavigate('counseling')} />
              <TaskRow dot="amber"  text="ホットペッパーに未承認予約が1件あります" onAction={() => onNavigate('integrations')} />
              <TaskRow dot="violet" text="誕生日クーポン送信予定の顧客が14名います" onAction={() => onNavigate('line')} />
              <TaskRow dot="blue"   text="来月のシフト確定が未承認です"             onAction={() => onNavigate('shifts')} />
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const TaskRow = ({ dot, text, onAction }) => {
    const colors = { rose: 'bg-rose-400', amber: 'bg-amber-400', violet: 'bg-violet-400', blue: 'bg-sky-400' };
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 press">
        <span className={`relative w-2.5 h-2.5 rounded-full ${colors[dot]}`}>
          <span className={`absolute inset-0 rounded-full ${colors[dot]} animate-ping opacity-75`} />
        </span>
        <div className="text-sm flex-1">{text}</div>
        <button onClick={onAction} className="text-brand-500 text-xs font-semibold hover:underline">対応する →</button>
      </div>
    );
  };

  window.NUAE.Dashboard = Dashboard;
})();
