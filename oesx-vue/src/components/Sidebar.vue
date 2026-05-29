<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '../icons';
import { ROUTE_DEFS, SIDEBAR_GROUPS, KIND_OPTIONS } from '../routes-def';
import { useAppState } from '../store';
import { OESDATA } from '../data';

const app = useAppState();
const route = useRoute();
const router = useRouter();

const collapsed = computed(() => app.state.sidebarCollapsed);
const isAdmin = computed(() => app.state.userRole === 'admin');
const currentId = computed(() => route.meta.id as string | undefined);

function defById(id: string) { return ROUTE_DEFS.find((r) => r.id === id); }
function go(id: string) {
  const d = defById(id);
  if (d) router.push(d.path);
}

// Create-дропдаун
const createOpen = ref(false);
const createRef = ref<HTMLElement | null>(null);
function onDown(e: MouseEvent) { if (createRef.value && !createRef.value.contains(e.target as Node)) createOpen.value = false; }
onMounted(() => document.addEventListener('mousedown', onDown));
onUnmounted(() => document.removeEventListener('mousedown', onDown));
function openCreate(kindId: string) {
  createOpen.value = false;
  router.push({ path: '/create', query: { kind: kindId } });
}

const limit = app.limitInfo;
const limitTone = computed(() => (limit.value.pct >= 100 ? 'danger' : limit.value.pct >= 80 ? 'warn' : ''));
const limitMaxLabel = (OESDATA.billing.limitTokens / 1_000_000).toFixed(1);
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <button class="sb-toggle" :data-tooltip="collapsed ? 'Развернуть меню' : 'Свернуть меню'" @click="app.toggleSidebar()">
      <Icon name="panel-left" :size="15" />
      <span v-if="!collapsed">Свернуть меню</span>
    </button>

    <div class="sb-divider" />

    <template v-for="(g, gi) in SIDEBAR_GROUPS" :key="gi">
      <template v-if="!(g.adminOnly && !isAdmin)">
        <div v-if="gi > 0" class="sb-divider" />

        <!-- Create -->
        <div v-if="g.create" ref="createRef" style="position: relative">
          <button
            class="sb-item sb-item-create"
            data-tooltip="Создать решение"
            :style="{ color: 'var(--teal-400)', background: createOpen ? 'var(--teal-dim)' : 'transparent', borderColor: createOpen ? 'var(--border-strong)' : 'transparent' }"
            @click="createOpen = !createOpen"
          >
            <Icon name="plus" :size="15" />
            <span>Создать решение</span>
            <Icon v-if="!collapsed" name="chevron-down" :size="12" :style="{ marginLeft: 'auto', transform: createOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }" />
          </button>
          <div v-if="createOpen" class="popover" :style="collapsed ? { top: '0', left: 'calc(100% + 6px)', width: '220px' } : { top: 'calc(100% + 4px)', left: '0', right: '0' }">
            <button v-for="k in KIND_OPTIONS" :key="k.id" class="popover-item" @click="openCreate(k.id)">
              <Icon :name="k.icon" :size="13" /> {{ k.label }}
            </button>
          </div>
        </div>

        <!-- Items -->
        <button
          v-for="id in g.items"
          :key="id"
          class="sb-item"
          :class="{ active: currentId === id }"
          :data-tooltip="defById(id)?.label"
          @click="go(id)"
        >
          <Icon v-if="defById(id)" :name="defById(id)!.icon" :size="15" />
          <span>{{ defById(id)?.label }}</span>
          <span v-if="defById(id)?.count" class="count">{{ defById(id)!.count!() }}</span>
        </button>
      </template>
    </template>

    <!-- Лимит токенов -->
    <div style="margin-top: auto; padding-top: 16px">
      <div v-if="collapsed" class="sb-limit-mini" style="display: flex; justify-content: center; padding: 8px 0" :data-tooltip="`Токены · ${limit.pct}%`">
        <span :style="{ width: '28px', height: '28px', borderRadius: '6px', background: limit.pct >= 80 ? 'rgba(196,124,50,0.10)' : 'var(--surface-2)', border: '0.5px solid ' + (limit.pct >= 80 ? 'rgba(196,124,50,0.30)' : 'var(--border)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: limit.pct >= 80 ? 'var(--warn-orange)' : 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600 }">{{ limit.pct }}%</span>
      </div>
      <div v-else style="margin: 12px 6px 4px; padding: 12px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: var(--r-md); display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--fg-muted); text-transform: uppercase">Токены · май</span>
          <span :style="{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: limit.pct >= 80 ? 'var(--warn-orange)' : 'var(--fg)' }">{{ limit.pct }}%</span>
        </div>
        <div class="lim-bar" :class="limitTone"><span :style="{ width: Math.min(100, limit.pct) + '%' }" /></div>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted)">
          <span>{{ (limit.used / 1_000_000).toFixed(2) }}M</span>
          <span>/ {{ limitMaxLabel }}M</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.lim-bar { height: 6px; background: var(--surface-3); border-radius: 2px; overflow: hidden; }
.lim-bar > span { display: block; height: 100%; background: var(--teal-400); border-radius: 2px; transition: width .4s var(--ease-apple); }
.lim-bar.warn > span { background: var(--warn-orange); }
.lim-bar.danger > span { background: var(--neg); }
</style>
