/* Main application - routing and shell */
(() => {
  const { Sidebar, Header, Dashboard, Reservations, Customers, Designs, Line, Shifts, Staff, Marketing, Integrations, Counseling } = window.NUAE;

  const App = () => {
    // Simple hash-based routing so deep-links work without a server.
    const initial = (location.hash || '#dashboard').replace('#', '');
    const [current, setCurrent] = React.useState(initial);
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
      const onHash = () => setCurrent((location.hash || '#dashboard').replace('#', ''));
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const navigate = (id) => {
      location.hash = '#' + id;
      setCurrent(id);
    };

    const pages = {
      dashboard:    <Dashboard    onNavigate={navigate} />,
      reservations: <Reservations onNavigate={navigate} />,
      customers:    <Customers    onNavigate={navigate} />,
      designs:      <Designs      onNavigate={navigate} />,
      counseling:   <Counseling   onNavigate={navigate} />,
      line:         <Line         onNavigate={navigate} />,
      shifts:       <Shifts       onNavigate={navigate} />,
      staff:        <Staff        onNavigate={navigate} />,
      marketing:    <Marketing    onNavigate={navigate} />,
      integrations: <Integrations onNavigate={navigate} />
    };

    return (
      <div className="flex min-h-screen">
        <Sidebar current={current} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 min-w-0">
          <Header current={current} onNavigate={navigate} />
          <main>{pages[current] || pages.dashboard}</main>
        </div>
      </div>
    );
  };

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
})();
