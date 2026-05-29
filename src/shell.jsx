import React from 'react';
import {
  CubeLogo, IconSearch, IconBell, IconLifeBuoy, IconChevronDown, IconArrowLeft,
  IconSettings, IconUsers, IconArrowRight, IconMoon, IconSun, IconMessageSquare,
  IconBox, IconCoins, IconShield, IconAlertCircle, IconFork, IconActivity,
  IconPlus, IconBarChart, IconBrain, IconZap, IconPanelLeft, IconMail, IconCheck,
  IconArrowUpRight,
} from './icons.jsx';
import { OESDATA } from './data.jsx';
import { currentMe } from './user.jsx';

/* Top nav + Sidebar + App shell. */

function TopNav({ route, tweak, time, setRoute, setTheme, switchRole, impersonating, exitImpersonation, notifications, markNotificationRead, markAllNotificationsRead, openAllNotifications }) {
  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const me = currentMe(tweak.userRole, impersonating);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const ref = React.useRef(null);
  const notifRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen && !notifOpen) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen, notifOpen]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setNotifOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const switchUser = () => {
    switchRole();
    setMenuOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <CubeLogo size={22} />
        <span className="nav-wordmark">OES</span>
        <span className="nav-sep" />
        <span className="nav-product">AGENTS</span>
      </div>
      <div className="nav-right">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.06em', marginRight: 4 }}>{time}</span>

        {/* Theme toggle */}
        <ThemeToggle theme={tweak.theme} setTheme={setTheme} />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="icon-btn" aria-label="Уведомления" title={unreadCount > 0 ? `Непрочитанных: ${unreadCount}` : 'Уведомления'} onClick={() => setNotifOpen(!notifOpen)}>
            <IconBell size={15} />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {notifOpen && (
            <NotificationsPopover
              notifications={notifications || []}
              markRead={markNotificationRead}
              markAllRead={markAllNotificationsRead}
              openAll={() => { openAllNotifications && openAllNotifications(); setNotifOpen(false); }}
              onClose={() => setNotifOpen(false)}
              setRoute={setRoute} />
          )}
        </div>

        <button className="icon-btn" aria-label="Поддержка" title="Поддержка — ВЕБ ИТ-портал" onClick={() => window.open('https://it.eastmining.ru/ipc-itil/', '_blank', 'noopener,noreferrer')}><IconLifeBuoy size={15} /></button>

        <div style={{ width: 1, height: 18, background: 'var(--border-strong)', margin: '0 4px' }} />

        {/* User dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button className={`user-chip ${impersonating ? 'imp' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span className="user-avatar">{me.initials}</span>
            <span className="uname">{me.name}</span>
            <IconChevronDown size={12} style={{ color: 'var(--fg-muted)', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }} />
          </button>
          {menuOpen && (
            <div className="popover" style={{ top: 'calc(100% + 6px)', right: 0, width: 240 }}>
              {impersonating && (
                <>
                  <button className="popover-item" style={{ color: 'var(--warn-orange)' }} onClick={() => { exitImpersonation && exitImpersonation(); setMenuOpen(false); }}>
                    <IconArrowLeft size={13} />
                    <span style={{ flex: 1, textAlign: 'left' }}>Покинуть сессию</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--warn-orange)', letterSpacing: '0.08em' }}>EXIT AS</span>
                  </button>
                  <div className="popover-divider" />
                </>
              )}
              <button className="popover-item" onClick={() => { setRoute('settings'); setMenuOpen(false); }}>
                <IconSettings size={13} /> Аккаунт
              </button>
              <div className="popover-divider" />
              <button className="popover-item" onClick={() => setMenuOpen(false)}>
                <IconArrowRight size={13} /> Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      aria-label="Сменить тему"
    >
      <span className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
        {isDark ? <IconMoon size={11} /> : <IconSun size={11} />}
      </span>
      <span className="theme-toggle-glyph" style={{ left: 7 }}><IconSun size={10} /></span>
      <span className="theme-toggle-glyph" style={{ right: 7 }}><IconMoon size={10} /></span>
    </button>
  );
}

function SearchPopover({ onClose, setRoute }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);
  const sources = [
    ...OESDATA.solutions.map(s => ({ kind: 'solution', label: s.name, sub: s.desc, route: 'solutions' })),
    { kind: 'route', label: 'Чат',             sub: 'диалог с агентом и история',route: 'chat',        icon: <IconMessageSquare size={13} /> },
    { kind: 'route', label: 'Решения',         sub: 'каталог артефактов',        route: 'solutions',   icon: <IconBox size={13} /> },
    { kind: 'route', label: 'Аккаунт',         sub: 'каналы, источники, профиль', route: 'settings',   icon: <IconSettings size={13} /> },
    { kind: 'route', label: 'Потребление',     sub: 'лимиты токенов',            route: 'usage',       icon: <IconCoins size={13} /> },
    { kind: 'route', label: 'Поддержка',       sub: 'обращения и FAQ',           route: 'support',     icon: <IconLifeBuoy size={13} /> },
    { kind: 'route', label: 'Администрирование', sub: 'домены и пользователи',   route: 'admin',       icon: <IconShield size={13} /> },
  ];
  const results = q
    ? sources.filter(s => s.label.toLowerCase().includes(q.toLowerCase()) || (s.sub && s.sub.toLowerCase().includes(q.toLowerCase()))).slice(0, 10)
    : sources.slice(0, 7);
  return (
    <div className="popover popover-search" style={{ top: 'calc(100% + 6px)', right: 0, width: 480 }}>
      <div className="search-input-row">
        <IconSearch size={13} style={{ color: 'var(--fg-muted)' }} />
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск по решениям, источникам, разделам…"
          style={{ flex: 1, background: 'transparent', border: 0, outline: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)' }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', padding: '3px 6px', borderRadius: 3, background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '0.5px solid var(--border)' }}>ESC</span>
      </div>
      <div className="popover-divider" />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {q === '' && <div style={{ padding: '6px 12px 4px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Быстрая навигация</div>}
        {results.length === 0 && (
          <div style={{ padding: 18, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>Ничего не найдено</div>
        )}
        {results.map((r, i) => (
          <button key={i} className="popover-item" onClick={() => { setRoute(r.route); onClose(); }}>
            <span style={{ width: 24, height: 24, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: r.kind === 'solution' ? 'var(--teal-dim)' : 'var(--surface-2)', color: r.kind === 'solution' ? 'var(--teal-400)' : 'var(--fg-muted)', border: '0.5px solid var(--border)', flexShrink: 0 }}>
              {r.icon || <IconBox size={12} />}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
              <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{r.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationsPopover({ notifications, markRead, markAllRead, openAll, onClose, setRoute }) {
  // В поповере показываем только непрочитанные — число в кружочке совпадает с длиной списка.
  const unread = notifications.filter((n) => !n.read);
  const TONE = { warn: 'var(--warn-orange)', alert: 'var(--neg)', fork: 'var(--info)', info: 'var(--info)', success: 'var(--pos)' };
  const ICON = { warn: IconCoins, alert: IconAlertCircle, fork: IconFork, info: IconActivity, success: IconCheck };
  return (
    <div className="popover popover-notify" style={{ top: 'calc(100% + 6px)', right: 0, width: 380 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '0.5px solid var(--border)' }}>
        <IconBell size={13} style={{ color: 'var(--fg)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Непрочитанные · {unread.length}</span>
        <span style={{ flex: 1 }} />
        {unread.length > 0 && (
          <button onClick={() => markAllRead && markAllRead()}
            style={{ background: 'transparent', border: 0, color: 'var(--teal-400)', fontFamily: 'var(--font-sans)', fontSize: 11, cursor: 'pointer', padding: 0 }}
            title="Отметить все как прочитанные">
            Отметить все
          </button>
        )}
      </div>
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {unread.length === 0 && (
          <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--fg-muted)', fontFamily: 'var(--font-sans)', fontSize: 12 }}>
            Новых уведомлений нет
          </div>
        )}
        {unread.map((n) => {
          const tone = TONE[n.kind] || 'var(--fg-muted)';
          const Ic = ICON[n.kind] || IconActivity;
          return (
            <div key={n.id} className="notif-row"
              onClick={() => { setRoute(n.route); onClose(); }}>
              <span style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone, flexShrink: 0 }}>
                <Ic size={13} />
              </span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{n.title}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.45, marginTop: 2 }}>{n.text}</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 4, letterSpacing: '0.04em' }}>{n.t}</span>
              </span>
              <button
                className="notif-envelope"
                title="Пометить прочитанным"
                onClick={(e) => { e.stopPropagation(); markRead && markRead(n.id); }}>
                <IconMail size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="popover-divider" />
      <button className="popover-item" style={{ justifyContent: 'space-between', color: 'var(--teal-400)' }} onClick={openAll}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconBell size={12} /> Все уведомления
        </span>
        <IconArrowUpRight size={12} />
      </button>
    </div>
  );
}

/* — Sidebar (collapsible) — */
const SIDEBAR_GROUPS = [
  { items: ['chat','solutions'], create: true },
  { items: ['usage'] },
  { items: ['admin'], adminOnly: true },
];
const ROUTE_DEFS = [
  { id: 'chat',        label: 'Чат',              icon: IconMessageSquare,product: 'CHAT',            count: null },
  { id: 'solutions',   label: 'Решения',          icon: IconBox,          product: 'SOLUTIONS',       count: () => OESDATA.solutions.length },
  { id: 'create',      label: 'Создать решение',  icon: IconPlus,         product: 'NEW SOLUTION',    count: null, hidden: true },
  { id: 'usage',       label: 'Потребление',      icon: IconCoins,        product: 'USAGE & LIMITS',  count: null },
  { id: 'settings',    label: 'Аккаунт',          icon: IconSettings,     product: 'ACCOUNT',         count: null },
  { id: 'admin',       label: 'Администрирование',icon: IconShield,       product: 'ADMIN',           count: null },
];

/* Solution kinds for the Create dropdown.
   «Автоматизация» — обобщающий пункт, который в чате уточняется до CRON-команды
   либо до уведомления по событию (бывший «Алерт»). Конкретный подтип фиксируется
   первым шагом сценарного диалога в SectionCreate. */
const KIND_OPTIONS = [
  { id: 'dash',       label: 'Дашборд',       icon: IconBarChart, desc: 'Графики и таблицы по данным' },
  { id: 'automation', label: 'Автоматизация', icon: IconZap,      desc: 'CRON-команда, алерт или Q&A — уточним в чате' },
];

function CreateButton({ openCreate, variant = 'primary', size }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''}`} onClick={() => setOpen(!open)}>
        <IconPlus size={12} /> Создать решение <IconChevronDown size={11} style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }} />
      </button>
      {open && (
        <div className="popover" style={{ top: 'calc(100% + 6px)', right: 0, width: 280 }}>
          {KIND_OPTIONS.map(k => {
            const Ic = k.icon;
            return (
              <button key={k.id} className="popover-item popover-item-lg" onClick={() => { setOpen(false); openCreate(k.id); }}>
                <span className="popover-icon"><Ic size={14} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{k.label}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{k.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sidebar({ route, setRoute, role, openCreate, collapsed, onToggleCollapse, limitState }) {
  const isAdmin = role === 'admin';
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Toggle button — always at the top */}
      <button
        className="sb-toggle"
        onClick={onToggleCollapse}
        data-tooltip={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        <IconPanelLeft size={15} />
        {!collapsed && <span>Свернуть меню</span>}
      </button>

      <div className="sb-divider" />

      {SIDEBAR_GROUPS.map((g, gi) => {
        if (g.adminOnly && !isAdmin) return null;
        return (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="sb-divider" />}
            {g.create && <SidebarCreate openCreate={openCreate} collapsed={collapsed} />}
            {g.items.map((id) => {
              const r = ROUTE_DEFS.find(x => x.id === id);
              if (!r) return null;
              const Ic = r.icon;
              const active = route === id;
              const cnt = typeof r.count === 'function' ? r.count() : null;
              return (
                <button
                  key={id}
                  className={`sb-item ${active ? 'active' : ''}`}
                  onClick={() => setRoute(id)}
                  data-tooltip={r.label}
                >
                  <Ic size={15} />
                  <span>{r.label}</span>
                  {cnt !== null && <span className="count">{cnt}</span>}
                </button>
              );
            })}
          </React.Fragment>
        );
      })}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <SidebarLimit collapsed={collapsed} limitState={limitState} />
      </div>
    </aside>
  );
}

/* Sidebar Create — same dropdown UX but styled as a sidebar item */
function SidebarCreate({ openCreate, collapsed }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="sb-item sb-item-create"
        onClick={() => setOpen(!open)}
        data-tooltip="Создать решение"
        style={{ color: 'var(--teal-400)', background: open ? 'var(--teal-dim)' : 'transparent', borderColor: open ? 'var(--border-strong)' : 'transparent' }}>
        <IconPlus size={15} />
        <span>Создать решение</span>
        {!collapsed && <IconChevronDown size={12} style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }} />}
      </button>
      {open && (
        <div className="popover" style={collapsed
          ? { top: 0, left: 'calc(100% + 6px)', width: 220 }
          : { top: 'calc(100% + 4px)', left: 0, right: 0, width: 'auto' }}>
          {KIND_OPTIONS.map(k => {
            const Ic = k.icon;
            return (
              <button key={k.id} className="popover-item" onClick={() => { setOpen(false); openCreate(k.id); }}>
                <Ic size={13} /> {k.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* — Mini limit card at bottom of sidebar — */
function SidebarLimit({ collapsed, limitState }) {
  const limitData = useLimitState(limitState || 'normal');
  const tone = limitData.pct >= 100 ? 'danger' : (limitData.pct >= 80 ? 'warn' : '');
  if (collapsed) {
    // Compact icon-only indicator in collapsed sidebar
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', position: 'relative' }} className="sb-limit-mini" data-tooltip={`Токены · ${limitData.pct}%`}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: limitData.pct >= 80 ? 'rgba(196,124,50,0.10)' : 'var(--surface-2)',
          border: '0.5px solid ' + (limitData.pct >= 80 ? 'rgba(196,124,50,0.30)' : 'var(--border)'),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: limitData.pct >= 80 ? 'var(--warn-orange)' : 'var(--fg-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
        }}>
          {limitData.pct}%
        </span>
      </div>
    );
  }
  return (
    <div style={{
      margin: '12px 6px 4px', padding: 12,
      background: 'var(--surface-2)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-md)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>Токены · май</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: limitData.pct >= 80 ? 'var(--warn-orange)' : 'var(--fg)' }}>{limitData.pct}%</span>
      </div>
      <div className={`bar ${tone}`}><span style={{ width: Math.min(100, limitData.pct) + '%' }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
        <span>{(limitData.used / 1_000_000).toFixed(2)}M</span>
        <span>/ {(OESDATA.billing.limitTokens / 1_000_000).toFixed(1)}M</span>
      </div>
    </div>
  );
}

/* — Hook: derive used/pct from tweak state — */
function useLimitState(state) {
  const limit = OESDATA.billing.limitTokens;
  const map = { normal: 0.42, warn75: 0.75, warn80: 0.82, stop: 1.02 };
  const pctRaw = map[state] ?? 0.42;
  const used = Math.round(limit * pctRaw);
  return { used, pct: Math.round(pctRaw * 100), state };
}

export { TopNav, Sidebar, ROUTE_DEFS, KIND_OPTIONS, CreateButton, useLimitState };
