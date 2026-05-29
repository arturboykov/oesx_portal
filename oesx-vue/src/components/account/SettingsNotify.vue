<script setup lang="ts">
/* Уведомления (порт SettingsNotify): настройки + полная лента из стора. */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import RowToggle from '../RowToggle.vue';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { useAppState, type Notification } from '../../store';

const router = useRouter();
const app = useAppState();
const list = computed(() => app.state.notifications);
const unreadCount = computed(() => list.value.filter((n) => !n.read).length);

const TONE: Record<Notification['kind'], string> = { warn: 'var(--warn-orange)', alert: 'var(--neg)', fork: 'var(--info)', info: 'var(--info)', success: 'var(--pos)' };
const ICON: Record<Notification['kind'], IconName> = { warn: 'bell', alert: 'alert-circle', fork: 'fork', info: 'bell', success: 'check' };
</script>

<template>
  <div>
    <div class="section-head"><span class="sh-title">Настройки уведомлений</span><div class="sh-line" /></div>
    <div class="card" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px">
      <RowToggle title="Лимит токенов" desc="Уведомлять при 80% и 100% лимита" :modelValue="true" />
      <RowToggle title="Форки моих решений" desc="Когда коллега форкнул решение" :modelValue="true" />
      <RowToggle title="Срабатывание алертов" desc="Дублировать в Teams + почту" :modelValue="false" />
      <RowToggle title="Дайджест по подразделению" desc="Раз в неделю — топ новых решений" :modelValue="false" />
    </div>

    <div class="section-head">
      <span class="sh-title">Все уведомления</span>
      <span class="sh-count">{{ list.length }}</span>
      <span v-if="unreadCount" class="nf-unread">{{ unreadCount }} непрочитанных</span>
      <div class="sh-line" />
      <button v-if="unreadCount" class="nf-allread" @click="app.markAllNotificationsRead()">Отметить все как прочитанные</button>
    </div>

    <div class="card" style="padding: 0; overflow: hidden">
      <div v-if="!list.length" class="nf-empty">Уведомлений нет</div>
      <div
        v-for="(n, i) in list"
        :key="n.id"
        class="nf-row"
        :style="{ borderBottom: i < list.length - 1 ? '0.5px solid var(--border)' : 'none', background: n.read ? 'transparent' : 'rgba(196,124,50,0.04)' }"
        @click="router.push('/' + n.route)"
      >
        <span class="nf-ic" :style="{ color: TONE[n.kind] }"><Icon :name="ICON[n.kind]" :size="14" /></span>
        <span style="flex: 1; min-width: 0; text-align: left">
          <span class="nf-title" :style="{ fontWeight: n.read ? 400 : 500 }">
            <span v-if="!n.read" class="nf-dot" />
            {{ n.title }}
          </span>
          <span class="nf-text">{{ n.text }}</span>
          <span class="nf-time">{{ n.t }}</span>
        </span>
        <button v-if="!n.read" class="notif-envelope" title="Пометить прочитанным" @click.stop="app.markNotificationRead(n.id)"><Icon name="mail-open" :size="13" /></button>
        <button v-else class="notif-envelope" title="Пометить непрочитанным" @click.stop="app.markNotificationUnread(n.id)"><Icon name="mail" :size="13" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf-unread { display: inline-flex; align-items: center; gap: 5px; margin-left: 10px; font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; background: rgba(196,124,50,0.12); border: 0.5px solid rgba(196,124,50,0.30); color: var(--warn-orange); }
.nf-allread { background: transparent; border: 0; color: var(--teal-400); font-family: var(--font-sans); font-size: 12px; cursor: pointer; }
.nf-empty { padding: 32px; text-align: center; font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); }
.nf-row { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; cursor: pointer; transition: background .15s; }
.nf-row:hover { background: var(--surface-2) !important; }
/* конверт «прочитано/непрочитано» проявляется по hover строки (глоб. .notif-envelope = opacity 0) */
.nf-row:hover .notif-envelope { opacity: 1; }
.nf-row .notif-envelope { align-self: center; }
.nf-ic { width: 30px; height: 30px; border-radius: var(--r-md); background: var(--surface-2); border: 0.5px solid var(--border); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nf-title { display: flex; align-items: center; gap: 8px; font-family: var(--font-sans); font-size: 13px; color: var(--fg); }
.nf-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--warn-orange); }
.nf-text { display: block; font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.45; margin-top: 2px; }
.nf-time { display: block; font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 4px; letter-spacing: 0.04em; }
</style>
