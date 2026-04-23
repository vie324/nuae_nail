/* Main application - routing, shell, global providers */
(() => {
  const { Sidebar, Header, Dashboard, Reservations, Customers, Designs, Line, Shifts, Staff, Marketing, Integrations, Counseling, UI } = window.NUAE;
  const { ToastProvider } = UI;

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

    // Component map — each render gets a new key so page-transition
    // animations re-trigger on navigation.
    const pages = {
      dashboard:    Dashboard,
      reservations: Reservations,
      customers:    Customers,
      designs:      Designs,
      counseling:   Counseling,
      line:         Line,
      shifts:       Shifts,
      staff:        Staff,
      marketing:    Marketing,
      integrations: Integrations
    };
    const Page = pages[current] || pages.dashboard;

    return (
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar current={current} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          <div className="flex-1 min-w-0">
            <Header current={current} onNavigate={navigate} />
            <main key={current}>
              <Page onNavigate={navigate} />
            </main>
          </div>
        </div>
      </ToastProvider>
    );
  };

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
})();
