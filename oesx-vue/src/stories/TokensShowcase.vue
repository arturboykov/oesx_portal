<script setup lang="ts">
// Витрина дизайн-токенов OES X — читает CSS-переменные из tokens.css.
const surfaces = ['--bg', '--bg-elev', '--surface', '--surface-2', '--surface-3'];
const fg = ['--fg', '--fg-muted', '--fg-dim'];
const teal = ['--teal-100', '--teal-200', '--teal-300', '--teal-400', '--teal-500', '--teal-600', '--teal-700', '--teal-900'];
const semantic = ['--pos', '--neg', '--warn', '--warn-orange', '--info', '--stopped'];
const radii = ['--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl'];
const spacing = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-8', '--s-10', '--s-12', '--s-16'];
</script>

<template>
  <div class="tok">
    <h3 class="tok-h">Поверхности</h3>
    <div class="tok-grid">
      <div v-for="t in surfaces" :key="t" class="tok-swatch">
        <div class="tok-chip" :style="{ background: `var(${t})`, border: '0.5px solid var(--border-strong)' }" />
        <code>{{ t }}</code>
      </div>
    </div>

    <h3 class="tok-h">Текст</h3>
    <div class="tok-grid">
      <div v-for="t in fg" :key="t" class="tok-swatch">
        <div class="tok-chip" :style="{ background: `var(${t})` }" />
        <code>{{ t }}</code>
      </div>
    </div>

    <h3 class="tok-h">Бренд · teal</h3>
    <div class="tok-grid">
      <div v-for="t in teal" :key="t" class="tok-swatch">
        <div class="tok-chip" :style="{ background: `var(${t})` }" />
        <code>{{ t }}</code>
      </div>
    </div>

    <h3 class="tok-h">Семантика</h3>
    <div class="tok-grid">
      <div v-for="t in semantic" :key="t" class="tok-swatch">
        <div class="tok-chip" :style="{ background: `var(${t})` }" />
        <code>{{ t }}</code>
      </div>
    </div>

    <h3 class="tok-h">Радиусы</h3>
    <div class="tok-grid">
      <div v-for="t in radii" :key="t" class="tok-swatch">
        <div class="tok-chip" :style="{ background: 'var(--teal-dim)', border: '0.5px solid var(--teal-400)', borderRadius: `var(${t})` }" />
        <code>{{ t }}</code>
      </div>
    </div>

    <h3 class="tok-h">Spacing</h3>
    <div class="tok-stack">
      <div v-for="t in spacing" :key="t" class="tok-row">
        <code class="tok-row-key">{{ t }}</code>
        <div :style="{ height: '12px', width: `var(${t})`, background: 'var(--teal-400)', borderRadius: '2px' }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tok { font-family: var(--font-sans); color: var(--fg); }
.tok-h { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted); margin: 22px 0 10px; }
.tok-h:first-child { margin-top: 0; }
.tok-grid { display: flex; flex-wrap: wrap; gap: 14px; }
.tok-swatch { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.tok-chip { width: 72px; height: 48px; border-radius: var(--r-md); }
.tok-swatch code, .tok-row-key { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); }
.tok-stack { display: flex; flex-direction: column; gap: 8px; }
.tok-row { display: flex; align-items: center; gap: 12px; }
.tok-row-key { width: 56px; }
</style>
