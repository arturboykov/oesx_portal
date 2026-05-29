<script setup lang="ts">
// Лейбл + значение (порт Field из various.jsx).
withDefaults(defineProps<{ label: string; value: string; mono?: boolean }>(), { mono: false });
</script>

<template>
  <div>
    <div class="field-label">{{ label }}</div>
    <div class="field-value" :style="{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }">{{ value }}</div>
  </div>
</template>

<style scoped>
.field-label {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--fg-muted); margin-bottom: 4px;
}
.field-value { font-size: 13px; color: var(--fg); }
</style>
