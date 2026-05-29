<script setup lang="ts">
// KPI-плитка (порт Kpi из parts.jsx) — bespoke, PrimeVue аналога нет.
import { computed } from 'vue';

type Tone = 'pos' | 'neg' | 'warn' | 'neutral' | 'teal' | 'info';
const props = withDefaults(defineProps<{
  label: string; value: string | number; unit?: string; sub?: string; subTone?: Tone; tone?: Tone;
}>(), { tone: 'neutral' });

const TONE: Record<Tone, string> = {
  pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', neutral: 'var(--fg)', teal: 'var(--teal-400)', info: 'var(--info)',
};
const col = computed(() => TONE[props.tone] ?? TONE.neutral);
const subCol = computed(() => (props.subTone ? TONE[props.subTone] : 'var(--fg-muted)'));
</script>

<template>
  <div class="kpi-tile">
    <div class="kpi-label"><slot name="icon" /><span>{{ label }}</span></div>
    <div class="kpi-value" :style="{ color: col }">
      {{ value }}<span v-if="unit" class="unit" :style="{ color: col }">{{ unit }}</span>
    </div>
    <div v-if="sub" class="kpi-sub" :style="{ color: subCol }">{{ sub }}</div>
  </div>
</template>

<style scoped>
.kpi-tile { background: var(--bg-elev); border: 0.5px solid var(--border); border-radius: var(--r-xl); padding: 20px 22px; }
.kpi-label { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: 12px; }
.kpi-value { font-family: var(--font-mono); font-size: 30px; font-weight: 500; letter-spacing: -0.03em; line-height: 1; color: var(--fg); }
.kpi-value .unit { font-size: 16px; opacity: 0.65; margin-left: 4px; }
.kpi-sub { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); margin-top: 8px; }
</style>
