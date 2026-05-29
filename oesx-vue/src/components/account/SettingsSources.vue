<script setup lang="ts">
/* Источники данных (порт SettingsSources): группировка по доменам + MCP. */
import { ref, computed } from 'vue';
import Chip from '../Chip.vue';
import SourceKind from '../SourceKind.vue';
import { Icon, CubeLogo } from '../../icons';
import { OESDATA, type Source, type Domain } from '../../data';
import { currentMe } from '../../user';
import { useAppState } from '../../store';

const app = useAppState();
const me = computed(() => currentMe(app.state.userRole, app.state.impersonating));

// Статическая привязка источник → домен (порт groupSourcesByDomain).
const SRC_DOMAIN: Record<string, string> = {
  'oes_dispatch.cycles': 'excavators', 'oes_dispatch.equipment': 'excavators', 'oes_dispatch.shift_kpis': 'excavators',
  'oes_dispatch.events': 'excavators', 'oes_dispatch.balance': 'excavators', 'oes_budget.daily': 'excavators',
  'knowledge_base.maintenance': 'excavators', 'knowledge_base.regulations': 'excavators',
  'fuel_logs.daily': 'port', 'hr_ats.candidates': 'port',
};

interface Group { domain: Domain; sources: Source[]; mcps: { id: string; label: string; state: string }[] }
const groups = computed<Group[]>(() => {
  const ids = me.value.domains ?? ['excavators'];
  return OESDATA.domains
    .filter((d) => ids.includes(d.id))
    .map((d) => ({ domain: d, sources: OESDATA.sources.filter((s) => SRC_DOMAIN[s.id] === d.id && s.granted), mcps: d.apis }));
});

const openIds = ref<string[]>([]);
// открыть все по умолчанию
openIds.value = OESDATA.domains.map((d) => d.id);
function toggle(id: string) { openIds.value = openIds.value.includes(id) ? openIds.value.filter((x) => x !== id) : [...openIds.value, id]; }
</script>

<template>
  <div>
    <div class="section-head">
      <span class="sh-title">Источники данных</span>
      <span class="sh-count">{{ groups.length }} {{ groups.length === 1 ? 'домен' : 'домена' }}</span>
      <div class="sh-line" />
    </div>

    <div class="sd-banner">
      <Icon name="shield" :size="16" style="color: var(--teal-400)" />
      <div>Источники сгруппированы по доменам, к которым у вас выдан доступ. Свои саб-агенты и MCP/API настраиваются во вкладке «Настройки агента».</div>
    </div>

    <div v-for="g in groups" :key="g.domain.id" class="sd-domain">
      <div class="sd-head" @click="toggle(g.domain.id)">
        <div class="sd-glyph"><CubeLogo :size="18" color="var(--teal-400)" /></div>
        <div style="flex: 1; min-width: 0">
          <div style="display: flex; align-items: center; gap: 10px">
            <span class="sd-name">{{ g.domain.name }}</span>
            <span class="sd-status">{{ g.domain.status }}</span>
          </div>
          <div class="sd-desc">{{ g.domain.desc }}</div>
        </div>
        <div style="display: flex; gap: 6px">
          <Chip kind="neutral">{{ g.sources.length }} ИСТОЧНИКОВ</Chip>
          <Chip kind="neutral">{{ g.mcps.length }} MCP</Chip>
        </div>
        <Icon name="chevron-down" :size="14" :style="{ color: 'var(--fg-muted)', transform: openIds.includes(g.domain.id) ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }" />
      </div>

      <div v-if="openIds.includes(g.domain.id)" class="sd-body">
        <div class="sd-srchead">
          <span>Тип</span><span>Источник</span><span>ID</span><span style="text-align: right">Объём</span><span>Режим</span>
        </div>
        <div v-if="!g.sources.length" class="sd-empty">Нет подключённых источников в этом домене</div>
        <div v-for="s in g.sources" :key="s.id" class="sd-row">
          <SourceKind :kind="s.kind" />
          <span class="sd-srcname">{{ s.name }}</span>
          <span class="sd-mono-muted">{{ s.id }}</span>
          <span class="sd-mono" style="text-align: right">{{ s.rows }}</span>
          <span class="sd-ro"><Icon name="lock" :size="10" /> read-only</span>
        </div>

        <template v-if="g.mcps.length">
          <div class="sd-subhead">MCP · {{ g.mcps.length }}</div>
          <div v-for="m in g.mcps" :key="m.id" class="sd-mcp">
            <span class="sd-mcp-ic"><Icon name="wrench" :size="14" /></span>
            <div style="flex: 1; min-width: 0">
              <div class="sd-srcname">{{ m.label }}</div>
              <div class="sd-mono-muted">{{ m.id }}</div>
            </div>
            <Chip kind="pos" dot>{{ m.state }}</Chip>
          </div>
        </template>

        <div class="sd-domsettings">
          <span class="sd-domsettings-cap">Настройки домена</span>
          <Chip kind="neutral">{{ g.domain.llm.primary }}</Chip>
        </div>
      </div>
    </div>

    <div v-if="!groups.length" class="sd-none">У вас нет подключённых доменов. Обратитесь к ИТ-администратору.</div>
  </div>
