/* App root — route state, theme, demo tweaks, toasts, impersonation. */

import React from 'react';
import { OESDATA } from './data.jsx';
import { currentTimestamp } from './user.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio } from './tweaks-panel.jsx';
import { TopNav, Sidebar, ROUTE_DEFS } from './shell.jsx';
import { IconUser, IconX, IconCheck, IconAlertCircle } from './icons.jsx';
import { SectionChat } from './sections/home.jsx';
import { SectionSolutions, SectionSupport, SectionSettings } from './sections/various.jsx';
import { SectionCreate } from './sections/create.jsx';
import { SectionUsage } from './sections/usage.jsx';
import { SectionAdmin } from './sections/admin.jsx';
import { SectionSolutionView } from './sections/solution-view.jsx';

const TWEAK_DEFAULTS = {
  theme: 'dark',
  limitState: 'warn80',
  wsState: 'preview',
  userRole: 'admin',
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('chat');
  const [createKind, setCreateKind] = React.useState('dash');
  const [createPrefill, setCreatePrefill] = React.useState(null); // { solutionId, fromVersion, name, kind }
  const [adminTab, setAdminTab] = React.useState('domains');
  const [settingsTab, setSettingsTab] = React.useState('profile');
  const [openSol, setOpenSol] = React.useState(null);
  const [time, setTime] = React.useState(currentTimestamp());

  /* Уведомления — глобальное состояние, чтобы значок-колокольчик в шапке и
     раздел «Аккаунт → Уведомления» показывали одни и те же данные и согласованно
     обновлялись при пометке прочитанным. */
  const [notifications, setNotifications] = React.useState([
    { id: 'n1', kind: 'warn',    title: '80% лимита токенов',       text: 'Прогноз — лимит закончится через ≈9 дней.',                       t: '12 мин назад', route: 'usage',     read: false },
    { id: 'n2', kind: 'alert',   title: 'Просадка КИО — R 9250 /5', text: 'КИО упал до 81% в ночную смену.',                                 t: '32 мин назад', route: 'chat',      read: false },
    { id: 'n3', kind: 'fork',    title: 'Форк вашего решения',      text: '«Просадки КИО» — Гречко И. С., логистика.',                       t: '2 ч назад',    route: 'solutions', read: false },
    { id: 'n4', kind: 'success', title: 'Решение опубликовано',     text: '«Бюджет — добыча и вскрыша» · v3',                                t: 'вчера',        route: 'solutions', read: true },
    { id: 'n5', kind: 'info',    title: 'MCP-сервер подключён',     text: 'shift-rating-mcp-port.oeswork.io',                                t: '17.05',        route: 'settings',  read: true },
    { id: 'n6', kind: 'info',    title: 'Доступ предоставлен',      text: 'Котов А. С. поделился «Q&A агент по справочнику ТО»',             t: '15.05',        route: 'solutions', read: true },
  ]);
  const markNotificationRead = React.useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markNotificationUnread = React.useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
  }, []);
  const markAllNotificationsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const openAllNotifications = React.useCallback(() => {
    setSettingsTab('notify');
    setRoute('settings');
  }, []);

  /* Агенты пользователя — поднято в App, чтобы переключение «Сделать основным»
     синхронно меняло имя отвечающего бота в Чате и заголовки в Create. */
  const [agents, setAgents] = React.useState(() => OESDATA.assistant.agents.map((a) => ({ ...a })));
  const setPrimaryAgent = React.useCallback((name) => {
    setAgents((prev) => prev.map((a) => ({ ...a, primary: a.name === name })));
  }, []);
  const primaryAgentName = (agents.find((a) => a.primary) || agents[0] || { name: 'OpenClaw' }).name;
  /* Chat trigger — bumps when a "Создать решение" or "Новый чат" entry point is invoked
     from outside the Chat section. The Chat section reads this and resets/initiates. */
  const [chatTrigger, setChatTrigger] = React.useState(null); // { mode: 'new'|'create'|'history', kind?, ts }
  /* Admin impersonation — when admin enters a user's account from the user list */
  const [impersonating, setImpersonating] = React.useState(null); // { id, name, position, initials, role, email, domains } or null
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try { return localStorage.getItem('oes:sidebar:collapsed') === '1'; } catch (e) { return false; }
  });

  React.useEffect(() => { document.documentElement.dataset.theme = t.theme; }, [t.theme]);

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
    // Открываем полноценную страницу создания: превью-плейсхолдер по центру,
    // сценарный чат справа (на <1200px — снизу). Та же страница, что и для
    // редактирования существующего решения, только без prefill.
    setRoute('create');
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

  const openChatHistory = () => {
    setChatTrigger({ mode: 'history', ts: Date.now() });
    setRoute('chat');
  };

  // Open create flow in EDIT mode for an existing solution version
  const openEdit = (solutionId, fromVersion) => {
    const sol = OESDATA.solutions.find((s) => s.id === solutionId);
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

  // «Редактировать» / «Форкнуть в чат» — start a fresh chat pre-loaded with this
  // solution's preview and the question «что хотим изменить?»
  const editInChat = (solutionId, fromVersion, mode = 'edit') => {
    const sol = OESDATA.solutions.find((s) => s.id === solutionId);
    if (!sol) return;
    setChatTrigger({
      mode: 'editSol',
      intent: mode, // 'edit' | 'fork'
      solutionId,
      fromVersion: fromVersion || sol.version,
      ts: Date.now(),
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
    chat:        <SectionChat        setRoute={setRoute} openCreate={openCreate} openCreatePage={openCreatePage} openSolution={openSolution} tweak={t} trigger={chatTrigger} clearTrigger={() => setChatTrigger(null)} impersonating={impersonating} primaryAgentName={primaryAgentName} />,
    solutions:   <SectionSolutions   setRoute={setRoute} openCreate={openCreate} openSolution={openSolution} openEdit={openEdit} editInChat={editInChat} tweak={t} />,
    create:      <SectionCreate      setRoute={setRoute} tweak={t} kind={createKind} setKind={setCreateKind} prefill={createPrefill} clearPrefill={() => setCreatePrefill(null)} startNewChat={startNewChat} openChatHistory={openChatHistory} primaryAgentName={primaryAgentName} />,
    usage:       <SectionUsage       setRoute={setRoute} tweak={t} />,
    support:     <SectionSupport     tweak={t} />,
    settings:    <SectionSettings    tweak={t} setRoute={setRoute} impersonating={impersonating} tab={settingsTab} setTab={setSettingsTab} notifications={notifications} markNotificationRead={markNotificationRead} markNotificationUnread={markNotificationUnread} markAllNotificationsRead={markAllNotificationsRead} agents={agents} setPrimaryAgent={setPrimaryAgent} />,
    admin:       <SectionAdmin       tab={adminTab} setTab={setAdminTab} enterAs={enterAs} />,
    solution:    <SectionSolutionView solution={openSol} setRoute={setRoute} openEdit={openEdit} editInChat={editInChat} openSolution={openSolution} tweak={t} />,
  };

  return (
    <div className="app grid-bg" data-screen-label={ROUTE_DEFS.find((r) => r.id === route)?.label || route} data-sidebar={sidebarCollapsed ? 'collapsed' : 'expanded'}>
      <TopNav route={route} tweak={t} time={time} setRoute={setRoute} setTheme={setTheme} switchRole={switchRole} impersonating={impersonating} exitImpersonation={exitImpersonation} notifications={notifications} markNotificationRead={markNotificationRead} markAllNotificationsRead={markAllNotificationsRead} openAllNotifications={openAllNotifications} />
      {impersonating && <ImpersonationBanner user={impersonating} onExit={exitImpersonation} />}
      <div className="body">
        <Sidebar route={route} setRoute={setRoute} role={effectiveRole} openCreate={openCreate} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} limitState={t.limitState} />
        <main className="main" key={route} data-screen-label={ROUTE_DEFS.find((r) => r.id === route)?.label}>
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

function ImpersonationBanner({ user, onExit }) {
  return (
    <div className="impersonation-banner">
      <span className="imp-pulse" />
      <IconUser size={13} style={{ color: 'var(--warn-orange)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--warn-orange)' }}>Режим имперсонации</span>
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
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 5000);
    };
    window.addEventListener('oes:toast', onToast);
    return () => window.removeEventListener('oes:toast', onToast);
  }, []);
  if (toasts.length === 0) return null;
  return (
    <div className="toast-host">
      {toasts.map((t) => <Toast key={t.id} toast={t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />)}
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
      {toast.action && (
        <button
          className="btn btn-sm"
          style={{ alignSelf: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.06)', color: m.color, borderColor: m.b }}
          onClick={() => { toast.action.onClick && toast.action.onClick(); onClose(); }}
        >
          {toast.action.label}
        </button>
      )}
      <button className="icon-btn" style={{ width: 22, height: 22, border: 'none', background: 'transparent' }} onClick={onClose}>
        <IconX size={11} />
      </button>
      <span className="toast-progress" style={{ background: m.color }} />
    </div>
  );
}
