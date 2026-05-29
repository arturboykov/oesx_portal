/* Определение текущего пользователя + демо-часы (порт src/user.jsx). */

import { OESDATA, type Me, type User } from './data';

export type UserRole = 'admin' | 'user';

export interface Impersonation {
  id: string;
  name: string;
  initials: string;
  position: string;
  email: string;
  role: UserRole;
  domains?: string[];
}

export function currentTimestamp(): string {
  const d = new Date('2026-05-18T16:54:12');
  const offset = Math.floor((Date.now() / 1000) % 60);
  d.setSeconds(12 + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function currentMe(role?: UserRole, impersonating?: Impersonation | null): Me {
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
    const u = OESDATA.users.find((x: User) => x.role === 'admin');
    return u
      ? {
          name: u.name, initials: u.initials, role: u.position, department: 'Платформа OES X', email: u.email,
          workspaceId: 'ws-vgk-admin-01', workspaceUptime: '142 дн 04 ч', workspaceCreatedAt: '02.01.2026',
          systemRole: 'admin', domains: u.domains,
        }
      : { ...OESDATA.me, systemRole: 'admin', domains: ['excavators', 'port'] };
  }
  // По умолчанию «user» — Дьяконов И. К.
  const u = OESDATA.users.find((uu: User) => uu.name === OESDATA.me.name) || OESDATA.users[0];
  return { ...OESDATA.me, systemRole: 'user', domains: u?.domains || ['excavators'] };
}
