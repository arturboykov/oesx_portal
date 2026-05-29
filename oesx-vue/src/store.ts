/* Глобальное состояние приложения.
   В React-прототипе это жило в App.jsx и шерилось через props. В Vue —
   единый reactive-синглтон (лёгкая замена Pinia для Фазы 1). При желании
   позже тривиально переносится в Pinia-стор. */

import { reactive, computed } from 'vue';
import { OESDATA, type Agent } from './data';
import type { UserRole, Impersonation } from './user';

export interface Notification {
  id: string;
  kind: 'warn' | 'alert' | 'fork' | 'info' | 'success';
  title: string;
  text: string;
  t: string;
  route: string;
  read: boolean;
}

type LimitState = 'normal' | 'warn75' | 'warn80' | 'stop';

const state = reactive({
  theme: 'dark' as 'dark' | 'light',
  userRole: 'user' as UserRole,
  impersonating: null as Impersonation | null,
  limitState: 'normal' as LimitState,
  sidebarCollapsed: false,
  agents: OESDATA.assistant.agents.map((a) => ({ ...a })) as Agent[],
  notifications: [
    { id: 'n1', kind: 'warn', title: 'Лимит токенов 80%', text: 'Достигнут порог 80% месячного лимита для роли «Инженер ГТК».', t: '18.05.2026, 16:40', route: 'usage', read: false },
    { id: 'n2', kind: 'alert', title: 'Просадка КИО', text: 'R 9250 /5 — КИО 81% в ночную смену на ЭВ категории КТ.', t: '18.05.2026, 02:08', route: 'solutions', read: false },
    { id: 'n3', kind: 'fork', title: 'Ваше решение форкнули', text: '«Просадки КИО за ночную смену» — 2 новых форка за сутки.', t: '17.05.2026, 11:30', route: 'solutions', read: false },
    { id: 'n4', kind: 'success', title: 'Дайджест отправлен', text: '«Утренний дайджест по парку» доставлен в почту.', t: '18.05.2026, 06:30', route: 'solutions', read: true },
    { id: 'n5', kind: 'info', title: 'Обновление Workspace', text: 'Применены новые корпоративные шаблоны решений.', t: '16.05.2026, 09:00', route: 'settings', read: true },
    { id: 'n6', kind: 'info', title: 'Новый источник данных', text: 'Подключён «Бюджет — суточный план».', t: '15.05.2026, 14:12', route: 'settings', read: true },
  ] as Notification[],
});

export function useAppState() {
  const unreadCount = computed(() => state.notifications.filter((n) => !n.read).length);
  const primaryAgentName = computed(() => state.agents.find((a) => a.primary)?.name ?? state.agents[0]?.name ?? 'OpenClaw');

  function setTheme(theme: 'dark' | 'light') {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  }
  function switchRole() {
    state.userRole = state.userRole === 'admin' ? 'user' : 'admin';
  }
  function impersonate(u: { id: string; name: string; initials: string; position: string; email: string; role: string; domains?: string[] }) {
    state.impersonating = {
      id: u.id, name: u.name, initials: u.initials, position: u.position, email: u.email,
      role: u.role === 'admin' ? 'admin' : 'user', domains: u.domains,
    };
  }
  function exitImpersonation() {
    state.impersonating = null;
  }
  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
  }
  // Лимит токенов по демо-состоянию (порт useLimitState из shell.jsx)
  const LIMIT_MAP: Record<LimitState, number> = { normal: 0.42, warn75: 0.75, warn80: 0.82, stop: 1.02 };
  const limitInfo = computed(() => {
    const limit = OESDATA.billing.limitTokens;
    const pctRaw = LIMIT_MAP[state.limitState] ?? 0.42;
    return { used: Math.round(limit * pctRaw), pct: Math.round(pctRaw * 100), limit };
  });
  function setPrimaryAgent(name: string) {
    state.agents = state.agents.map((a) => ({ ...a, primary: a.name === name }));
  }
  function markNotificationRead(id: string) {
    const n = state.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  }
  function markNotificationUnread(id: string) {
    const n = state.notifications.find((x) => x.id === id);
    if (n) n.read = false;
  }
  function markAllNotificationsRead() {
    state.notifications.forEach((n) => { n.read = true; });
  }

  return {
    state,
    unreadCount,
    primaryAgentName,
    limitInfo,
    setTheme,
    toggleTheme,
    switchRole,
    impersonate,
    exitImpersonation,
    toggleSidebar,
    setPrimaryAgent,
    markNotificationRead,
    markNotificationUnread,
    markAllNotificationsRead,
  };
}
