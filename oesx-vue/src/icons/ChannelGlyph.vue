<script setup lang="ts">
// Монограммы каналов — Teams / Email / TG / Max (порт ChannelGlyph из icons.jsx).
import { computed } from 'vue';

const props = withDefaults(defineProps<{ kind: 'teams' | 'email' | 'tg' | 'max'; size?: number }>(), { size: 14 });

const MAP = {
  teams: { label: 'T', color: '#5B5FC7' },
  email: { label: '@', color: '#6A9EB8' },
  tg: { label: 'TG', color: '#2AABEE' },
  max: { label: 'M', color: '#FF5C5C' },
} as const;

const m = computed(() => MAP[props.kind] || MAP.email);
</script>

<template>
  <span
    :style="{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 4 + 'px', height: size + 4 + 'px', borderRadius: '4px',
      background: m.color, color: '#fff',
      fontFamily: 'var(--font-mono)', fontSize: size - 4 + 'px', fontWeight: 600,
      letterSpacing: 0, lineHeight: 1,
    }"
  >{{ m.label }}</span>
</template>
