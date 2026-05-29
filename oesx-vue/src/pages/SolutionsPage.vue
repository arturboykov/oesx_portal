<script setup lang="ts">
/* Решения — флагман Фазы 2 на PrimeVue DataTable (порт SectionSolutions). */
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import type { MenuItem } from 'primevue/menuitem';
import { Icon, type IconName } from '../icons';
import KindChip from '../components/KindChip.vue';
import { OESDATA, type Solution } from '../data';
import { currentMe } from '../user';
import { useAppState } from '../store';
import { downloadCSV } from '../utils';

const toast = useToast();
const confirm = useConfirm();
const app = useAppState();

const me = computed(() => currentMe(app.state.userRole));
const isAdmin = computed(() => me.value.systemRole === 'admin');

const sols = ref<Solution[]>(OESDATA.solutions.map((s) => ({ ...s })));
const scope = ref<'all' | 'mine' | 'granted'>('all');
// «Алерт» и «Команда» объединены в «Автоматизацию» (см. KindChip).
const kind = ref<'all' | 'dash' | 'automation'>('all');
const search = ref('');

const KIND_LABEL_RU: Record<string, string> = { dash: 'Дашборд', alert: 'Автоматизация', command: 'Автоматизация' };
const isAutomation = (s: Solution) => s.kind === 'alert' || s.kind === 'command';
const matchesKind = (s: Solution) => kind.value === 'all' || (kind.value === 'dash' ? s.kind === 'dash' : isAutomation(s));

const inScope = (s: Solution) => (scope.value === 'all' ? true : scope.value === 'mine' ? s.author === me.value.name : s.author !== me.value.name);
const list = computed(() =>
  sols.value.filter((s) => inScope(s) && matchesKind(s) && (search.value === '' || s.name.toLowerCase().includes(search.value.toLowerCase()))),
);

const scoped = computed(() => sols.value.filter(inScope));
const scopeOptions = computed(() => [
  { label: `Все · ${sols.value.length}`, value: 'all' },
  { label: `Мои решения · ${sols.value.filter((s) => s.author === me.value.name).length}`, value: 'mine' },
  { label: `Предоставлен доступ · ${sols.value.filter((s) => s.author !== me.value.name).length}`, value: 'granted' },
]);
const kindOptions = computed(() => [
  { label: `Все виды · ${scoped.value.length}`, value: 'all' },
  { label: `Дашборды · ${scoped.value.filter((s) => s.kind === 'dash').length}`, value: 'dash' },
  { label: `Автоматизации · ${scoped.value.filter(isAutomation).length}`, value: 'automation' },
]);

function setScope(v: string) { scope.value = v as typeof scope.value; }
function setKind(v: string) { kind.value = v as typeof kind.value; }

function versionDate(s: Solution) { return OESDATA.versionMap[s.id]?.[0]?.date ?? s.updated; }
function authorInitials(s: Solution) { return s.authorInitials || '—'; }
function isOwner(s: Solution) { return s.author === me.value.name; }

function toggleEnabled(s: Solution) {
  const row = sols.value.find((x) => x.id === s.id);
  if (!row) return;
  row.enabled = !row.enabled;
  toast.add({ severity: 'success', summary: row.enabled ? 'Решение включено' : 'Решение отключено', detail: row.name, life: 3000 });
}

// Меню действий (одна popup-инстанция, модель строится под строку)
type OesMenuItem = MenuItem & { oesIcon?: IconName; oesDanger?: boolean };
const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = ref<OesMenuItem[]>([]);
function openMenu(event: MouseEvent, s: Solution) {
  const canEdit = isAdmin.value || isOwner(s);
  const items: OesMenuItem[] = [
    { label: 'Просмотр', oesIcon: 'eye', command: () => soon('Просмотр решения') },
    canEdit
      ? { label: 'Редактировать', oesIcon: 'edit', command: () => soon('Редактор решения') }
      : { label: 'Форкнуть в чат', oesIcon: 'fork', command: () => soon('Форк в чат') },
  ];
  if (s.published) items.push({ label: 'Поделиться', oesIcon: 'share', command: () => openShare(s) });
  if (canEdit) items.push({ label: s.enabled ? 'Отключить' : 'Включить', oesIcon: s.enabled ? 'pause' : 'play', command: () => toggleEnabled(s) });
  if (canEdit) items.push({ separator: true }, { label: 'Удалить', oesIcon: 'trash', oesDanger: true, command: () => askDelete(s) });
  menuItems.value = items;
  menu.value?.toggle(event);
}

