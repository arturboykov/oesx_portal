<script setup lang="ts">
/* Прогноз потребления токенов до конца периода (порт ForecastChart из parts.jsx).
   Bespoke SVG: факт (сплошная) + прогноз (пунктир) + линия лимита + суточные
   бары + маркер «сегодня». Всё считается из данных, без хардкода координат. */
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  daily: number[];          // суточный расход (тыс. токенов) за прошедшие дни
  used: number;             // фактически израсходовано (токенов) на «сегодня»
  limit: number;            // месячный лимит (токенов)
  daysInPeriod: number;
  daysPassed: number;
  height?: number;
}>(), { height: 240 });

const W = 760;
const pad = { l: 50, r: 16, t: 16, b: 24 };

const model = computed(() => {
  const H = props.height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  // Кумулятивная форма из суточных значений, отнормированная к `used`.
  const shape: number[] = [];
  props.daily.reduce((a, v, i) => ((shape[i] = a + v), shape[i]), 0);
  const total = shape[shape.length - 1] || 1;
  const actual = shape.map((s) => (s / total) * props.used);

  const rate = props.used / Math.max(1, props.daysPassed); // токенов/день
  const forecast: number[] = [];
  for (let i = 0; i < props.daysInPeriod; i++) {
    forecast[i] = i < actual.length ? actual[i] : props.used + rate * (i - (actual.length - 1));
  }
  const forecastEnd = forecast[forecast.length - 1];
  const max = Math.max(props.limit * 1.15, forecastEnd * 1.1);

  const xs = (i: number) => pad.l + (i / (props.daysInPeriod - 1)) * innerW;
  const ys = (v: number) => pad.t + innerH - (v / max) * innerH;

  const actualPath = actual.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join('');
  const fStart = actual.length - 1;
  const forecastPath = forecast.slice(fStart).map((v, i) => `${i ? 'L' : 'M'}${xs(fStart + i).toFixed(1)},${ys(v).toFixed(1)}`).join('');

  const dailyMax = Math.max(...props.daily, 1);
  const bars = props.daily.map((d, i) => {
    const bh = (d / dailyMax) * (innerH * 0.18);
    return { x: xs(i) - innerW / props.daysInPeriod * 0.35, y: pad.t + innerH - bh, w: (innerW / props.daysInPeriod) * 0.7, h: bh };
  });

  const yticks = Array.from({ length: 5 }, (_, i) => {
    const v = (max * i) / 4;
    return { y: ys(v), label: (v / 1_000_000).toFixed(1) + 'M' };
  });
  const xticks = Array.from({ length: 7 }, (_, i) => {
    const day = Math.round((i / 6) * (props.daysInPeriod - 1));
    return { x: xs(day), label: String(day + 1).padStart(2, '0') + '.05' };
  });

  return {
    H, innerH, actualPath, forecastPath, bars, yticks, xticks,
    limitY: ys(props.limit), todayX: xs(fStart), baseY: pad.t + innerH,
    limitLabel: 'ЛИМИТ ' + (props.limit / 1_000_000).toFixed(1) + 'M',
  };
});
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${model.H}`" width="100%" preserveAspectRatio="xMidYMid meet" style="display: block">
    <!-- сетка + y-метки -->
    <g v-for="(t, i) in model.yticks" :key="'y' + i">
      <line :x1="pad.l" :x2="W - pad.r" :y1="t.y" :y2="t.y" stroke="var(--border)" stroke-width="0.5" />
      <text :x="pad.l - 6" :y="t.y + 3" font-family="var(--font-mono)" font-size="9" fill="var(--fg-muted)" text-anchor="end">{{ t.label }}</text>
    </g>
    <!-- суточные бары -->
    <rect v-for="(b, i) in model.bars" :key="'b' + i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" fill="var(--teal-400)" opacity="0.30" />
    <!-- линия лимита -->
    <line :x1="pad.l" :x2="W - pad.r" :y1="model.limitY" :y2="model.limitY" stroke="var(--warn-orange)" stroke-width="1" stroke-dasharray="3 3" />
    <text :x="W - pad.r - 4" :y="model.limitY - 6" font-family="var(--font-mono)" font-size="10" fill="var(--warn-orange)" text-anchor="end" letter-spacing="0.06em">{{ model.limitLabel }}</text>
    <!-- маркер «сегодня» -->
    <line :x1="model.todayX" :x2="model.todayX" :y1="pad.t" :y2="model.baseY" stroke="var(--teal-400)" stroke-width="0.5" stroke-dasharray="2 3" opacity="0.55" />
    <!-- прогноз + факт -->
    <path :d="model.forecastPath" stroke="var(--fg-muted)" stroke-width="1.5" stroke-dasharray="5 4" fill="none" />
    <path :d="model.actualPath" stroke="var(--teal-400)" stroke-width="2" fill="none" />
    <!-- x-метки -->
    <text v-for="(t, i) in model.xticks" :key="'x' + i" :x="t.x" :y="model.H - 6" font-family="var(--font-mono)" font-size="9" fill="var(--fg-muted)" text-anchor="middle">{{ t.label }}</text>
    <!-- ось -->
    <line :x1="pad.l" :x2="pad.l" :y1="pad.t" :y2="model.baseY" stroke="var(--border-strong)" stroke-width="0.5" />
  </svg>
</template>
