<script setup lang="ts">
/* Аккаунт — референс-страница Фазы 1. Полностью собрана вкладка «Профиль»
   (порт SettingsProfile из various.jsx). Остальные вкладки — заглушки,
   наполняются в следующих фазах. */
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import { Icon } from '../icons';
import type { IconName } from '../icons';
import Field from '../components/Field.vue';
import Chip from '../components/Chip.vue';
import { currentMe } from '../user';
import { OESDATA } from '../data';
import { useAppState } from '../store';

const app = useAppState();
const toast = useToast();

const me = computed(() => currentMe(app.state.userRole, app.state.impersonating));
const userRecord = computed(() => OESDATA.users.find((u) => u.name === me.value.name) || OESDATA.users[0]);
const agents = computed(() => app.state.agents);

const tab = ref<'profile' | 'agent' | 'channels' | 'sources' | 'security' | 'notify'>('profile');
const connectedChannels = OESDATA.channels.filter((c) => c.state === 'connected').length;
const grantedSources = OESDATA.sources.filter((s) => s.granted).length;

interface TabDef { id: typeof tab.value; label: string; icon: IconName; count?: number }
const tabs: TabDef[] = [
  { id: 'profile', label: 'Профиль', icon: 'user' },
  { id: 'agent', label: 'Настройки агента', icon: 'cpu' },
  { id: 'channels', label: 'Каналы', icon: 'link', count: connectedChannels },
  { id: 'sources', label: 'Источники данных', icon: 'database', count: grantedSources },
  { id: 'security', label: 'Безопасность', icon: 'shield' },
  { id: 'notify', label: 'Уведомления', icon: 'bell' },
];

const hoverAgent = ref<string | null>(null);
const dockerShort = computed(() => (userRecord.value.dockerId || '').slice(0, 24) + '…');
const volume = computed(() => `openclaw-${userRecord.value.uuid}`);

function makePrimary(name: string) {
  app.setPrimaryAgent(name);
  toast.add({ severity: 'success', summary: 'Основной агент изменён', detail: name, life: 3000 });
}
function refreshContainer() {
  toast.add({ severity: 'success', summary: 'Статус контейнера обновлён', detail: 'Running', life: 3000 });
}
</script>

