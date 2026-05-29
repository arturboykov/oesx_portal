<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon, CubeLogo } from '../icons';
import type { IconName } from '../icons';
import { currentMe, currentTimestamp } from '../user';
import { useAppState, type Notification } from '../store';

const router = useRouter();
const app = useAppState();

const me = computed(() => currentMe(app.state.userRole, app.state.impersonating));

// Демо-часы
const time = ref(currentTimestamp());
let timer: number | undefined;
onMounted(() => { timer = window.setInterval(() => { time.value = currentTimestamp(); }, 1000); });
onUnmounted(() => { if (timer) clearInterval(timer); });

// Поповеры + click-outside
const menuOpen = ref(false);
const notifOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const notifRef = ref<HTMLElement | null>(null);
function onDocDown(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) menuOpen.value = false;
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) notifOpen.value = false;
}
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { menuOpen.value = false; notifOpen.value = false; } }
onMounted(() => { document.addEventListener('mousedown', onDocDown); document.addEventListener('keydown', onKey); });
onUnmounted(() => { document.removeEventListener('mousedown', onDocDown); document.removeEventListener('keydown', onKey); });

const unread = computed(() => app.state.notifications.filter((n) => !n.read));

const NOTIF_ICON: Record<Notification['kind'], IconName> = {
  warn: 'coins', alert: 'alert-circle', fork: 'fork', info: 'activity', success: 'check',
};
const NOTIF_TONE: Record<Notification['kind'], string> = {
  warn: 'var(--warn-orange)', alert: 'var(--neg)', fork: 'var(--info)', info: 'var(--info)', success: 'var(--pos)',
};

function go(path: string) { router.push(path); }
function openNotifRoute(n: Notification) { router.push('/' + n.route); notifOpen.value = false; }
function openAllNotifications() { router.push('/settings'); notifOpen.value = false; }
function openSupport() { window.open('https://it.eastmining.ru/ipc-itil/', '_blank', 'noopener,noreferrer'); }
</script>

<template>
  <nav class="nav">
    <div class="nav-left">
      <CubeLogo :size="22" />
      <span class="nav-wordmark">OES</span>
      <span class="nav-sep" />
      <span class="nav-product">AGENTS</span>
    </div>

    <div class="nav-right">
      <span style="font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); letter-spacing: 0.06em; margin-right: 4px">{{ time }}</span>

      <!-- Тема -->
      <button class="theme-toggle" :title="app.state.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'" aria-label="Сменить тему" @click="app.toggleTheme()">
        <span class="theme-toggle-glyph" style="left: 7px"><Icon name="sun" :size="10" /></span>
        <span class="theme-toggle-glyph" style="right: 7px"><Icon name="moon" :size="10" /></span>
        <span class="theme-toggle-thumb" :class="app.state.theme === 'dark' ? 'dark' : 'light'">
          <Icon :name="app.state.theme === 'dark' ? 'moon' : 'sun'" :size="11" />
        </span>
      </button>

      <!-- Уведомления -->
      <div ref="notifRef" style="position: relative">
        <button class="icon-btn" aria-label="Уведомления" :title="app.unreadCount.value > 0 ? `Непрочитанных: ${app.unreadCount.value}` : 'Уведомления'" @click="notifOpen = !notifOpen">
          <Icon name="bell" :size="15" />
          <span v-if="app.unreadCount.value > 0" class="bell-badge">{{ app.unreadCount.value > 99 ? '99+' : app.unreadCount.value }}</span>
        </button>
        <div v-if="notifOpen" class="popover popover-notify" style="top: calc(100% + 6px); right: 0; width: 380px">
          <div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 0.5px solid var(--border)">
            <Icon name="bell" :size="13" style="color: var(--fg)" />
            <span style="font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg)">Непрочитанные · {{ unread.length }}</span>
            <span style="flex: 1" />
            <button v-if="unread.length > 0" style="background: transparent; border: 0; color: var(--teal-400); font-family: var(--font-sans); font-size: 11px; cursor: pointer; padding: 0" title="Отметить все как прочитанные" @click="app.markAllNotificationsRead()">Отметить все</button>
          </div>
          <div style="max-height: 420px; overflow-y: auto">
            <div v-if="unread.length === 0" style="padding: 28px 14px; text-align: center; color: var(--fg-muted); font-family: var(--font-sans); font-size: 12px">Новых уведомлений нет</div>
            <div v-for="n in unread" :key="n.id" class="notif-row" @click="openNotifRoute(n)">
              <span :style="{ width: '28px', height: '28px', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: NOTIF_TONE[n.kind], flexShrink: 0 }">
                <Icon :name="NOTIF_ICON[n.kind]" :size="13" />
              </span>
              <span style="flex: 1; min-width: 0; text-align: left">
                <span style="display: block; font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg)">{{ n.title }}</span>
                <span style="display: block; font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.45; margin-top: 2px">{{ n.text }}</span>
                <span style="display: block; font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 4px; letter-spacing: 0.04em">{{ n.t }}</span>
              </span>
              <button class="notif-envelope" title="Пометить прочитанным" @click.stop="app.markNotificationRead(n.id)">
                <Icon name="mail" :size="13" />
              </button>
            </div>
          </div>
          <div class="popover-divider" />
          <button class="popover-item" style="justify-content: space-between; color: var(--teal-400)" @click="openAllNotifications">
            <span style="display: inline-flex; align-items: center; gap: 8px"><Icon name="bell" :size="12" /> Все уведомления</span>
            <Icon name="arrow-up-right" :size="12" />
          </button>
        </div>
      </div>

      <button class="icon-btn" aria-label="Поддержка" title="Поддержка — ВЕБ ИТ-портал" @click="openSupport"><Icon name="life-buoy" :size="15" /></button>

      <div style="width: 1px; height: 18px; background: var(--border-strong); margin: 0 4px" />

      <!-- Пользователь -->
      <div ref="menuRef" style="position: relative">
        <button class="user-chip" :class="{ imp: !!app.state.impersonating }" @click="menuOpen = !menuOpen">
          <span class="user-avatar">{{ me.initials }}</span>
          <span class="uname">{{ me.name }}</span>
          <Icon name="chevron-down" :size="12" :style="{ color: 'var(--fg-muted)', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }" />
        </button>
        <div v-if="menuOpen" class="popover" style="top: calc(100% + 6px); right: 0; width: 240px">
          <template v-if="app.state.impersonating">
            <button class="popover-item" style="color: var(--warn-orange)" @click="app.exitImpersonation(); menuOpen = false">
              <Icon name="arrow-left" :size="13" />
              <span style="flex: 1; text-align: left">Покинуть сессию</span>
              <span style="font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em">EXIT AS</span>
            </button>
            <div class="popover-divider" />
          </template>
          <button class="popover-item" @click="go('/settings'); menuOpen = false"><Icon name="settings" :size="13" /> Аккаунт</button>
          <div class="popover-divider" />
          <button class="popover-item" @click="menuOpen = false"><Icon name="arrow-right" :size="13" /> Выйти</button>
        </div>
      </div>
    </div>
  </nav>
</template>
