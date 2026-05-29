<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ROUTE_DEFS } from '../routes-def';
import { Icon } from '../icons';

const route = useRoute();
const def = computed(() => ROUTE_DEFS.find((r) => r.id === (route.meta.id as string)));
</script>

<template>
  <div class="main main-narrow fade-up">
    <div class="page-head">
      <div>
        <div class="page-title">{{ def?.label }}</div>
        <div class="page-sub">Раздел будет собран в следующих фазах миграции</div>
      </div>
    </div>

    <div class="card placeholder">
      <div class="placeholder-icon">
        <Icon v-if="def" :name="def.icon" :size="26" />
      </div>
      <div class="placeholder-title">«{{ def?.label }}» — в работе</div>
      <div class="placeholder-text">
        Фаза 1 миграции на Vue + PrimeVue 4 собрала фундамент (токены, мост,
        Shell, роутер) и одну референс-страницу — <b>Аккаунт → Профиль</b>.
        Этот раздел переносится из React-прототипа по тому же образцу.
      </div>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 56px 24px;
}
.placeholder-icon {
  width: 56px; height: 56px; border-radius: var(--r-lg);
  background: var(--teal-dim); color: var(--teal-400);
  display: inline-flex; align-items: center; justify-content: center;
  border: 0.5px solid var(--border-strong);
}
.placeholder-title { font-family: var(--font-sans); font-size: 15px; font-weight: 500; color: var(--fg); }
.placeholder-text { font-family: var(--font-sans); font-size: 13px; color: var(--fg-muted); line-height: 1.6; max-width: 460px; }
</style>
