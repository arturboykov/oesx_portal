/* Current-user resolution + the demo clock.
   Extracted from the prototype's app root so shell + sections can import it
   without a circular dependency on App. */

import { OESDATA } from './data.jsx';

export function currentTimestamp() {
  const d = new Date('2026-05-18T16:54:12');
  const offset = Math.floor((Date.now() / 1000) % 60);
  d.setSeconds(12 + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function currentMe(role, impersonating) {
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
    const u = OESDATA.users.find((u) => u.role === 'admin');
    return u ? {
      name: u.name, initials: u.initials, role: u.position, department: 'Платформа OES X', email: u.email,
      workspaceId: 'ws-vgk-admin-01', workspaceUptime: '142 дн 04 ч', workspaceCreatedAt: '02.01.2026',
      systemRole: 'admin', domains: u.domains,
    } : { ...OESDATA.me, systemRole: 'admin', domains: ['excavators', 'port'] };
  }
  // Default "user" — Дьяконов И. К.
  const u = OESDATA.users.find((uu) => uu.name === OESDATA.me.name) || OESDATA.users[0];
  return { ...OESDATA.me, systemRole: 'user', domains: u?.domains || ['excavators'] };
}
