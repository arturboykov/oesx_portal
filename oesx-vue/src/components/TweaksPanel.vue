<script setup lang="ts">
/* Демо-панель Tweaks (правый нижний угол) — переключение роли и состояния
   лимита без выхода из системы. Раздел Workspace пока не реализован. */
import { ref } from 'vue';
import Select from 'primevue/select';
import { Icon } from '../icons';
import { useAppState, type LimitState } from '../store';

const app = useAppState();
const open = ref(false);

const limitOptions: { label: string; value: LimitState }[] = [
  { label: '42% · норма', value: 'normal' },
  { label: '75% · предупреждение', value: 'warn75' },
  { label: '80% · порог', value: 'warn80' },
  { label: '100% · стоп', value: 'stop' },
];
</script>

<template>
  <div class="tweaks">
    <button v-if="!open" class="tw-fab" title="Tweaks · демо-переключатели" @click="open = true">
      <Icon name="sliders" :size="16" />
    </button>

    <div v-else class="tw-panel">
      <div class="tw-head">
        <Icon name="sliders" :size="13" style="color: var(--teal-400)" />
        <span class="tw-title">Tweaks</span>
        <span style="flex: 1" />
        <button class="tw-x" title="Закрыть" @click="open = false"><Icon name="x" :size="14" /></button>
      </div>

      <div class="tw-sec">
        <div class="tw-cap">Роль пользователя</div>
        <div class="tw-sub">Текущий пользователь</div>
        <div class="seg">
          <button class="seg-btn" :class="{ active: app.state.userRole === 'user' }" @click="app.setRole('user')">User · Дьяконов</button>
          <button class="seg-btn" :class="{ active: app.state.userRole === 'admin' }" @click="app.setRole('admin')">Admin · Степанов</button>
        </div>
      </div>

      <div class="tw-sec">
        <div class="tw-cap">Лимит токенов</div>
        <div class="tw-sub">Состояние</div>
        <Select
          :modelValue="app.state.limitState"
          :options="limitOptions"
          optionLabel="label"
          optionValue="value"
          style="width: 100%"
          @update:modelValue="app.setLimitState($event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tw-fab {
  position: fixed; right: 16px; bottom: 16px; z-index: 500;
  width: 38px; height: 38px; border-radius: var(--r-md);
  background: var(--surface-2); border: 0.5px solid var(--border-strong);
  color: var(--fg-muted); display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: var(--shadow-glass); transition: all .15s var(--ease-apple);
}
.tw-fab:hover { color: var(--teal-400); border-color: var(--teal-400); }

.tw-panel {
  position: fixed; right: 16px; bottom: 16px; z-index: 500; width: 290px;
  background: var(--surface); border: 0.5px solid var(--border-strong); border-radius: var(--r-lg);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5); padding: 6px;
}
.tw-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px 12px; }
.tw-title { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--fg); }
.tw-x { width: 26px; height: 26px; border-radius: var(--r-sm); display: inline-flex; align-items: center; justify-content: center; color: var(--fg-muted); cursor: pointer; }
.tw-x:hover { background: var(--surface-3); color: var(--fg); }

.tw-sec { padding: 10px 12px; }
.tw-cap { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted); margin-bottom: 10px; }
.tw-sub { font-family: var(--font-sans); font-size: 12px; color: var(--fg); margin-bottom: 8px; }

.seg { display: inline-flex; padding: 3px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: var(--r-md); width: 100%; }
.seg-btn { flex: 1; padding: 6px 10px; border-radius: 4px; background: transparent; border: 0.5px solid transparent; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.02em; color: var(--fg-muted); cursor: pointer; transition: all .15s var(--ease-apple); white-space: nowrap; }
.seg-btn.active { background: var(--surface); border-color: var(--border-strong); color: var(--teal-400); }
</style>
