/* App root — состояние маршрута, темы, Tweaks. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "limitState": "warn80",
  "wsState": "preview",
  "userRole": "admin"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('chat');
  const [createKind, setCreateKind] = React.useState('dash');
  const [createPrefill, setCreatePrefill] = React.useState(null); // { solutionId, fromVersion, name, kind }
  const [adminTab, setAdminTab] = React.useState('domains');
  const [openSol, setOpenSol] = React.useState(null);
  const [time, setTime] = React.useState(currentTimestamp());
  /* Chat trigger — bumps when a "Создать решение" or "Новый чат" entry point is invoked
     from outside the Chat section. The Chat section reads this and resets/initiates. */
  const [chatTrigger, setChatTrigger] = React.useState(null); // { mode: 'new'|'create'|'history', kind?, ts }
  /* Admin impersonation — when admin enters a user's account from the user list */
  const [impersonating, setImpersonating] = React.useState(null); // { id, name, position, initials, role, email, domains } or null
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem('oes:sidebar:collapsed') === '1'; } catch (e) { return false; }
  });

  React.useEffect(() => { document.documentElement.dataset.theme = t.theme; }, [t.theme]);
  React.useEffect(() => { window.__tweaks = t; }, [t]);
  React.useEffect(() => { window.__impersonating = impersonating; }, [impersonating]);

  React.useEffect(() => {
    try { localStorage.setItem('oes:sidebar:collapsed', sidebarCollapsed ? '1' : '0'); } catch (e) {}
  }, [sidebarCollapsed]);

  React.useEffect(() => {
    const id = setInterval(() => setTime(currentTimestamp()), 1000);
    return () => clearInterval(id);
  }, []);

  const openCreate = (kind) => {
    if (kind) setCreateKind(kind);
    setCreatePrefill(null);
    // New behaviour: "Создать решение" entry points (sidebar, Home/Solutions header) route
    // to Chat and start a new dialog with a pre-selected solution kind.
    setChatTrigger({ mode: 'create', kind: kind || 'dash', ts: Date.now() });
    setRoute('chat');
  };

  /* Open the Create page directly (used by the chat-flow "Open in editor" link and
     by the edit flow). */
  const openCreatePage = (kind) => {
    if (kind) setCreateKind(kind);
    setCreatePrefill(null);
    setRoute('create');
  };

  const startNewChat = () => {
    setChatTrigger({ mode: 'new', ts: Date.now() });
    setRoute('chat');
  };

  // Open create flow in EDIT mode for an existing solution version
  const openEdit = (solutionId, fromVersion) => {
    const sol = OESDATA.solutions.find(s => s.id === solutionId);
    if (!sol) return;
    setCreateKind(sol.kind);
    setCreatePrefill({
      solutionId,
      fromVersion: fromVersion || sol.version,
      name: sol.name,
      kind: sol.kind,
    });
    setRoute('create');
  };

  // New behaviour: «Редактировать» / «Форкнуть в чат» — start a fresh chat
  // pre-loaded with this solution's preview and the question «что хотим изменить?»
  const editInChat = (solutionId, fromVersion, mode = 'edit') => {
    const sol = OESDATA.solutions.find(s => s.id === solutionId);
    if (!sol) return;
    setChatTrigger({
      mode: 'editSol',
      intent: mode, // 'edit' | 'fork'
      solutionId,
      fromVersion: fromVersion || sol.version,
      ts: Date.now()
    });
    setRoute('chat');
  };

  const openSolution = (id, version) => {
    setOpenSol({ id, version });
    setRoute('solution');
  };

  const switchRole = () => {
    setTweak('userRole', t.userRole === 'admin' ? 'user' : 'admin');
  };
  const setTheme = (v) => setTweak('theme', v);

  /* Enter another user's account as admin */
  const enterAs = (user) => {
    setImpersonating(user);
    setRoute('chat');
    setChatTrigger({ mode: 'new', ts: Date.now() });
  };
  const exitImpersonation = () => {
    setImpersonating(null);
    setRoute('admin');
    setAdminTab('users');
  };

  /* Effective role: admin acting as another user sees the UI as that user (user role) */
  const effectiveRole = impersonating ? 'user' : t.userRole;

  const sectionMap = {
    chat:        <SectionChat        setRoute={setRoute} openCreate={openCreate} openCreatePage={openCreatePage} openSolution={openSolution} tweak={t} trigger={chatTrigger} clearTrigger={() => setChatTrigger(null)} impersonating={impersonating} />,
    solutions:   <SectionSolutions   setRoute={setRoute} openCreate={openCreate} openSolution={openSolution} openEdit={openEdit} editInChat={editInChat} />,
    create:      <SectionCreate      setRoute={setRoute} tweak={t} kind={createKind} setKind={setCreateKind} prefill={createPrefill} clearPrefill={() => setCreatePrefill(null)} />,
    usage:       <SectionUsage       setRoute={setRoute} tweak={t} />,
    support:     <SectionSupport     tweak={t} />,
    settings:    <SectionSettings    tweak={t} setRoute={setRoute} />,
    admin:       <SectionAdmin       tab={adminTab} setTab={setAdminTab} enterAs={enterAs} />,
    solution:    <SectionSolutionView solution={openSol} setRoute={setRoute} openEdit={openEdit} editInChat={editInChat} />,
  };

  return (
    <div className="app grid-bg" data-screen-label={ROUTE_DEFS.find(r => r.id === route)?.label || route} data-sidebar={sidebarCollapsed ? 'collapsed' : 'expanded'}>
      <TopNav route={route} tweak={t} time={time} setRoute={setRoute} setTheme={setTheme} switchRole={switchRole} impersonating={impersonating} exitImpersonation={exitImpersonation} />
      {impersonating && <ImpersonationBanner user={impersonating} onExit={exitImpersonation} />}
      <div className="body">
        <Sidebar route={route} setRoute={setRoute} role={effectiveRole} openCreate={openCreate} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} />
        <main className="main" key={route} data-screen-label={ROUTE_DEFS.find(r => r.id === route)?.label}>
          {sectionMap[route]}
        </main>
      </div>

      <ToastHost />

      <TweaksPanel>
        <TweakSection label="Роль пользователя" />
        <TweakRadio
          label="Текущий пользователь" value={t.userRole}
          options={[
            { value: 'user',  label: 'User · Дьяконов' },
            { value: 'admin', label: 'Admin · Степанов' },
          ]}
          onChange={(v) => setTweak('userRole', v)}
        />

        <TweakSection label="Лимит токенов" />
        <TweakRadio
          label="Состояние" value={t.limitState}
          options={[
            { value: 'normal', label: '42%' },
            { value: 'warn75', label: '75%' },
            { value: 'warn80', label: '80%' },
            { value: 'stop',   label: '100%' },
          ]}
          onChange={(v) => setTweak('limitState', v)}
        />

        <TweakSection label="Workspace" />
        <TweakRadio
          label="Состояние" value={t.wsState}
          options={[
            { value: 'idle',       label: 'idle' },
            { value: 'generating', label: 'generating' },
            { value: 'preview',    label: 'preview' },
          ]}
          onChange={(v) => setTweak('wsState', v)}
        />
      </TweaksPanel>
    </div>
  );
}

