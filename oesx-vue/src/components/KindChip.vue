<script setup lang="ts">
// Чип типа решения (порт KindChip из parts.jsx).
import { computed } from 'vue';
import Chip, { type ChipKind } from './Chip.vue';

type Kind = 'dash' | 'alert' | 'command' | 'automation' | 'app' | 'draft';
const props = defineProps<{ kind: Kind }>();

// «Алерт» и «Команда» объединены в «Автоматизацию» (стиль как у Команды — command).
const LABEL: Record<Kind, string> = {
  dash: 'ДАШБОРД', alert: 'АВТОМАТИЗАЦИЯ', command: 'АВТОМАТИЗАЦИЯ', automation: 'АВТОМАТИЗАЦИЯ', app: 'ПРИЛОЖЕНИЕ', draft: 'ЧЕРНОВИК',
};
const MAP: Record<Kind, ChipKind> = {
  dash: 'dash', alert: 'command', command: 'command', automation: 'command', app: 'app', draft: 'draft',
};
const chipKind = computed(() => MAP[props.kind] ?? 'neutral');
const label = computed(() => LABEL[props.kind] ?? props.kind);
</script>

<template>
  <Chip :kind="chipKind">{{ label }}</Chip>
</template>
