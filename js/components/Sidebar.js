/* Sidebar navigation */
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
      <aside className={`${collapsed ? 'w-20' : 'w-64'} shrink-0 h-screen sticky top-0 bg-white/80 backdrop-blur border-r border-slate-100 flex flex-col transition-all`}>
        <div className="px-5 py-5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">N</div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-bold text-slate-800">Nuae Nail</div>
              <div className="text-[11px] text-slate-500">Salon Dashboard</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          {NAV.map((n) => {
            const active = current === n.id;
            return (
              <button key={n.id} onClick={() => onNavigate(n.id)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl text-sm transition
                  ${active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className={active ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'}>{n.icon}</span>
                {!collapsed && <span>{n.label}</span>}
                {!collapsed && active && <span className="ml-auto"><Icons.ChevronRight size={16} /></span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={onToggle} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-700 py-2 rounded-lg hover:bg-slate-50">
            {collapsed ? <Icons.ChevronRight size={16} /> : <><Icons.ChevronLeft size={16} /> 折りたたむ</>}
          </button>
        </div>
      </aside>
    );
  };

  window.NUAE.Sidebar = Sidebar;
  window.NUAE.NAV = NAV;
})();
