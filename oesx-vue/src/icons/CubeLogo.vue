<script setup lang="ts">
// Официальный изометрический знак OES (порт CubeLogo из icons.jsx).
withDefaults(defineProps<{ size?: number; color?: string }>(), { size: 22, color: '#0C8995' });
</script>

<template>
  <svg :width="size" :height="size" viewBox="60 20 320 365" fill="none" style="flex-shrink: 0">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M215.178 358.422L83.6339 282.056V129.48L215.178 205.689V358.422ZM190.818 220.029V316.16L108.151 268.094V171.964L190.818 220.029Z" :fill="color" />
    <path d="M356.152 282.009L224.765 358.376V330.39L332.578 267.937V233.627L224.765 296.239V205.8L356.31 129.592V157.261L248.811 219.714V254.34L356.31 191.887L356.152 282.009Z" :fill="color" />
    <path d="M326.609 106.824L219.896 168.862L190.979 152.201L297.692 90.2223L273.174 75.8344L166.461 137.971L137.544 121.212L244.257 59.2329L219.739 44.845L88.352 121.212L219.896 197.42L350.97 121.212L326.609 106.824Z" :fill="color" />
    <path d="M219.972 27.8027L70 116.422V290.253L219.972 378.873L369.944 290.253V116.422L219.972 27.8027Z" :stroke="color" :stroke-width="6.8169" />
  </svg>
</template>
