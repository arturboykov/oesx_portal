<script setup lang="ts">
/* Потребление и лимиты — Фаза 2, пересобрано под оригинал (порт SectionUsage):
   KPI, лимит-бар с порогами, forecast-график, разбивка-donut. Графики —
   bespoke SVG (часть дизайн-системы), значения считаются из данных. */
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';
import FloatLabel from 'primevue/floatlabel';
import Kpi from '../components/Kpi.vue';
import ForecastChart from '../components/ForecastChart.vue';
import Donut from '../components/Donut.vue';
import { Icon } from '../icons';
import { currentMe } from '../user';
import { OESDATA } from '../data';
import { downloadCSV } from '../utils';
import { useAppState } from '../store';

const toast = useToast();
const app = useAppState();
const b = OESDATA.billing;
const me = computed(() => currentMe(app.state.userRole, app.state.impersonating));

const fmtM = (n: number) => (n / 1_000_000).toFixed(2) + 'M';
const fmtMshort = (n: number) => (n / 1_000_000).toFixed(1) + 'M';
const fmtK = (n: number) => Math.round(n / 1000) + 'K';

// Текущий расход берём из limit-state (как в сайдбаре) — единая точка истины.
const used = computed(() => app.limitInfo.value.used);
const pct = computed(() => app.limitInfo.value.pct);
const limit = b.limitTokens;
const remaining = computed(() => limit - used.value);
const rate = computed(() => used.value / Math.max(1, b.daysPassed)); // токенов/день
const forecastEnd = computed(() => rate.value * b.daysInPeriod);
const forecastPct = computed(() => Math.round((forecastEnd.value / limit) * 100));
const daysToExhaust = computed(() => Math.max(0, Math.ceil(remaining.value / Math.max(1, rate.value))));
const exhaustEarly = computed(() => daysToExhaust.value < b.daysLeft);
const limitTone = computed(() => (pct.value >= 100 ? 'danger' : pct.value >= 80 ? 'warn' : ''));

// Разбивка → donut
const DONUT_COLOR: Record<string, string> = {
  dash: 'var(--teal-400)', agent: 'var(--info)', alert: 'var(--warn-orange)', workspace: 'var(--warn)', misc: 'var(--fg-dim)',
};
const breakdownTotal = b.breakdown.reduce((s, x) => s + x.tokens, 0);
const donutItems = b.breakdown.map((x) => ({ share: x.share, color: DONUT_COLOR[x.kind] ?? 'var(--fg-dim)' }));

// Запросить повышение лимита
const reqOpen = ref(false);
const preset = ref<number | 'custom'>(6_000_000);
const customVal = ref<number | null>(null);
const reason = ref('');
const presetOptions = [
  { label: '6M', value: 6_000_000 },
  { label: '7.5M', value: 7_500_000 },
  { label: '9M', value: 9_000_000 },
  { label: 'Свой', value: 'custom' as const },
];
const targetTokens = computed(() => (preset.value === 'custom' ? customVal.value : preset.value));
const canSubmit = computed(() => !!reason.value.trim() && !!targetTokens.value && targetTokens.value > 0);
function submitRequest() {
  reqOpen.value = false;
  toast.add({ severity: 'success', summary: 'Заявка отправлена в ИТ', detail: `Новый лимит: ${fmtMshort(targetTokens.value || 0)} токенов`, life: 3500 });
  reason.value = '';
}
function exportReport() {
  downloadCSV(`oes-x-потребление-${b.period}.csv`, ['Категория', 'Доля', 'Токены'], b.breakdown.map((x) => [x.label, Math.round(x.share * 100) + '%', x.tokens]));
  toast.add({ severity: 'success', summary: 'Отчёт выгружен', detail: `${b.period} · CSV`, life: 3000 });
}
</script>

