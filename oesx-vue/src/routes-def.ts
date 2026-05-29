/* Определения разделов навигации (порт ROUTE_DEFS / SIDEBAR_GROUPS / KIND_OPTIONS
   из shell.jsx). Используется и роутером, и Sidebar. */
import type { IconName } from './icons';
import { OESDATA } from './data';

export interface RouteDef {
  id: string;
  label: string;
  icon: IconName;
  path: string;
  product: string;
  count?: () => number;
  adminOnly?: boolean;
}

export const ROUTE_DEFS: RouteDef[] = [
  { id: 'chat', label: 'Чат', icon: 'message-square', path: '/chat', product: 'CHAT' },
  { id: 'solutions', label: 'Решения', icon: 'box', path: '/solutions', product: 'SOLUTIONS', count: () => OESDATA.solutions.length },
  { id: 'usage', label: 'Потребление', icon: 'coins', path: '/usage', product: 'USAGE & LIMITS' },
  { id: 'settings', label: 'Аккаунт', icon: 'settings', path: '/settings', product: 'ACCOUNT' },
  { id: 'admin', label: 'Администрирование', icon: 'shield', path: '/admin', product: 'ADMIN', adminOnly: true },
];

export interface SidebarGroup { items: string[]; create?: boolean; adminOnly?: boolean }
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  { items: ['chat', 'solutions'], create: true },
  { items: ['usage'] },
  { items: ['admin'], adminOnly: true },
];

export interface KindOption { id: string; label: string; icon: IconName; desc: string }
export const KIND_OPTIONS: KindOption[] = [
  { id: 'dash', label: 'Дашборд', icon: 'bar-chart', desc: 'Графики и таблицы по данным' },
  { id: 'automation', label: 'Автоматизация', icon: 'zap', desc: 'CRON-команда, алерт или Q&A — уточним в чате' },
];