function currentTimestamp() {
  const d = new Date('2026-05-18T16:54:12');
  const offset = Math.floor((Date.now() / 1000) % 60);
  d.setSeconds(12 + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function currentMe(role, impersonating) {
  if (impersonating) {
    return {
      name: impersonating.name,
      initials: impersonating.initials,
      role: impersonating.position,
      department: impersonating.position,
      email: impersonating.email,
      workspaceId: 'ws-' + impersonating.id,
      workspaceUptime: '—',
      workspaceCreatedAt: '—',
      systemRole: impersonating.role,
      domains: impersonating.domains || [],
    };
  }
  if (role === 'admin') {
    const u = OESDATA.users.find(u => u.role === 'admin');
    return u ? {
      name: u.name, initials: u.initials, role: u.position, department: 'Платформа OES X', email: u.email,
      workspaceId: 'ws-vgk-admin-01', workspaceUptime: '142 дн 04 ч', workspaceCreatedAt: '02.01.2026',
      systemRole: 'admin', domains: u.domains,
    } : { ...OESDATA.me, systemRole: 'admin', domains: ['excavators','port'] };
  }
  // Default "user" — Дьяконов И. К.
  const u = OESDATA.users.find(uu => uu.name === OESDATA.me.name) || OESDATA.users[0];
  return { ...OESDATA.me, systemRole: 'user', domains: u?.domains || ['excavators'] };
}

function ImpersonationBanner({ user, onExit }) {
  return (
    <div className="impersonation-banner">
      <span className="imp-pulse" />
      <IconUser size={13} style={{ color: 'var(--warn-orange)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--warn-orange)' }}>Режим имперсонизации</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}>
        Вы работаете под именем <strong style={{ color: 'var(--warn-orange)' }}>{user.name}</strong>
        <span style={{ color: 'var(--fg-muted)', marginLeft: 8 }}>{user.position} · {user.email}</span>
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>Все действия записываются в лог</span>
      <button className="btn btn-warn btn-sm" onClick={onExit}>
        <IconX size={11} /> Выйти из сессии
      </button>
    </div>
  );
}

/* — Global toast helper —
   Components call: window.notify({ title, body?, kind: 'success'|'info'|'error' })
   <ToastHost/> listens for the 'oes:toast' event and renders the stack. */
window.notify = (msg) => {
  const detail = typeof msg === 'string' ? { title: msg, kind: 'success' } : { kind: 'success', ...msg };
  window.dispatchEvent(new CustomEvent('oes:toast', { detail }));
};

function ToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const onToast = (e) => {
      const id = Math.random().toString(36).slice(2);
      const t = { id, ...e.detail };
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== id));
      }, 5000);
    };
    window.addEventListener('oes:toast', onToast);
    return () => window.removeEventListener('oes:toast', onToast);
  }, []);
  if (toasts.length === 0) return null;
  return (
    <div className="toast-host">
      {toasts.map(t => <Toast key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const KIND = {
    success: { color: 'var(--pos)',         bg: 'rgba(29,184,154,0.12)',  b: 'rgba(29,184,154,0.32)',  icon: <IconCheck size={14} /> },
    info:    { color: 'var(--info)',        bg: 'rgba(106,158,184,0.12)', b: 'rgba(106,158,184,0.32)', icon: <IconAlertCircle size={14} /> },
    error:   { color: 'var(--neg)',         bg: 'rgba(224,82,82,0.12)',   b: 'rgba(224,82,82,0.32)',   icon: <IconAlertCircle size={14} /> },
    warn:    { color: 'var(--warn-orange)', bg: 'rgba(196,124,50,0.12)',  b: 'rgba(196,124,50,0.32)',  icon: <IconAlertCircle size={14} /> },
  };
  const m = KIND[toast.kind] || KIND.success;
  return (
    <div className="toast" style={{ borderColor: m.b, background: m.bg }}>
      <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '0.5px solid ' + m.b, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>
        {m.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: m.color }}>{toast.title}</div>
        {toast.body && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.45 }}>{toast.body}</div>}
      </div>
      <button className="icon-btn" style={{ width: 22, height: 22, border: 'none', background: 'transparent' }} onClick={onClose}>
        <IconX size={11} />
      </button>
      <span className="toast-progress" style={{ background: m.color }} />
    </div>
  );
}

Object.assign(window, { currentMe, ToastHost, Toast, ImpersonationBanner });

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
