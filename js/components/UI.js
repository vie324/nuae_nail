/* Reusable UI primitives - kinetic & polished */
window.NUAE = window.NUAE || {};

(() => {
  const { Icons } = window.NUAE;

  /* ─── Hooks ─────────────────────────────────────────── */

  // count-up number animation
  const useCountUp = (target, duration = 900) => {
    const [value, setValue] = React.useState(0);
    React.useEffect(() => {
      let raf;
      const n = Number(target) || 0;
      const start = performance.now();
      const from = 0;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // cubic-out
        setValue(Math.round(from + (n - from) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return value;
  };

  // parallax card cursor-tracking gradient (for KPI cards)
  const useCursorGradient = () => {
    const ref = React.useRef(null);
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const move = (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--y', ((e.clientY - r.top)  / r.height * 100) + '%');
      };
      el.addEventListener('mousemove', move);
      return () => el.removeEventListener('mousemove', move);
    }, []);
    return ref;
  };

  // Toast system
  const ToastContext = React.createContext(null);
  const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = React.useState([]);
    const push = React.useCallback((t) => {
      const id = Math.random().toString(36).slice(2);
      const toast = { id, tone: 'info', duration: 3200, ...t };
      setToasts((p) => [...p, toast]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), toast.duration);
    }, []);
    return (
      <ToastContext.Provider value={push}>
        {children}
        <div className="toast-stack">
          {toasts.map((t) => <Toast key={t.id} {...t} />)}
        </div>
      </ToastContext.Provider>
    );
  };
  const useToast = () => React.useContext(ToastContext) || (() => {});

  const Toast = ({ title, description, tone = 'info' }) => {
    const tones = {
      info:    { bg: 'text-sky-500',     icon: <Icons.Bell size={18} /> },
      success: { bg: 'text-emerald-500', icon: <Icons.Check size={18} /> },
      warn:    { bg: 'text-amber-500',   icon: <Icons.Bell size={18} /> },
      error:   { bg: 'text-rose-500',    icon: <Icons.X size={18} /> }
    };
    const t = tones[tone] || tones.info;
    return (
      <div className="toast">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 ${t.bg}`}>{t.icon}</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
        </div>
      </div>
    );
  };

  /* ─── Card ──────────────────────────────────────────── */

  const Card = ({ children, className = '', title, actions, gradient = false, glass = false, interactive = false }) => {
    const base = glass ? 'glass' : 'bg-white';
    const ring = gradient ? 'gradient-border' : 'border border-slate-100';
    const hover = interactive ? 'hover-lift cursor-pointer' : '';
    return (
      <div className={`${base} ${ring} ${hover} rounded-2xl shadow-[var(--shadow-card)] ${className}`}>
        {(title || actions) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/70">
            {title && <h3 className="font-semibold text-slate-800 tracking-tight">{title}</h3>}
            {actions}
          </div>
        )}
        {children}
      </div>
    );
  };

  /* ─── Stat / KPI ────────────────────────────────────── */

  const Stat = ({ label, value, delta, icon, numeric, prefix = '', suffix = '', tone = 'brand' }) => {
    const ref = useCursorGradient();
    const up = typeof delta === 'number' ? delta >= 0 : null;
    const count = useCountUp(typeof numeric === 'number' ? numeric : 0);
    const display = typeof numeric === 'number' ? `${prefix}${count.toLocaleString()}${suffix}` : value;

    const toneMap = {
      brand:   'from-brand-50 to-brand-100 text-brand-600',
      violet:  'from-violet-50 to-fuchsia-50 text-violet-500',
      sky:     'from-sky-50 to-cyan-50 text-sky-500',
      amber:   'from-amber-50 to-orange-50 text-amber-600',
      emerald: 'from-emerald-50 to-teal-50 text-emerald-500',
      gold:    'from-amber-50 to-yellow-50 text-amber-700'
    };

    return (
      <div ref={ref} className="kpi-card card-base p-5 hover-lift press">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
            <div className="mt-1 text-[26px] font-bold text-slate-900 leading-tight">{display}</div>
            {up !== null && (
              <div className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <span>{up ? '▲' : '▼'}</span>
                <span>{Math.abs(delta)}%</span>
                <span className="text-slate-400 font-normal ml-1">前週比</span>
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${toneMap[tone] || toneMap.brand} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Badge ─────────────────────────────────────────── */

  const Badge = ({ children, tone = 'slate', dot = false, live = false }) => {
    const tones = {
      slate:   'bg-slate-100 text-slate-700',
      brand:   'bg-brand-100 text-brand-700',
      green:   'bg-emerald-100 text-emerald-700',
      amber:   'bg-amber-100 text-amber-700',
      rose:    'bg-rose-100 text-rose-700',
      blue:    'bg-sky-100 text-sky-700',
      violet:  'bg-violet-100 text-violet-700'
    };
    const dotColor = {
      slate: '#94a3b8', brand: '#b08c80', green: '#10b981',
      amber: '#b78a54', rose: '#c39d8e', blue: '#0ea5e9', violet: '#8b5cf6'
    }[tone] || '#94a3b8';
    return (
      <span className={`pill ${tones[tone] || tones.slate}`}>
        {dot && <span className={`pill-dot ${live ? 'live' : ''}`} style={{ background: dotColor }} />}
        {children}
      </span>
    );
  };

  /* ─── Button (ripple + shine) ───────────────────────── */

  const Button = ({ children, onClick, variant = 'primary', size = 'md', icon, iconRight, className = '', type = 'button', disabled = false }) => {
    const btnRef = React.useRef(null);
    const makeRipple = (e) => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const span = document.createElement('span');
      span.className = 'ripple-inner';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top  = (e.clientY - r.top  - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 600);
      onClick && onClick(e);
    };
    const base = 'ripple press inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-5 py-2.5' };
    const variants = {
      primary:   'btn-primary-shine text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-[0_6px_18px_-6px_rgba(176,140,128,.6)]',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50 shadow-sm',
      ghost:     'text-slate-600 hover:bg-brand-50 hover:text-brand-700',
      danger:    'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-[0_6px_18px_-6px_rgba(244,63,94,.55)]',
      subtle:    'bg-brand-50 text-brand-700 hover:bg-brand-100'
    };
    return (
      <button ref={btnRef} type={type} onClick={makeRipple} disabled={disabled}
              className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
        {icon} {children} {iconRight}
      </button>
    );
  };

  /* ─── Modal ─────────────────────────────────────────── */

  const Modal = ({ open, onClose, title, children, size = 'md', footer, subtitle }) => {
    if (!open) return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
        <div className={`modal-panel w-full ${sizes[size]} bg-white rounded-[22px] overflow-hidden`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-base tracking-tight">{title}</h3>
              {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center press">
              <Icons.X size={18} />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
          {footer && <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100">{footer}</div>}
        </div>
      </div>
    );
  };

  /* ─── Inputs ────────────────────────────────────────── */

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none';

  const Input = ({ label, value, onChange, type = 'text', placeholder, className = '', icon }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input type={type} value={value || ''} placeholder={placeholder}
               onChange={(e) => onChange && onChange(e.target.value)}
               className={`${inputCls} ${icon ? 'pl-9' : ''}`} />
      </div>
    </label>
  );

  const Select = ({ label, value, onChange, options, className = '' }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>}
      <div className="relative">
        <select value={value || ''} onChange={(e) => onChange && onChange(e.target.value)}
                className={`${inputCls} appearance-none pr-9 bg-white`}>
          {options.map((o) => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icons.ChevronDown size={16} />
        </span>
      </div>
    </label>
  );

  const Textarea = ({ label, value, onChange, rows = 3, placeholder, className = '' }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>}
      <textarea rows={rows} value={value || ''} placeholder={placeholder}
                onChange={(e) => onChange && onChange(e.target.value)}
                className={inputCls} />
    </label>
  );

  const Toggle = ({ checked, onChange, label }) => (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <span className="toggle">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </span>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );

  /* ─── SegmentedTabs ─────────────────────────────────── */

  const SegmentedTabs = ({ value, onChange, options, className = '' }) => {
    const wrapRef = React.useRef(null);
    const [rect, setRect] = React.useState(null);
    React.useEffect(() => {
      if (!wrapRef.current) return;
      const btn = wrapRef.current.querySelector(`[data-val="${value}"]`);
      if (btn) {
        const w = wrapRef.current.getBoundingClientRect();
        const b = btn.getBoundingClientRect();
        setRect({ x: b.left - w.left, w: b.width });
      }
    }, [value, options.length]);
    return (
      <div ref={wrapRef} className={`relative inline-flex p-1 rounded-xl bg-slate-100 ${className}`}>
        {rect && (
          <span className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                style={{ left: rect.x, width: rect.w }} />
        )}
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <button key={v} data-val={v} onClick={() => onChange(v)}
                    className={`relative z-10 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${value === v ? 'text-brand-600' : 'text-slate-600 hover:text-slate-800'}`}>
              {l}
            </button>
          );
        })}
      </div>
    );
  };

  /* ─── Progress Ring ─────────────────────────────────── */

  const Ring = ({ value, size = 64, stroke = 6, color = '#b08c80', label }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, value / 100)));
    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
                  style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-800">{value}%</div>
          {label && <div className="text-[9px] text-slate-500 uppercase">{label}</div>}
        </div>
      </div>
    );
  };

  /* ─── Empty state & chart helper ────────────────────── */

  const EmptyState = ({ title, description, icon, action }) => (
    <div className="text-center py-14 px-6">
      <div className="relative inline-flex w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200" />
        <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-brand-500">{icon}</div>
      </div>
      <div className="font-semibold text-slate-800">{title}</div>
      {description && <div className="text-sm text-slate-500 mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  const useChart = (canvasRef, config, deps = []) => {
    React.useEffect(() => {
      if (!canvasRef.current || !window.Chart) return;
      const ctx = canvasRef.current.getContext('2d');
      // Pretty defaults
      window.Chart.defaults.font.family = 'Hiragino Kaku Gothic ProN, Noto Sans JP, sans-serif';
      window.Chart.defaults.color = '#64748b';
      window.Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.15)';
      const chart = new window.Chart(ctx, config);
      return () => chart.destroy();
    }, deps);
  };

  window.NUAE.UI = {
    Card, Stat, Badge, Button, Modal, Input, Select, Textarea, Toggle,
    SegmentedTabs, Ring, EmptyState, useChart,
    ToastProvider, useToast, useCountUp
  };
})();
