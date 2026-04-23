/* Sidebar navigation - cinematic */
window.NUAE = window.NUAE || {};

(() => {
  const { Icons } = window.NUAE;

  const NAV = [
    { id: 'dashboard',    label: 'ダッシュボード',   icon: <Icons.Dashboard /> },
    { id: 'reservations', label: '予約管理',         icon: <Icons.Calendar /> },
    { id: 'customers',    label: '顧客管理',         icon: <Icons.Users /> },
    { id: 'designs',      label: 'ネイルデザイン',   icon: <Icons.Palette /> },
    { id: 'counseling',   label: 'カウンセリング',   icon: <Icons.Clipboard /> },
    { id: 'line',         label: 'LINE連携',         icon: <Icons.Chat /> },
    { id: 'shifts',       label: 'シフト管理',       icon: <Icons.Clock /> },
    { id: 'staff',        label: 'スタッフページ',   icon: <Icons.Staff /> },
    { id: 'marketing',    label: '広告/分析',        icon: <Icons.Chart /> },
    { id: 'integrations', label: '予約サイト連携',   icon: <Icons.Plug /> }
  ];

  const Sidebar = ({ current, onNavigate, collapsed, onToggle }) => {
    return (
      <aside className={`${collapsed ? 'w-20' : 'w-64'} shrink-0 h-screen sticky top-0 glass border-r border-white/40 flex flex-col transition-[width] duration-300 ease-out z-30`}>
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl aurora-bg flex items-center justify-center text-white font-bold shadow-[0_8px_22px_-6px_rgba(233,69,114,.55)]">
              <span className="drop-shadow-sm">N</span>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white glow-pulse" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-bold text-slate-800 tracking-tight text-[15px]">Nuae Nail</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Salon OS</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 stagger-children">
          {NAV.map((n) => {
            const active = current === n.id;
            return (
              <button key={n.id} onClick={() => onNavigate(n.id)}
                className={`nav-item ${active ? 'is-active' : ''}
                  w-full group flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl text-sm
                  ${active ? 'bg-gradient-to-r from-brand-50 to-rose-50/40 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="nav-rail" />
                <span className={`nav-icon ${active ? 'text-brand-500' : 'text-slate-400 group-hover:text-brand-400'}`}>{n.icon}</span>
                {!collapsed && <span className="truncate">{n.label}</span>}
                {!collapsed && active && (
                  <span className="ml-auto text-brand-400 opacity-70">
                    <Icons.ChevronRight size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Upgrade / collapse */}
        <div className="p-3 border-t border-slate-100/70 space-y-2">
          {!collapsed && (
            <div className="relative p-3 rounded-2xl overflow-hidden text-white aurora-bg shadow-[0_10px_30px_-10px_rgba(233,69,114,.5)]">
              <div className="relative z-10">
                <div className="text-xs font-semibold">✨ Pro プラン</div>
                <div className="text-[10px] opacity-90 mt-0.5">AIコンシェルジュでさらに効率化</div>
                <button className="mt-2 w-full bg-white/25 hover:bg-white/40 backdrop-blur text-[11px] font-semibold py-1.5 rounded-lg press">
                  アップグレード
                </button>
              </div>
              <span className="pointer-events-none absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/20 blur-xl" />
            </div>
          )}
          <button onClick={onToggle} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-brand-600 py-2 rounded-lg hover:bg-slate-50 press">
            {collapsed ? <Icons.ChevronRight size={16} /> : <><Icons.ChevronLeft size={16} /> 折りたたむ</>}
          </button>
        </div>
      </aside>
    );
  };

  window.NUAE.Sidebar = Sidebar;
  window.NUAE.NAV = NAV;
})();
