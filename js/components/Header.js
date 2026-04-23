/* Top header bar */
window.NUAE = window.NUAE || {};

(() => {
  const { Icons, NAV } = window.NUAE;

  const Header = ({ current, onNavigate }) => {
    const label = (NAV.find((n) => n.id === current) || {}).label || '';
    return (
      <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400">Nuae Nail</div>
          <h1 className="text-lg font-bold text-slate-800">{label}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <input placeholder="顧客名・予約・デザインを検索..." className="pl-9 pr-3 py-2 w-80 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            <span className="absolute left-2.5 top-2.5 text-slate-400"><Icons.Search size={18} /></span>
          </div>
          <button className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <Icons.Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-semibold">M</div>
            <div className="text-sm hidden md:block">
              <div className="font-semibold leading-tight">田中 美咲</div>
              <div className="text-slate-500 text-xs">オーナー</div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  window.NUAE.Header = Header;
})();
