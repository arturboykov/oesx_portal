<script setup lang="ts">
/* Потребление и лимиты — Фаза 2 (порт SectionUsage). KPI на наших атомах,
   ProgressBar/Dialog/InputNumber из PrimeVue. */
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';
import Kpi from '../components/Kpi.vue';
import { Icon } from '../icons';
import { OESDATA } from '../data';
import { downloadCSV } from '../utils';

const toast = useToast();
const b = OESDATA.billing;

const usedPct = Math.round((b.usedTokens / b.limitTokens) * 100);
const remaining = b.limitTokens - b.usedTokens;
const fmtM = (n: number) => (n / 1_000_000).toFixed(2) + 'M';
const limitTone = computed(() => (usedPct >= 100 ? 'danger' : usedPct >= 80 ? 'warn' : ''));

const maxBreak = Math.max(...b.breakdown.map((x) => x.share));

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
  toast.add({ severity: 'success', summary: 'Заявка отправлена в ИТ', detail: `Новый лимит: ${fmtM(targetTokens.value || 0)} токенов`, life: 3500 });
  reason.value = '';
}

function exportReport() {
  downloadCSV(
    `oes-x-потребление-${b.period}.csv`,
    ['Категория', 'Доля', 'Токены'],
    b.breakdown.map((x) => [x.label, Math.round(x.share * 100) + '%', x.tokens]),
  );
  toast.add({ severity: 'success', summary: 'Отчёт выгружен', detail: `${b.period} · CSV`, life: 3000 });
}
</script>

<template>
  <div class="main fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">Потребление и лимиты</div>
        <div class="page-sub">{{ b.period }} · роль «{{ OESDATA.me.role }}» · осталось {{ b.daysLeft }} дн.</div>
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="Отчёт CSV" severity="secondary" size="small" @click="exportReport"><template #icon><Icon name="download" :size="13" /></template></Button>
        <Button label="Запросить повышение лимита" size="small" @click="reqOpen = true"><template #icon><Icon name="trending-up" :size="13" /></template></Button>
      </div>
    </div>

    <!-- KPI -->
    <div class="usage-kpis">
      <Kpi label="Лимит на месяц" :value="(b.limitTokens / 1_000_000).toFixed(1)" unit="M" tone="neutral" />
      <Kpi label="Израсходовано" :value="fmtM(b.usedTokens)" :sub="usedPct + '% лимита'" :subTone="usedPct >= 80 ? 'warn' : 'pos'" tone="teal" />
      <Kpi label="Осталось" :value="fmtM(remaining)" tone="neutral" />
      <Kpi label="Дней до конца периода" :value="b.daysLeft" tone="info" />
    </div>

    <!-- Лимит -->
    <div class="section-head"><span class="sh-title">Лимит токенов</span><div class="sh-line" /></div>
    <div class="card">
      <div class="lim-top">
        <span class="lim-used">{{ fmtM(b.usedTokens) }} <span class="lim-of">/ {{ (b.limitTokens / 1_000_000).toFixed(1) }}M</span></span>
        <span class="lim-pct" :style="{ color: usedPct >= 80 ? 'var(--warn-orange)' : 'var(--teal-400)' }">{{ usedPct }}%</span>
      </div>
      <ProgressBar :value="usedPct" :showValue="false" :class="'lim-' + limitTone" style="height: 10px" />
      <div class="lim-note">
        <Icon name="activity" :size="12" />
        При текущем темпе ({{ ((b.usedTokens / b.daysPassed) / 1000).toFixed(0) }}K/день) лимит будет исчерпан примерно за {{ Math.round(remaining / (b.usedTokens / b.daysPassed)) }} дн.
      </div>
    </div>

    <!-- Разбивка + Топ -->
    <div class="usage-cols">
      <div>
        <div class="section-head"><span class="sh-title">Разбивка по типам</span><div class="sh-line" /></div>
        <div class="card">
          <div v-for="x in b.breakdown" :key="x.kind" class="bd-row">
            <span class="bd-label">{{ x.label }}</span>
            <div class="bd-bar"><span :style="{ width: (x.share / maxBreak * 100) + '%' }" /></div>
            <span class="bd-val">{{ fmtM(x.tokens) }}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="section-head"><span class="sh-title">Топ решений по расходу</span><div class="sh-line" /></div>
        <div class="card">
          <div v-for="(s, i) in b.topSolutions" :key="s.name" class="top-row">
            <span class="top-rank">{{ i + 1 }}</span>
            <span class="top-name">{{ s.name }}</span>
            <span class="top-val">{{ fmtM(s.tokens) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог повышения лимита -->
    <Dialog v-model:visible="reqOpen" modal header="Запросить повышение лимита" :style="{ width: '460px' }">
      <div class="req-field">
        <label class="field-label">Желаемый лимит</label>
        <SelectButton v-model="preset" :options="presetOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
      </div>
      <div v-if="preset === 'custom'" class="req-field">
        <label class="field-label">Своё значение (токенов)</label>
        <InputNumber v-model="customVal" :min="0" :step="500000" placeholder="Например: 8500000" showButtons style="width: 100%" />
        <span v-if="customVal" class="req-hint">{{ fmtM(customVal) }} токенов</span>
      </div>
      <div class="req-field">
        <label class="field-label">Обоснование</label>
        <Textarea v-model="reason" rows="4" placeholder="Почему нужен повышенный лимит…" style="width: 100%" autoResize />
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" text @click="reqOpen = false" />
        <Button label="Отправить заявку" :disabled="!canSubmit" @click="submitRequest" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.usage-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 8px; }
.lim-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.lim-used { font-family: var(--font-mono); font-size: 22px; font-weight: 500; color: var(--fg); }
.lim-of { font-size: 14px; color: var(--fg-muted); }
.lim-pct { font-family: var(--font-mono); font-size: 22px; font-weight: 500; }
.lim-note { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); }

.usage-cols { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; align-items: start; }
.bd-row { display: grid; grid-template-columns: 1fr 120px auto; align-items: center; gap: 12px; padding: 8px 0; }
.bd-row + .bd-row { border-top: 0.5px solid var(--border); }
.bd-label { font-family: var(--font-sans); font-size: 12px; color: var(--fg); }
.bd-bar { height: 6px; background: var(--surface-3); border-radius: 2px; overflow: hidden; }
.bd-bar > span { display: block; height: 100%; background: var(--teal-400); border-radius: 2px; }
.bd-val { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); white-space: nowrap; }
.top-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
.top-row + .top-row { border-top: 0.5px solid var(--border); }
.top-rank { width: 20px; height: 20px; border-radius: 999px; background: var(--surface-2); border: 0.5px solid var(--border); color: var(--fg-muted); font-family: var(--font-mono); font-size: 10px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.top-name { flex: 1; min-width: 0; font-family: var(--font-sans); font-size: 12px; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-val { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); }
.req-field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.req-hint { font-family: var(--font-mono); font-size: 11px; color: var(--teal-400); }

:deep(.lim-warn .p-progressbar-value) { background: var(--warn-orange); }
:deep(.lim-danger .p-progressbar-value) { background: var(--neg); }
</style>