// Подсказка справа от toggle (порт из React)
const scopeHint = computed(() =>
  scope.value === 'mine'
    ? `${me.value.name} · можно редактировать`
    : scope.value === 'granted'
      ? 'Чужие решения · просмотр и форк'
      : `Все решения подразделения · ${isAdmin.value ? 'у вас полный доступ' : 'чужие — только просмотр или форк'}`,
);
function soon(what: string) { toast.add({ severity: 'info', summary: what, detail: 'Экран собирается в следующей фазе', life: 2500 }); }

function askDelete(s: Solution) {
  confirm.require({
    header: 'Удалить решение?',
    message: `«${s.name}» будет удалено без возможности восстановления.`,
    acceptLabel: 'Удалить',
    rejectLabel: 'Отмена',
    acceptClass: 'p-button-danger',
    accept: () => {
      sols.value = sols.value.filter((x) => x.id !== s.id);
      toast.add({ severity: 'success', summary: 'Решение удалено', detail: s.name, life: 4000 });
    },
  });
}

// Поделиться
const shareOpen = ref(false);
const shareSol = ref<Solution | null>(null);
const selectedUsers = ref<string[]>([]);
const shareUsers = computed(() => OESDATA.users.filter((u) => u.name !== me.value.name && u.role !== 'pending'));
function openShare(s: Solution) { shareSol.value = s; selectedUsers.value = []; shareOpen.value = true; }
function doShare() {
  const n = selectedUsers.value.length;
  shareOpen.value = false;
  toast.add({ severity: 'success', summary: 'Доступ предоставлен', detail: `«${shareSol.value?.name}» · ${n} польз.`, life: 3000 });
}

function exportCSV() {
  downloadCSV(
    'oes-x-решения.csv',
    ['Решение', 'Тип', 'Автор', 'Версия', 'Запусков', 'Статус', 'Активно'],
    list.value.map((s) => [s.name, KIND_LABEL_RU[s.kind] ?? s.kind, s.author, 'v' + s.version, s.runs, s.published ? 'опубликовано' : 'черновик', s.enabled ? 'да' : 'нет']),
  );
  toast.add({ severity: 'success', summary: 'Таблица выгружена', detail: `${list.value.length} строк · CSV`, life: 3000 });
}
</script>

