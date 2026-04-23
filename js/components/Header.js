/* Top header bar - glass & animated */
window.NUAE = window.NUAE || {};

(() => {
  const { Icons, NAV } = window.NUAE;

  const Header = ({ current, onNavigate }) => {
    const label = (NAV.find((n) => n.id === current) || {}).label || '';
    const [focus, setFocus] = React.useState(false);
    const [time, setTime] = React.useState(new Date());
    React.useEffect(() => {
      const id = setInterval(() => setTime(new Date()), 30000);
      return () => clearInterval(id);
    }, []);
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');

    return (
      <header className="h-16 glass border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4 fade-in-down">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Nuae Nail</div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{label}</h1>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/60 text-xs text-slate-500">
            <span className="text-emerald-500 typing"><span/><span/><span/></span>
            <span>営業中 · {hh}:{mm}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`relative hidden md:block transition-all ${focus ? 'w-[380px]' : 'w-72'}`}>
            <input
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              placeholder="顧客名・予約・デザインを検索..."
              className="pl-10 pr-12 py-2.5 w-full rounded-2xl bg-white/70 border border-white/60 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100/60 transition-shadow" />
            <span className="absolute left-3 top-2.5 text-slate-400"><Icons.Search size={18} /></span>
            <kbd className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">⌘K</kbd>
          </div>

          <button className="bell relative w-10 h-10 rounded-2xl bg-white/70 border border-white/60 flex items-center justify-center text-slate-600 hover:text-brand-600 press">
            <Icons.Bell size={18} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full glow-pulse ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/60">
            <div className="relative">
              <div className="w-9 h-9 rounded-full aurora-bg text-white flex items-center justify-center font-semibold shadow-[0_6px_16px_-6px_rgba(176,140,128,.55)]">M</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div className="text-sm hidden md:block leading-tight">
              <div className="font-semibold text-slate-800">田中 美咲</div>
              <div className="text-slate-500 text-[11px]">オーナー</div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  window.NUAE.Header = Header;
})();
