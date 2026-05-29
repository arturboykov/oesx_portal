<script setup lang="ts">
/* Администрирование — Фаза 2 (порт SectionAdmin): Домены (карточки) +
   Пользователи (PrimeVue DataTable с раскрытием строк и действиями). */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { Icon, CubeLogo, type IconName } from '../icons';
import { OESDATA, type User, type Domain } from '../data';

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
import { useAppState } from '../store';
const app = useAppState();

const tab = ref<'domains' | 'users'>('domains');

/* ── Домены ── */
const openDomain = ref<string | null>('excavators');
const addDomainOpen = ref(false);
const newDomain = ref({ name: '', desc: '' });
function toggleDomain(id: string) { openDomain.value = openDomain.value === id ? null : id; }
function createDomain() {
  addDomainOpen.value = false;
  toast.add({ severity: 'success', summary: 'Домен создан', detail: newDomain.value.name || 'новый домен', life: 3000 });
  newDomain.value = { name: '', desc: '' };
}

/* ── Пользователи ── */
const users = ref<User[]>(OESDATA.users.map((u) => ({ ...u })));
const search = ref('');
const expandedRows = ref<User[]>([]);
const list = computed(() =>
  users.value.filter((u) => !search.value || [u.name, u.position, u.email].some((f) => f.toLowerCase().includes(search.value.toLowerCase()))),
);

function roleMeta(role: string): { label: string; color: string; bg: string; b: string; icon: IconName } {
  const m: Record<string, { label: string; color: string; bg: string; b: string; icon: IconName }> = {
    admin: { label: 'Admin', color: 'var(--teal-400)', bg: 'rgba(29,184,154,0.10)', b: 'rgba(29,184,154,0.30)', icon: 'shield' },
    user: { label: 'User', color: 'var(--info)', bg: 'rgba(106,158,184,0.10)', b: 'rgba(106,158,184,0.30)', icon: 'user' },
    pending: { label: 'Pending', color: 'var(--warn-orange)', bg: 'rgba(196,124,50,0.10)', b: 'rgba(196,124,50,0.30)', icon: 'clock' },
  };
  return m[role] || m.user;
}
function domainName(id: string) { return OESDATA.domains.find((d) => d.id === id)?.name ?? id; }

function impersonate(u: User) {
  if (!u.active || u.role === 'pending') return;
  app.impersonate(u);
  toast.add({ severity: 'warn', summary: 'Вы вошли как ' + u.name, detail: 'Сессия имперсонации активна', life: 3000 });
  router.push('/settings');
}
function askDelete(u: User) {
  confirm.require({
    header: 'Удалить пользователя?',
    message: `«${u.name}» и его контейнер будут удалены.`,
    acceptLabel: 'Удалить', rejectLabel: 'Отмена', acceptClass: 'p-button-danger',
    accept: () => { users.value = users.value.filter((x) => x.id !== u.id); toast.add({ severity: 'success', summary: 'Пользователь удалён', detail: u.name, life: 3000 }); },
  });
}
function soon(what: string) { toast.add({ severity: 'info', summary: what, detail: 'Форма собирается в следующей фазе', life: 2500 }); }

function userAgents(u: User) {
  // В демо контейнерные агенты общие; имя основного синхронизировано с профилем.
  void u;
  return OESDATA.assistant.agents;
}
function domainApis(d: Domain) { return d.apis; }
</script>

