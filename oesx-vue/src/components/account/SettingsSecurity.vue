<script setup lang="ts">
/* Безопасность (порт SettingsSecurity). */
import RowToggle from '../RowToggle.vue';
</script>

<template>
  <div>
    <div class="section-head"><span class="sh-title">Безопасность</span><div class="sh-line" /></div>
    <div class="card" style="display: flex; flex-direction: column; gap: 14px">
      <RowToggle title="SSO через Keycloak" desc="Единая учётка с другими корпоративными системами ВГК · обязательно" :modelValue="true" disabled />
      <RowToggle title="Маскирование чувствительных данных" desc="Security Data Agent заменяет реальные значения на моки перед отправкой в LLM" :modelValue="true" />
      <RowToggle title="Хранить логи Workspace 90 дней" desc="По умолчанию: 90 · можно сократить до 30 в политике подразделения" :modelValue="true" />
    </div>
  </div>
</template>