<template>
  <div class="main fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">Решения</div>
        <div class="page-sub">Каталог артефактов · Workspace {{ OESDATA.me.workspaceId }}</div>
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="Экспорт" severity="secondary" size="small" @click="exportCSV"><template #icon><Icon name="download" :size="13" /></template></Button>
        <Button label="Создать решение" size="small" @click="soon('Создание решения')"><template #icon><Icon name="plus" :size="13" /></template></Button>
      </div>
    </div>

    <!-- Scope toggle -->
    <div class="sol-scope-row">
      <div class="seg">
        <button v-for="o in scopeOptions" :key="o.value" class="seg-btn" :class="{ active: scope === o.value }" @click="setScope(o.value)">{{ o.label }}</button>
      </div>
      <span class="sol-hint">{{ scopeHint }}</span>
    </div>

    <!-- Type tabs + поиск -->
    <div class="sol-tabs-row">
      <div class="sol-tabs">
        <button v-for="o in kindOptions" :key="o.value" class="sol-tab" :class="{ active: kind === o.value }" @click="setKind(o.value)">{{ o.label }}</button>
      </div>
      <span style="flex: 1" />
      <div class="search-box">
        <Icon name="search" :size="12" />
        <input v-model="search" placeholder="Поиск…" />
      </div>
    </div>

    <!-- Таблица -->
    <DataTable :value="list" dataKey="id" rowHover removableSort class="sol-table">
      <Column header="" :style="{ width: '40px' }" :pt="{ headerCell: { style: 'padding-left:16px' } }">
        <template #body="{ data }">
          <span class="sol-dot" :class="{ on: data.enabled }" :title="data.enabled ? 'Активно' : 'Выключено'" />
        </template>
      </Column>

      <Column field="name" header="Решение" sortable :style="{ minWidth: '240px' }">
        <template #body="{ data }">
          <div class="sol-name">
            <span class="sol-name-t">{{ data.name }}</span>
            <Icon v-if="data.shared" name="share" :size="11" style="color: var(--pos)" />
            <Icon v-if="data.forkOf" name="fork" :size="11" style="color: var(--info)" />
          </div>
          <div class="sol-desc">{{ data.desc }}</div>
        </template>
      </Column>

      <Column field="kind" header="Тип" sortable :style="{ width: '130px' }">
        <template #body="{ data }"><KindChip :kind="data.kind" /></template>
      </Column>

      <Column field="author" header="Автор" sortable :style="{ width: '180px' }">
        <template #body="{ data }">
          <div class="sol-author">
            <span class="sol-ava" :class="{ owner: isOwner(data) }">{{ authorInitials(data) }}</span>
            <span class="sol-author-n" :style="{ color: isOwner(data) ? 'var(--teal-400)' : 'var(--fg)' }">{{ data.author }}</span>
          </div>
        </template>
      </Column>

      <Column header="Версия" :style="{ width: '130px' }">
        <template #body="{ data }">
          <span class="sol-ver"><Icon name="git-branch" :size="10" /> v{{ data.version }}</span>
          <div class="sol-verdate">{{ versionDate(data) }}</div>
        </template>
      </Column>

      <Column field="runs" header="Запусков" sortable :style="{ width: '90px' }">
        <template #body="{ data }"><span class="sol-runs">{{ data.runs.toLocaleString('ru') }}</span></template>
      </Column>

      <Column field="published" header="Статус" sortable :style="{ width: '140px' }">
        <template #body="{ data }">
          <span class="sol-status" :style="{ color: data.published ? 'var(--pos)' : 'var(--fg-muted)' }">
            <Icon :name="data.published ? 'check' : 'edit'" :size="11" />
            {{ data.published ? 'опубликовано' : 'черновик' }}
          </span>
        </template>
      </Column>

      <Column :style="{ width: '48px' }">
        <template #body="{ data }">
          <button class="icon-btn sol-more" aria-label="Действия" title="Действия" @click="openMenu($event, data)">
            <Icon name="more-h" :size="13" />
          </button>
        </template>
      </Column>

      <template #empty>
        <div style="padding: 28px; text-align: center; color: var(--fg-muted); font-family: var(--font-sans); font-size: 13px">Ничего не найдено</div>
      </template>
    </DataTable>

    <Menu ref="menu" :model="menuItems" popup>
      <template #item="{ item, props }">
        <a class="oes-menu-item" :class="{ danger: (item as OesMenuItem).oesDanger }" v-bind="props.action">
          <Icon v-if="(item as OesMenuItem).oesIcon" :name="(item as OesMenuItem).oesIcon!" :size="13" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <!-- Поделиться -->
    <Dialog v-model:visible="shareOpen" modal header="Поделиться решением" :style="{ width: '440px' }">
      <div style="font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); margin-bottom: 14px">
        Выберите пользователей, которым предоставить доступ на просмотр «{{ shareSol?.name }}».
      </div>
      <div class="share-list">
        <label v-for="u in shareUsers" :key="u.id" class="share-row">
          <Checkbox v-model="selectedUsers" :value="u.id" :inputId="u.id" />
          <span class="sol-ava">{{ u.initials }}</span>
          <span style="flex: 1; min-width: 0">
            <span style="display: block; font-family: var(--font-sans); font-size: 13px; color: var(--fg)">{{ u.name }}</span>
            <span style="display: block; font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted)">{{ u.position }}</span>
          </span>
        </label>
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" text @click="shareOpen = false" />
        <Button label="Предоставить доступ" :disabled="selectedUsers.length === 0" @click="doShare" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Scope toggle (segmented) */
