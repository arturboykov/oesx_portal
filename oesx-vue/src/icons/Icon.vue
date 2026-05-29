<script setup lang="ts">
import { ICON_PATHS, type IconName } from './paths';

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 16 });
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="ICON_PATHS[props.name]"
  />
</template>
