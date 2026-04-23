/* Reusable UI primitives */
window.NUAE = window.NUAE || {};

(() => {
  const { Icons } = window.NUAE;

  const Card = ({ children, className = '', title, actions }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );

  const Stat = ({ label, value, delta, icon }) => {
    const up = typeof delta === 'number' ? delta >= 0 : null;
    return (
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
            {up !== null && (
              <div className={`mt-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {up ? '▲' : '▼'} {Math.abs(delta)}%  <span className="text-slate-400">前週比</span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-50 text-brand-500">
            {icon}
          </div>
        </div>
      </Card>
    );
  };

  const Badge = ({ children, tone = 'slate' }) => {
    const tones = {
      slate:   'bg-slate-100 text-slate-700',
      brand:   'bg-brand-100 text-brand-700',
      green:   'bg-emerald-100 text-emerald-700',
      amber:   'bg-amber-100 text-amber-700',
      rose:    'bg-rose-100 text-rose-700',
      blue:    'bg-sky-100 text-sky-700',
      violet:  'bg-violet-100 text-violet-700'
    };
    return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tones[tone] || tones.slate}`}>{children}</span>;
  };

  const Button = ({ children, onClick, variant = 'primary', size = 'md', icon, className = '', type = 'button' }) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition';
    const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-5 py-2.5' };
    const variants = {
      primary:    'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
      secondary:  'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
      ghost:      'text-slate-600 hover:bg-slate-100',
      danger:     'bg-rose-500 text-white hover:bg-rose-600'
    };
    return (
      <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
        {icon} {children}
      </button>
    );
  };

  const Modal = ({ open, onClose, title, children, size = 'md' }) => {
    if (!open) return null;
    const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
        <div className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-xl overflow-hidden fade-in`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
          </div>
          <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  };

  const Input = ({ label, value, onChange, type = 'text', placeholder, className = '' }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-xs text-slate-500 mb-1">{label}</div>}
      <input type={type} value={value || ''} placeholder={placeholder}
             onChange={(e) => onChange && onChange(e.target.value)}
             className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
    </label>
  );

  const Select = ({ label, value, onChange, options, className = '' }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-xs text-slate-500 mb-1">{label}</div>}
      <select value={value || ''} onChange={(e) => onChange && onChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm bg-white">
        {options.map((o) => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </label>
  );

  const Textarea = ({ label, value, onChange, rows = 3, placeholder, className = '' }) => (
    <label className={`block ${className}`}>
      {label && <div className="text-xs text-slate-500 mb-1">{label}</div>}
      <textarea rows={rows} value={value || ''} placeholder={placeholder}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm" />
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

  const EmptyState = ({ title, description, icon }) => (
    <div className="text-center py-12 text-slate-500">
      <div className="inline-flex w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-3">{icon}</div>
      <div className="font-medium text-slate-700">{title}</div>
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  );

  // Chart helper - renders a Chart.js chart into a canvas
  const useChart = (canvasRef, config, deps = []) => {
    React.useEffect(() => {
      if (!canvasRef.current || !window.Chart) return;
      const chart = new window.Chart(canvasRef.current, config);
      return () => chart.destroy();
    }, deps);
  };

  window.NUAE.UI = { Card, Stat, Badge, Button, Modal, Input, Select, Textarea, Toggle, EmptyState, useChart };
})();
