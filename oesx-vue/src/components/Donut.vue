<script setup lang="ts">
/* Кольцевая диаграмма (bespoke SVG) — разбивка потребления по типам.
   Сегменты строятся через stroke-dasharray; в центре — итог. */
import { computed } from 'vue';

const props = defineProps<{
  items: { share: number; color: string }[];
  centerValue: string;
  centerLabel?: string;
}>();

const R = 52;
const C = 2 * Math.PI * R;

const segments = computed(() => {
  let offset = 0;
  return props.items.map((it) => {
    const len = it.share * C;
    const seg = { color: it.color, dash: `${len} ${C - len}`, offset: -offset };
    offset += len;
    return seg;
  });
});
</script>

<template>
  <div class="donut">
    <svg viewBox="0 0 140 140" width="140" height="140">
      <g transform="rotate(-90 70 70)">
        <circle cx="70" cy="70" :r="R" fill="none" stroke="var(--surface-3)" stroke-width="16" />
        <circle
          v-for="(s, i) in segments"
          :key="i"
          cx="70" cy="70" :r="R" fill="none"
          :stroke="s.color" stroke-width="16"
          :stroke-dasharray="s.dash"
          :stroke-dashoffset="s.offset"
        />
      </g>
      <text x="70" y="68" text-anchor="middle" font-family="var(--font-mono)" font-size="17" font-weight="500" fill="var(--fg)">{{ centerValue }}</text>
      <text x="70" y="84" text-anchor="middle" font-family="var(--font-mono)" font-size="8" letter-spacing="0.12em" fill="var(--fg-muted)">{{ centerLabel || 'ТОКЕНОВ' }}</text>
    </svg>
  </div>
</template>

<style scoped>
.donut { display: inline-flex; flex-shrink: 0; }
</style>