<template>
  <div class="main main-narrow fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">Аккаунт</div>
        <div class="page-sub">Профиль · настройки агента · каналы · источники данных · безопасность</div>
      </div>
    </div>

    <div class="acc-tabs">
      <button v-for="t in tabs" :key="t.id" class="acc-tab" :class="{ active: tab === t.id }" @click="tab = t.id">
        <Icon :name="t.icon" :size="13" />
        <span>{{ t.label }}</span>
        <span v-if="t.count != null" class="acc-count">· {{ t.count }}</span>
      </button>
    </div>

    <!-- ── Профиль ──────────────────────────────────────────────── -->
    <template v-if="tab === 'profile'">
      <div class="section-head"><span class="sh-title">Профиль</span><div class="sh-line" /></div>
      <div class="card" style="display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: center">
        <div class="profile-avatar">{{ me.initials }}</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px">
          <Field label="ФИО" :value="me.name" />
          <Field label="Email (SSO)" :value="me.email" />
          <Field label="Должность" :value="me.role" />
          <Field label="Роль" :value="me.systemRole === 'admin' ? 'Администратор' : 'Пользователь'" />
          <Field label="Подразделение" :value="me.department" />
          <Field label="Workspace ID" :value="me.workspaceId" mono />
          <Field label="Workspace создан" :value="me.workspaceCreatedAt" mono />
        </div>
      </div>

      <!-- Окружение -->
      <div class="section-head"><span class="sh-title">Окружение</span><div class="sh-line" /></div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px">
        <!-- Пользователь -->
        <div class="card" style="padding: 0; overflow: hidden">
          <div class="env-head"><span class="env-cap">Пользователь</span></div>
          <div class="env-body">
            <div class="env-row"><span class="env-key">ID</span><span class="env-val" :title="userRecord.uuid">{{ userRecord.uuid }}</span></div>
            <div class="env-row"><span class="env-key">Email</span><span class="env-val">{{ userRecord.email }}</span></div>
            <div class="env-row"><span class="env-key">Создан</span><span class="env-val">{{ userRecord.containerCreated }}</span></div>
          </div>
        </div>
        <!-- Контейнер -->
        <div class="card" style="padding: 0; overflow: hidden">
          <div class="env-head">
            <span class="env-cap">Контейнер</span>
            <span class="env-pill"><span class="dot dot-pos" /> Running</span>
            <span style="flex: 1" />
            <button class="env-refresh" @click="refreshContainer">Обновить</button>
          </div>
          <div class="env-body">
            <div class="env-row"><span class="env-key">Docker ID</span><span class="env-val" :title="userRecord.dockerId">{{ dockerShort }}</span></div>
            <div class="env-row"><span class="env-key">Volume</span><span class="env-val" :title="volume">{{ volume }}</span></div>
          </div>
        </div>
      </div>

      <!-- Агенты -->
      <div class="card" style="padding: 0; overflow: hidden; margin-top: 14px">
        <div class="env-head"><span class="env-cap">Агенты · {{ agents.length }}</span></div>
        <div>
          <div
            v-for="(ag, i) in agents"
            :key="ag.name"
            class="agent-row"
            :style="{ borderBottom: i < agents.length - 1 ? '0.5px solid var(--border)' : 'none', background: ag.primary ? 'rgba(29,184,154,0.04)' : 'transparent' }"
            @mouseenter="hoverAgent = ag.name"
            @mouseleave="hoverAgent = hoverAgent === ag.name ? null : hoverAgent"
          >
            <div style="flex: 1; min-width: 0">
              <div class="agent-name">
                {{ ag.name }}
                <span v-if="ag.primary" class="agent-primary"><span class="dot dot-pos" /> Основной</span>
              </div>
              <div class="agent-role">{{ ag.role }}</div>
            </div>
            <Button v-if="!ag.primary && hoverAgent === ag.name" size="small" text @click="makePrimary(ag.name)">
              <Icon name="check" :size="11" /> &nbsp;Сделать основным
            </Button>
            <Chip :kind="ag.primary ? 'neutral' : 'command'">{{ ag.model }}</Chip>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Прочие вкладки (заглушки Фазы 1) ─────────────────────── -->
    <template v-else>
      <div class="card tab-stub">
        <Icon :name="tabs.find((t) => t.id === tab)!.icon" :size="24" />
        <div class="tab-stub-title">«{{ tabs.find((t) => t.id === tab)?.label }}» — в следующей фазе</div>
        <div class="tab-stub-text">
          Вкладка переносится из React-прототипа по тому же образцу, что и «Профиль»:
          компоненты PrimeVue + bespoke-атомы на токенах OES X.
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-avatar {
  width: 64px; height: 64px; border-radius: 999px;
  background: linear-gradient(135deg, var(--teal-600), var(--teal-400));
  color: var(--fg-on-teal);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 22px; font-weight: 600;
}
.env-head { display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-bottom: 0.5px solid var(--border); }
.env-cap { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted); }
.env-pill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 999px; background: rgba(29,184,154,0.10); border: 0.5px solid rgba(29,184,154,0.30); color: var(--pos); }
.env-refresh { font-family: var(--font-sans); font-size: 12px; color: var(--teal-400); background: transparent; border: 0; cursor: pointer; }
.env-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
.env-row { display: flex; align-items: center; gap: 12px; }
.env-key { flex: 1; font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); }
.env-val { font-family: var(--font-mono); font-size: 11px; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; }

.agent-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; transition: background 120ms ease; }
.agent-name { font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg); display: flex; align-items: center; gap: 8px; }
.agent-primary { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; background: rgba(29,184,154,0.12); border: 0.5px solid rgba(29,184,154,0.32); color: var(--pos); }
.agent-role { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 2px; }

.tab-stub { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 48px 24px; color: var(--fg-muted); }
.tab-stub-title { font-family: var(--font-sans); font-size: 15px; font-weight: 500; color: var(--fg); }
.tab-stub-text { font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); line-height: 1.6; max-width: 460px; }
</style>