</template>

<style scoped>
.sd-banner { background: rgba(14,122,104,0.06); border: 0.5px solid var(--border-strong); border-radius: var(--r-lg); padding: 14px 18px; display: flex; align-items: center; gap: 14px; margin-bottom: 18px; font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.55; }
.sd-domain { margin-bottom: 14px; background: var(--surface); border: 0.5px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
.sd-head { display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; }
.sd-glyph { width: 34px; height: 34px; border-radius: var(--r-md); background: var(--teal-dim); border: 0.5px solid var(--border-strong); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sd-name { font-family: var(--font-sans); font-size: 15px; font-weight: 500; color: var(--fg); letter-spacing: -0.01em; }
.sd-status { font-family: var(--font-mono); font-size: 9px; padding: 3px 7px; background: rgba(29,184,154,0.10); border: 0.5px solid rgba(29,184,154,0.30); border-radius: 3px; color: var(--pos); letter-spacing: 0.10em; text-transform: uppercase; }
.sd-desc { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); margin-top: 3px; }
.sd-srchead { display: grid; grid-template-columns: 60px 1fr 160px 90px 110px; padding: 8px 18px; gap: 12px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.10em; text-transform: uppercase; color: var(--fg-muted); border-bottom: 0.5px solid var(--border); background: var(--surface-2); }
.sd-row { display: grid; grid-template-columns: 60px 1fr 160px 90px 110px; gap: 12px; padding: 11px 18px; align-items: center; border-bottom: 0.5px solid var(--border); }
.sd-srcname { font-family: var(--font-sans); font-size: 13px; color: var(--fg); }
.sd-mono { font-family: var(--font-mono); font-size: 11px; color: var(--fg); }
.sd-mono-muted { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); overflow: hidden; text-overflow: ellipsis; }
.sd-ro { font-family: var(--font-mono); font-size: 10px; color: var(--info); display: inline-flex; gap: 4px; align-items: center; }
.sd-empty { padding: 18px; text-align: center; font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); }
.sd-subhead { padding: 12px 18px 6px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted); border-top: 0.5px solid var(--border); }
.sd-mcp { display: flex; align-items: center; gap: 12px; padding: 10px 18px; }
.sd-mcp-ic { width: 32px; height: 32px; border-radius: 6px; background: var(--teal-dim); border: 0.5px solid var(--border-strong); display: inline-flex; align-items: center; justify-content: center; color: var(--teal-400); flex-shrink: 0; }
.sd-domsettings { padding: 14px 18px; border-top: 0.5px solid var(--border); background: var(--surface-2); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sd-domsettings-cap { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted); }
.sd-none { padding: 32px; text-align: center; font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); background: var(--surface); border: 0.5px dashed var(--border-strong); border-radius: var(--r-lg); }
</style>
