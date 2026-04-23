/* Lightweight SVG icon set */
window.NUAE = window.NUAE || {};

(() => {
  const Icon = ({ path, size = 20, className = '', strokeWidth = 1.8 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      {path}
    </svg>
  );

  const Icons = {
    Dashboard:    (p) => <Icon {...p} path={<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>} />,
    Calendar:     (p) => <Icon {...p} path={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>} />,
    Users:        (p) => <Icon {...p} path={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
    Palette:      (p) => <Icon {...p} path={<><path d="M12 3a9 9 0 1 0 9 9c0-1.66-1.34-3-3-3h-2a2 2 0 1 1 0-4 3 3 0 0 0 0-6 9 9 0 0 0-4 0z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></>} />,
    Chat:         (p) => <Icon {...p} path={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>} />,
    Clock:        (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
    Staff:        (p) => <Icon {...p} path={<><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
    Chart:        (p) => <Icon {...p} path={<><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-6"/></>} />,
    Plug:         (p) => <Icon {...p} path={<><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/></>} />,
    Clipboard:    (p) => <Icon {...p} path={<><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3"/><path d="M9 12h6M9 16h4"/></>} />,
    Search:       (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>} />,
    Bell:         (p) => <Icon {...p} path={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />,
    Plus:         (p) => <Icon {...p} path={<><path d="M12 5v14M5 12h14"/></>} />,
    X:            (p) => <Icon {...p} path={<><path d="M6 6l12 12M18 6L6 18"/></>} />,
    Check:        (p) => <Icon {...p} path={<><path d="M20 6L9 17l-5-5"/></>} />,
    Edit:         (p) => <Icon {...p} path={<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>} />,
    Trash:        (p) => <Icon {...p} path={<><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>} />,
    Sync:         (p) => <Icon {...p} path={<><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></>} />,
    Filter:       (p) => <Icon {...p} path={<><path d="M3 4h18l-7 9v7l-4-2v-5z"/></>} />,
    Star:         (p) => <Icon {...p} path={<><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></>} />,
    Phone:        (p) => <Icon {...p} path={<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>} />,
    Tag:          (p) => <Icon {...p} path={<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></>} />,
    Menu:         (p) => <Icon {...p} path={<><path d="M3 6h18M3 12h18M3 18h18"/></>} />,
    ChevronRight: (p) => <Icon {...p} path={<><path d="M9 18l6-6-6-6"/></>} />,
    ChevronLeft:  (p) => <Icon {...p} path={<><path d="M15 18l-6-6 6-6"/></>} />,
    ChevronDown:  (p) => <Icon {...p} path={<><path d="M6 9l6 6 6-6"/></>} />,
    Link:         (p) => <Icon {...p} path={<><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>} />,
    Money:        (p) => <Icon {...p} path={<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/></>} />,
    Copy:         (p) => <Icon {...p} path={<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} />,
    Upload:       (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></>} />,
    Heart:        (p) => <Icon {...p} path={<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>} />
  };

  window.NUAE.Icons = Icons;
})();