<template>
  <div class="main fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">Потребление и лимиты</div>
        <div class="page-sub">Период: {{ b.period }} · до конца — {{ b.daysLeft }} дней · должность «{{ me.role }}»</div>
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="Отчёт CSV" severity="secondary" size="small" @click="exportReport"><template #icon><Icon name="download" :size="13" /></template></Button>
        <Button label="Запросить повышение лимита" severity="warn" size="small" @click="reqOpen = true"><template #icon><Icon name="trending-up" :size="13" /></template></Button>
      </div>
    </div>

    <!-- KPI -->
    <div class="usage-kpis">
      <Kpi label="Израсходовано" :value="fmtM(used)" :sub="pct + '% от лимита'" :subTone="pct >= 80 ? 'warn' : 'pos'" tone="teal" />
      <Kpi label="Осталось" :value="fmtK(remaining)" :sub="`на ${b.daysLeft} дней до конца периода`" tone="neutral" />
      <Kpi label="Прогноз к концу периода" :value="fmtM(forecastEnd)" :sub="`≈ ${forecastPct}% от лимита`" :subTone="forecastPct >= 100 ? 'warn' : 'pos'" :tone="forecastPct >= 100 ? 'warn' : 'neutral'" />
      <Kpi label="Дней до исчерпания" :value="daysToExhaust" unit=" дн" :sub="exhaustEarly ? 'Закончатся раньше периода' : 'В пределах периода'" :subTone="exhaustEarly ? 'neg' : 'pos'" :tone="exhaustEarly ? 'neg' : 'neutral'" />
    </div>

    <!-- Лимит -->
    <div class="section-head"><span class="sh-title">Лимит на {{ b.period.toLowerCase() }}</span><div class="sh-line" /><span class="lim-meta">{{ fmtM(used) }} / {{ fmtMshort(limit) }} · {{ pct }}%</span></div>
    <div class="card">
      <ProgressBar :value="Math.min(100, pct)" :showValue="false" :class="'lim-' + limitTone" style="height: 10px" />
      <div class="lim-marks">
        <span style="left: 0">0</span>
        <span style="left: 50%">50%</span>
        <span style="left: 80%; color: var(--warn-orange)">80% · предупр.</span>
        <span style="left: 100%; color: var(--neg)">100% · стоп</span>
      </div>
    </div>

    <!-- Forecast -->
    <div class="section-head">
      <Icon name="activity" :size="13" style="color: var(--teal-400)" />
      <span class="sh-title">Прогноз потребления токенов до конца периода</span>
      <div class="sh-line" />
      <div class="fc-legend">
        <span><i class="lg lg-fact" /> факт</span>
        <span><i class="lg lg-fore" /> прогноз</span>
        <span><i class="lg lg-lim" /> лимит</span>
      </div>
    </div>
    <div class="card">
      <ForecastChart :daily="b.daily" :used="used" :limit="limit" :daysInPeriod="b.daysInPeriod" :daysPassed="b.daysPassed" />
      <div class="fc-note">
        При текущем темпе ({{ fmtK(rate) }}/день) лимит
        <template v-if="exhaustEarly">закончится через <b style="color: var(--warn-orange)">{{ daysToExhaust }} дн</b>. Снизьте частоту обновления тяжёлых решений или запросите повышение лимита.</template>
        <template v-else>в пределах периода — расход под контролем.</template>
      </div>
    </div>

    <!-- Разбивка -->
    <div class="section-head"><Icon name="box" :size="13" style="color: var(--teal-400)" /><span class="sh-title">Разбивка по типам</span><div class="sh-line" /></div>
    <div class="card bd-card">
      <Donut :items="donutItems" :centerValue="fmtMshort(breakdownTotal)" />
      <div class="bd-legend">
        <div v-for="x in b.breakdown" :key="x.kind" class="bd-row">
          <span class="bd-dot" :style="{ background: DONUT_COLOR[x.kind] }" />
          <span class="bd-label">{{ x.label }}</span>
          <span class="bd-pct">{{ Math.round(x.share * 100) }}%</span>
          <span class="bd-val">{{ fmtK(x.tokens) }}</span>
        </div>
      </div>
    </div>

    <!-- Диалог повышения лимита -->
    <Dialog v-model:visible="reqOpen" modal header="Запросить повышение лимита" :style="{ width: '460px' }">
      <div class="req-stack">
        <div class="req-field">
          <label class="field-label">Желаемый лимит</label>
          <SelectButton v-model="preset" :options="presetOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
        </div>
        <FloatLabel v-if="preset === 'custom'" variant="on">
          <InputNumber id="cust-limit" v-model="customVal" :min="0" :step="500000" style="width: 100%" />
          <label for="cust-limit">Своё значение (токенов)</label>
        </FloatLabel>
        <span v-if="preset === 'custom' && customVal" class="req-hint">{{ fmtMshort(customVal) }} токенов</span>
        <FloatLabel variant="on">
          <Textarea id="req-reason" v-model="reason" rows="4" style="width: 100%" autoResize />
          <label for="req-reason">Обоснование</label>
        </FloatLabel>
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" @click="reqOpen = false" />
        <Button label="Отправить заявку" :disabled="!canSubmit" @click="submitRequest" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.usage-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 8px; }
.lim-meta { font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted); }
.lim-marks { position: relative; height: 16px; margin-top: 8px; }
.lim-marks > span { position: absolute; transform: translateX(-0%); font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); white-space: nowrap; }
.lim-marks > span:nth-child(2), .lim-marks > span:nth-child(3) { transform: translateX(-50%); }
.lim-marks > span:nth-child(4) { transform: translateX(-100%); }

.fc-legend { display: flex; gap: 14px; }
.fc-legend span { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
.lg { width: 14px; height: 2px; border-radius: 1px; display: inline-block; }
.lg-fact { background: var(--teal-400); }
.lg-fore { background: var(--fg-muted); }
.lg-lim { background: var(--warn-orange); }
.fc-note { margin-top: 12px; font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.5; }

.bd-card { display: flex; align-items: center; gap: 32px; }
.bd-legend { flex: 1; display: flex; flex-direction: column; }
.bd-row { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px; padding: 9px 0; }
.bd-row + .bd-row { border-top: 0.5px solid var(--border); }
.bd-dot { width: 9px; height: 9px; border-radius: 2px; }
.bd-label { font-family: var(--font-sans); font-size: 13px; color: var(--fg); }
.bd-pct { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); width: 40px; text-align: right; }
.bd-val { font-family: var(--font-mono); font-size: 11px; color: var(--fg); width: 56px; text-align: right; }

.req-stack { display: flex; flex-direction: column; gap: 24px; padding-top: 6px; }
.req-field { display: flex; flex-direction: column; gap: 8px; }
.req-hint { font-family: var(--font-mono); font-size: 11px; color: var(--teal-400); margin-top: -16px; }

:deep(.lim-warn .p-progressbar-value) { background: var(--warn-orange); }
:deep(.lim-danger .p-progressbar-value) { background: var(--neg); }
</style>
