<script setup lang="ts">
// Bespoke-чип OES X (порт Chip из parts.jsx). PrimeVue Tag не покрывает
// доменные цветовые группы, поэтому это собственный атом на токенах.
import { computed } from 'vue';

export type ChipKind = 'dash' | 'alert' | 'app' | 'command' | 'pos' | 'neg' | 'warn' | 'neutral' | 'draft';

const props = withDefaults(defineProps<{ kind?: ChipKind; dot?: boolean }>(), { kind: 'neutral', dot: false });

const KIND: Record<ChipKind, { background: string; color: string; border: string }> = {
  dash: { background: 'var(--chip-dash-bg)', color: 'var(--chip-dash-fg)', border: '0.5px solid var(--chip-dash-b)' },
  alert: { background: 'var(--chip-alert-bg)', color: 'var(--chip-alert-fg)', border: '0.5px solid var(--chip-alert-b)' },
  app: { background: 'var(--chip-app-bg)', color: 'var(--chip-app-fg)', border: '0.5px solid var(--chip-app-b)' },
  command: { background: 'rgba(29,184,154,0.10)', color: 'var(--teal-400)', border: '0.5px solid rgba(29,184,154,0.30)' },
  pos: { background: 'rgba(29,184,154,0.10)', color: 'var(--pos)', border: '0.5px solid rgba(29,184,154,0.30)' },
  neg: { background: 'rgba(192,57,43,0.10)', color: 'var(--neg)', border: '0.5px solid rgba(192,57,43,0.30)' },
  warn: { background: 'rgba(200,160,64,0.12)', color: 'var(--warn)', border: '0.5px solid rgba(200,160,64,0.30)' },
  neutral: { background: 'rgba(148,163,184,0.10)', color: 'var(--fg-muted)', border: '0.5px solid var(--border)' },
  draft: { background: 'rgba(74,104,120,0.12)', color: 'var(--fg-muted)', border: '0.5px solid var(--border)' },
};
const DOT: Record<ChipKind, string> = {
  pos: 'var(--pos)', neg: 'var(--neg)', warn: 'var(--warn)', neutral: 'var(--fg-muted)',
  dash: 'var(--chip-dash-fg)', alert: 'var(--chip-alert-fg)', app: 'var(--chip-app-fg)',
  command: 'var(--teal-400)', draft: 'var(--fg-muted)',
};
const style = computed(() => KIND[props.kind]);
</script>

<template>
  <span class="oes-chip" :style="style">
    <span v-if="dot" class="oes-chip__dot" :style="{ background: DOT[kind] }" />
    <slot />
  </span>
</template>

<style scoped>
.oes-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-weight: 500;
  font-size: 10px; line-height: 1.2;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: var(--r-sm); white-space: nowrap;
}
.oes-chip__dot { width: 6px; height: 6px; border-radius: 999px; display: inline-block; }
</style>
