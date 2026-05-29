<script setup lang="ts">
// Строка с тумблером (порт RowToggle из various.jsx) на PrimeVue ToggleSwitch.
import { ref, watch } from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';

const props = withDefaults(defineProps<{ title: string; desc?: string; modelValue?: boolean; disabled?: boolean }>(), {
  modelValue: false,
  disabled: false,
});
const v = ref(props.modelValue);
watch(() => props.modelValue, (x) => { v.value = x; });
</script>

<template>
  <div class="rowtoggle">
    <div class="rt-text">
      <div class="rt-title">{{ title }}</div>
      <div v-if="desc" class="rt-desc">{{ desc }}</div>
    </div>
    <ToggleSwitch v-model="v" :disabled="disabled" />
  </div>
</template>

<style scoped>
.rowtoggle { display: flex; align-items: center; gap: 14px; }
.rt-text { flex: 1; min-width: 0; }
.rt-title { font-family: var(--font-sans); font-size: 13px; color: var(--fg); margin-bottom: 3px; }
.rt-desc { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.5; }
</style>
