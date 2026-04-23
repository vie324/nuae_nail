/* Dashboard overview */
window.NUAE = window.NUAE || {};

(() => {
  const { UI, Icons, data } = window.NUAE;
  const { Card, Stat, Badge, Button, useChart } = UI;

  const Dashboard = ({ onNavigate }) => {
    const revCanvas = React.useRef(null);
    const chCanvas = React.useRef(null);

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
          borderColor: '#e94572',
          backgroundColor: 'rgba(233, 69, 114, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => '¥' + (v / 1000) + 'k' } } }
      }
    }, []);

    useChart(chCanvas, {
      type: 'doughnut',
      data: {
        labels: data.channels,
        datasets: [{
          data: data.channels.map((c) => data.reservations.filter((r) => r.channel === c).length + Math.floor(Math.random() * 5) + 1),
          backgroundColor: ['#e94572', '#f59e0b', '#8b5cf6', '#14b8a6', '#64748b', '#38bdf8']
        }]
      },
      options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    }, []);

    const lowSeatsStaff = data.staff.map((s) => ({
      ...s,
      todayCount: todayRes.filter((r) => r.staffId === s.id).length
    }));

    return (
      <div className="p-6 space-y-6 fade-in">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="本日の予約"       value={`${todayRes.length}件`}           delta={12}  icon={<Icons.Calendar />} />
          <Stat label="本日売上見込"     value={`¥${todayRevenue.toLocaleString()}`} delta={8}  icon={<Icons.Money />}   />
          <Stat label="今週売上"         value={`¥${weekRevenue.toLocaleString()}`} delta={4}  icon={<Icons.Chart />}   />
          <Stat label="LINE友だち"       value="1,248名"                            delta={2}  icon={<Icons.Chat />}    />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <Card className="lg:col-span-2 p-5" title="週次売上推移" actions={<Badge tone="brand">直近12週</Badge>}>
            <div className="h-64"><canvas ref={revCanvas} /></div>
          </Card>

          {/* Channel distribution */}
          <Card className="p-5" title="予約チャネル">
            <div className="h-64"><canvas ref={chCanvas} /></div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's reservations */}
          <Card className="lg:col-span-2" title="本日の予約" actions={
            <Button size="sm" variant="secondary" onClick={() => onNavigate('reservations')}>全て見る →</Button>
          }>
            <div className="divide-y divide-slate-100">
              {todayRes.length === 0 && <div className="p-6 text-center text-slate-400">本日の予約はありません</div>}
              {todayRes.sort((a, b) => a.start.localeCompare(b.start)).map((r) => {
                const c = data.customers.find((c) => c.id === r.customerId);
                const s = data.staff.find((s) => s.id === r.staffId);
                const m = r.menuIds.map((id) => data.menus.find((x) => x.id === id)?.name).join('、');
                return (
                  <div key={r.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50">
                    <div className="w-16 text-center">
                      <div className="text-sm font-bold text-brand-600">{r.start}</div>
                      <div className="text-[11px] text-slate-400">〜 {r.end}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800">{c?.name}</div>
                      <div className="text-xs text-slate-500 truncate">{m}</div>
                    </div>
                    <div className="text-xs text-slate-500 hidden md:block">{s?.avatar} {s?.name}</div>
                    <Badge tone={r.channel === 'LINE' ? 'green' : r.channel === 'ホットペッパー' ? 'amber' : 'violet'}>{r.channel}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Staff today */}
          <Card title="本日の稼働">
            <div className="p-3">
              {lowSeatsStaff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: s.color + '22' }}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.role}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{s.todayCount}件</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Integration + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="外部予約サイト" actions={<Button size="sm" variant="ghost" onClick={() => onNavigate('integrations')}>設定 →</Button>}>
            <div className="p-4 grid grid-cols-2 gap-3">
              {data.integrations.slice(0, 4).map((i) => (
                <div key={i.id} className="p-3 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="text-2xl">{i.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{i.name}</div>
                    <div className="text-[11px] text-slate-500">新着 {i.newReservations}件 / 未確定 {i.pending}件</div>
                  </div>
                  <Badge tone={i.connected ? 'green' : 'slate'}>{i.connected ? '接続' : '未接続'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card title="やることリスト">
            <div className="p-4 space-y-2">
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
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
        <span className={`w-2 h-2 rounded-full ${colors[dot]}`} />
        <div className="text-sm flex-1">{text}</div>
        <button onClick={onAction} className="text-brand-500 text-xs font-semibold hover:underline">対応する</button>
      </div>
    );
  };

  window.NUAE.Dashboard = Dashboard;
})();
