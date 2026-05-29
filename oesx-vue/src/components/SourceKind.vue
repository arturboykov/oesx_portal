<script setup lang="ts">
// Глиф типа источника (порт SourceKind из parts.jsx).
import { computed } from 'vue';
const props = defineProps<{ kind: string }>();
const LABEL: Record<string, string> = { db: 'БД', mcp: 'MCP', api: 'API', docs: 'ДОКИ' };
const label = computed(() => LABEL[props.kind] ?? props.kind);
</script>

<template>
  <span class="src-kind">{{ label }}</span>
</template>

<style scoped>
.src-kind {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.10em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 3px; background: var(--surface-2); color: var(--fg-muted);
  border: 0.5px solid var(--border); white-space: nowrap;
}
</style>