<template>
  <div class="main fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">Администрирование</div>
        <div class="page-sub">Платформа OES X · домены, пользователи и доступы</div>
      </div>
      <Button label="Обновить" severity="secondary" size="small" @click="soon('Обновление платформы')"><template #icon><Icon name="refresh" :size="12" /></template></Button>
    </div>

    <div class="adm-tabs">
      <button class="adm-tab" :class="{ active: tab === 'domains' }" @click="tab = 'domains'">Домены · {{ OESDATA.domains.length }}</button>
      <button class="adm-tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">Пользователи · {{ users.length }}</button>
    </div>

    <!-- ── Домены ── -->
    <template v-if="tab === 'domains'">
      <div class="adm-bar">
        <span class="adm-bar-hint">Управление доменами и подключённые интеграции</span>
        <span style="flex: 1" />
        <Button label="Создать домен" size="small" @click="addDomainOpen = true"><template #icon><Icon name="plus" :size="12" /></template></Button>
      </div>

      <div v-for="d in OESDATA.domains" :key="d.id" class="dom-card" :class="{ open: openDomain === d.id }">
        <div class="dom-head" @click="toggleDomain(d.id)">
          <div class="dom-glyph"><CubeLogo :size="20" color="var(--teal-400)" /></div>
          <div style="flex: 1; min-width: 0">
            <div style="display: flex; align-items: center; gap: 10px">
              <span class="dom-name">{{ d.name }}</span>
              <span class="dom-active"><span class="dot dot-pos" /> {{ d.status }}</span>
            </div>
            <div v-if="openDomain !== d.id && d.desc" class="dom-desc">{{ d.desc }}</div>
          </div>
          <div style="display: flex; gap: 8px">
            <span class="dom-chip purple">{{ d.counts.llm }} LLM</span>
            <span class="dom-chip blue">{{ d.counts.channels }} КАНАЛ</span>
            <span class="dom-chip amber">{{ d.counts.api }} API</span>
          </div>
          <Icon name="chevron-down" :size="14" :style="{ color: 'var(--fg-muted)', transform: openDomain === d.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s', marginLeft: '8px' }" />
        </div>
        <div v-if="openDomain === d.id" class="dom-body">
          <div class="section-head"><span class="sh-title">Подключённые API · MCP</span><div class="sh-line" /></div>
          <div class="api-grid">
            <div v-for="a in domainApis(d)" :key="a.id" class="api-row">
              <span class="api-label">{{ a.label }}</span>
              <span class="api-pill"><span class="dot dot-pos" /> {{ a.state }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Пользователи ── -->
    <template v-else>
      <div class="adm-bar">
        <div class="search-box">
          <Icon name="search" :size="12" />
          <input v-model="search" placeholder="Поиск по имени, должности или email" />
        </div>
        <span class="adm-count">{{ list.length }} из {{ users.length }}</span>
        <span style="flex: 1" />
        <Button label="Добавить пользователя" size="small" @click="soon('Добавление пользователя')"><template #icon><Icon name="plus" :size="12" /></template></Button>
      </div>

      <DataTable :value="list" dataKey="id" rowHover removableSort v-model:expandedRows="expandedRows" class="adm-table">
        <Column expander :style="{ width: '40px' }" />
        <Column field="name" header="Пользователь" sortable :style="{ minWidth: '240px' }">
          <template #body="{ data }">
            <div class="usr-cell">
              <span class="usr-ava">{{ data.initials }}</span>
              <div style="min-width: 0">
                <div class="usr-name">{{ data.name }}</div>
                <div class="usr-email">{{ data.email }}</div>
              </div>
            </div>
          </template>
        </Column>
        <Column field="position" header="Должность" sortable :style="{ width: '160px' }">
          <template #body="{ data }"><span class="usr-pos">{{ data.position }}</span></template>
        </Column>
        <Column field="role" header="Роль" sortable :style="{ width: '120px' }">
          <template #body="{ data }">
            <span class="role-pill" :style="{ color: roleMeta(data.role).color, background: roleMeta(data.role).bg, borderColor: roleMeta(data.role).b }">
              <Icon :name="roleMeta(data.role).icon" :size="10" /> {{ roleMeta(data.role).label }}
            </span>
          </template>
        </Column>
        <Column header="Домены" :style="{ width: '160px' }">
          <template #body="{ data }">
            <div style="display: flex; flex-wrap: wrap; gap: 4px">
              <span v-if="!data.domains.length" style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted)">—</span>
              <span v-for="did in data.domains" :key="did" class="dom-chip teal">{{ did }}</span>
            </div>
          </template>
        </Column>
        <Column field="active" header="Статус" sortable :style="{ width: '110px' }">
          <template #body="{ data }">
            <span class="usr-status" :style="{ color: data.active ? 'var(--pos)' : 'var(--fg-muted)' }">
              <span class="dot" :class="{ 'dot-pos': data.active }" :style="!data.active ? { background: 'var(--fg-muted)' } : {}" />
              {{ data.active ? 'активен' : 'off' }}
            </span>
          </template>
        </Column>
        <Column header="Действия" :style="{ width: '120px' }">
          <template #body="{ data }">
            <div style="display: flex; gap: 6px; justify-content: flex-end">
              <button class="icon-btn usr-act" style="color: var(--warn-orange)" title="Войти под этим пользователем" :disabled="!data.active || data.role === 'pending'" @click="impersonate(data)"><Icon name="log-out" :size="12" /></button>
              <button class="icon-btn usr-act" title="Редактировать" @click="soon('Редактор пользователя')"><Icon name="edit" :size="12" /></button>
              <button class="icon-btn usr-act" title="Удалить" @click="askDelete(data)"><Icon name="trash" :size="12" /></button>
            </div>
          </template>
        </Column>

        <template #expansion="{ data }">
          <div class="usr-exp">
            <div class="usr-exp-col">
              <div class="usr-exp-cap">Агенты контейнера</div>
              <div v-for="ag in userAgents(data)" :key="ag.name" class="usr-exp-agent">
                <span class="usr-exp-agent-n">{{ ag.name }}</span>
                <span class="usr-exp-agent-m">{{ ag.model }}</span>
              </div>
            </div>
            <div class="usr-exp-col">
              <div class="usr-exp-cap">Домены</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px">
                <span v-if="!data.domains.length" style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted)">нет доступа</span>
                <span v-for="did in data.domains" :key="did" class="dom-chip teal">{{ domainName(did) }}</span>
              </div>
            </div>
          </div>
        </template>

        <template #empty><div style="padding: 28px; text-align: center; color: var(--fg-muted); font-family: var(--font-sans); font-size: 13px">Ничего не найдено</div></template>
      </DataTable>
    </template>

    <!-- Создать домен -->
    <Dialog v-model:visible="addDomainOpen" modal header="Создание домена" :style="{ width: '460px' }">
      <div class="req-field">
        <label class="field-label">Имя домена *</label>
        <InputText v-model="newDomain.name" placeholder="например, logistics" style="width: 100%" />
      </div>
      <div class="req-field">
        <label class="field-label">Описание</label>
        <InputText v-model="newDomain.desc" placeholder="Логистика — внутренние перевозки" style="width: 100%" />
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" text @click="addDomainOpen = false" />
        <Button label="Создать" :disabled="!newDomain.name.trim()" @click="createDomain" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.adm-tabs { display: flex; gap: 2px; margin-bottom: 16px; border-bottom: 0.5px solid var(--border); }