.sol-scope-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.seg { display: inline-flex; padding: 3px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: var(--r-md); }
.seg-btn { padding: 5px 13px; border-radius: 4px; background: transparent; border: 0.5px solid transparent; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--fg-muted); cursor: pointer; transition: all .15s var(--ease-apple); white-space: nowrap; }
.seg-btn.active { background: var(--surface); border-color: var(--border-strong); color: var(--teal-400); }
.sol-hint { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); letter-spacing: 0.06em; }

/* Type tabs (underline) */
.sol-tabs-row { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 16px; border-bottom: 0.5px solid var(--border); }
.sol-tabs { display: flex; gap: 2px; }
.sol-tab { padding: 8px 14px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--fg-muted); background: transparent; border: 0; border-bottom: 2px solid transparent; cursor: pointer; transition: color .15s; position: relative; bottom: -0.5px; white-space: nowrap; }
.sol-tab:hover { color: var(--fg); }
.sol-tab.active { color: var(--teal-400); border-bottom-color: var(--teal-400); }

/* Search */
.search-box { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: var(--r-sm); width: 220px; color: var(--fg-muted); margin-bottom: 6px; }
.search-box input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-family: var(--font-sans); font-size: 12px; color: var(--fg); }

/* Menu item с иконкой */
.oes-menu-item { display: flex; align-items: center; gap: 9px; }
/* Красный остаётся и на hover (мост перекрашивает контент в --fg). */
.oes-menu-item.danger,
.oes-menu-item.danger:hover { color: var(--neg) !important; }

/* Таблица: шапка без боковых/верхних бордеров — только нижний, как у строк */
:deep(.p-datatable-thead > tr > th) { border-top: 0; border-left: 0; border-right: 0; border-bottom: 0.5px solid var(--border-strong); padding: 10px 16px; }
:deep(.p-datatable-tbody > tr > td) { border-top: 0; border-left: 0; border-right: 0; border-bottom: 0.5px solid var(--border); padding: 12px 16px; }

.sol-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; background: var(--fg-dim); opacity: 0.45; }
.sol-dot.on { background: var(--pos); box-shadow: 0 0 6px rgba(29,184,154,0.55); opacity: 1; }
.sol-name { display: flex; align-items: center; gap: 6px; font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg); margin-bottom: 4px; }
.sol-name-t { overflow: hidden; text-overflow: ellipsis; }
.sol-desc { font-family: var(--font-sans); font-size: 11px; color: var(--fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.sol-author { display: flex; align-items: center; gap: 7px; min-width: 0; }
.sol-ava { width: 22px; height: 22px; border-radius: 999px; flex-shrink: 0; background: var(--surface-2); color: var(--fg-muted); border: 0.5px solid var(--border); display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 9px; font-weight: 600; }
.sol-ava.owner { background: linear-gradient(135deg, var(--teal-600), var(--teal-400)); color: var(--fg-on-teal); border-color: var(--teal-400); }
.sol-author-n { font-family: var(--font-sans); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sol-ver { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 4px; background: var(--teal-dim); border: 0.5px solid var(--border-strong); color: var(--teal-400); font-family: var(--font-mono); font-size: 11px; }
.sol-verdate { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 3px; white-space: nowrap; }
.sol-runs { font-family: var(--font-mono); font-size: 12px; color: var(--fg); }
.sol-status { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; }
.sol-more { width: 26px; height: 26px; }
.share-list { display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; }
.share-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--r-sm); cursor: pointer; }
.share-row:hover { background: var(--surface-2); }
</style>