.adm-tab { padding: 9px 14px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--fg-muted); background: transparent; border: 0; border-bottom: 2px solid transparent; cursor: pointer; position: relative; bottom: -0.5px; }
.adm-tab:hover { color: var(--fg); }
.adm-tab.active { color: var(--teal-400); border-bottom-color: var(--teal-400); }

.adm-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.adm-bar-hint { font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); }
.adm-count { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); }
.search-box { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--r-md); width: 320px; color: var(--fg-muted); }
.search-box input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-family: var(--font-sans); font-size: 13px; color: var(--fg); }

/* Domain cards */
.dom-card { background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--r-lg); margin-bottom: 10px; overflow: hidden; transition: border-color .15s; }
.dom-card.open { border-color: var(--border-strong); }
.dom-head { display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; }
.dom-glyph { width: 36px; height: 36px; border-radius: var(--r-md); background: var(--teal-dim); border: 0.5px solid var(--border-strong); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dom-name { font-family: var(--font-sans); font-size: 16px; font-weight: 500; color: var(--fg); letter-spacing: -0.01em; }
.dom-active { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; color: var(--pos); }
.dom-desc { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); margin-top: 3px; }
.dom-body { padding: 4px 18px 20px; }
.dom-chip { font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 8px; border-radius: var(--r-xs); background: var(--surface-2); border: 0.5px solid var(--border); color: var(--fg); }
.dom-chip.purple { background: rgba(140,100,200,0.12); border-color: rgba(140,100,200,0.28); color: #B98BE0; }
.dom-chip.teal { background: rgba(29,184,154,0.10); border-color: rgba(29,184,154,0.30); color: var(--teal-400); }
.dom-chip.amber { background: rgba(196,124,50,0.10); border-color: rgba(196,124,50,0.30); color: var(--warn-orange); }
.dom-chip.blue { background: rgba(54,100,165,0.10); border-color: rgba(54,100,165,0.30); color: var(--info); }
.api-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.api-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: var(--r-md); }
.api-label { flex: 1; font-family: var(--font-sans); font-size: 12px; color: var(--fg); }
.api-pill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: rgba(29,184,154,0.10); border: 0.5px solid rgba(29,184,154,0.30); color: var(--pos); }

/* Users table */
.usr-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.usr-ava { width: 28px; height: 28px; border-radius: 999px; background: linear-gradient(135deg, var(--teal-600), var(--teal-400)); color: var(--fg-on-teal); display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 10px; font-weight: 600; flex-shrink: 0; }
.usr-name { font-family: var(--font-sans); font-size: 13px; color: var(--fg); font-weight: 500; }
.usr-email { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
.usr-pos { font-family: var(--font-sans); font-size: 12px; color: var(--fg); }
.role-pill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; padding: 4px 9px; border-radius: var(--r-xs); border: 0.5px solid; }
.usr-status { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; }
.usr-act { width: 28px; height: 28px; }
.usr-act:disabled { opacity: 0.4; cursor: not-allowed; }
.usr-exp { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 8px 8px 16px; }
.usr-exp-cap { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: 10px; }
.usr-exp-agent { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 0.5px solid var(--border); }
.usr-exp-agent-n { font-family: var(--font-sans); font-size: 13px; color: var(--fg); }
.usr-exp-agent-m { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
.req-field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }

:deep(.p-datatable-thead > tr > th) { border-top: 0; border-left: 0; border-right: 0; border-bottom: 0.5px solid var(--border-strong); padding: 10px 16px; }
:deep(.p-datatable-tbody > tr > td) { border-top: 0; border-left: 0; border-right: 0; border-bottom: 0.5px solid var(--border); padding: 12px 16px; }
</style>
