<script setup lang="ts">
/* Создание решения — Фаза 2 (порт SectionCreate): двухколоночный layout —
   слева превью (idle + skeleton), справа чат. ≤1200px стопкой (чат снизу).
   Полный сценарий генерации — следующая итерация. */
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon, CubeLogo } from '../icons';
import type { IconName } from '../icons';
import { makeShortId } from '../utils';
import { useAppState } from '../store';

const route = useRoute();
const app = useAppState();
const botName = app.primaryAgentName;

const kind = computed(() => (route.query.kind === 'automation' ? 'automation' : 'dash'));
const titleMap: Record<string, string> = { dash: 'Новый дашборд', automation: 'Новая автоматизация' };
const iconMap: Record<string, IconName> = { dash: 'bar-chart', automation: 'zap' };
const subMap: Record<string, string> = {
  dash: 'Графики и таблицы соберутся здесь после описания задачи',
  automation: 'Описание команды, расписание и условие появятся здесь',
};

const title = ref('');
onMounted(() => { title.value = titleMap[kind.value]; });
const shortId = makeShortId();

interface Msg { id: number; role: 'user' | 'bot'; text: string }
const messages = ref<Msg[]>([
  { id: 1, role: 'bot', text: 'Опишите, что должно быть в решении — какие данные, метрики, период. Я соберу превью слева.' },
]);
const input = ref('');
let seq = 1;
function send() {
  const text = input.value.trim();
  if (!text) return;
  messages.value.push({ id: ++seq, role: 'user', text });
  input.value = '';
  messages.value.push({ id: ++seq, role: 'bot', text: 'Принял. Сборка превью и генерация — в следующей фазе миграции.' });
}
function onKeydown(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
</script>

<template>
  <div class="create-shell">
    <!-- Шапка -->
    <div class="create-header">
      <input v-model="title" class="create-title" />
      <span class="create-id">id: {{ shortId }}</span>
      <span style="flex: 1" />
      <button class="hbtn"><Icon name="git-branch" :size="12" /> История</button>
      <button class="hbtn"><Icon name="message-square" :size="12" /> Новый чат</button>
    </div>

    <div class="create-body">
      <!-- Превью -->
      <div class="create-preview">
        <div class="prev-idle">
          <div class="prev-icon"><Icon :name="iconMap[kind]" :size="26" /></div>
          <div class="prev-title">Превью появится здесь</div>
          <div class="prev-sub">{{ subMap[kind] }}</div>
          <div class="prev-skeleton">
            <div class="sk sk-row"><span class="sk-cell" /><span class="sk-cell" /><span class="sk-cell" /><span class="sk-cell" /></div>
            <div class="sk sk-chart" />
            <div class="sk sk-table" />
          </div>
        </div>
      </div>

      <!-- Чат -->
      <div class="create-chat">
        <div class="cchat-head"><CubeLogo :size="12" color="var(--teal-400)" /> Диалог с {{ botName }}</div>
        <div class="cchat-log">
          <div v-for="m in messages" :key="m.id" class="bubble-row" :class="m.role">
            <div class="bubble" :class="m.role === 'user' ? 'bubble-user' : 'bubble-bot'">{{ m.text }}</div>
          </div>
        </div>
        <div class="cchat-foot">
          <div class="composer">
            <textarea v-model="input" class="composer-input" rows="1" placeholder="Опишите изменение…" @keydown="onKeydown" />
            <button class="composer-btn send" title="Отправить" :disabled="!input.trim()" @click="send"><Icon name="send" :size="15" /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-shell { display: flex; flex-direction: column; height: calc(100vh - var(--nav-h)); min-width: 0; }
.create-header { display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-bottom: 0.5px solid var(--border); }
.create-title { flex: 0 1 auto; min-width: 0; background: transparent; border: 0.5px solid transparent; border-radius: var(--r-sm); padding: 6px 8px; font-family: var(--font-sans); font-size: 16px; font-weight: 500; color: var(--fg); }
.create-title:hover { border-color: var(--border); }
.create-title:focus { outline: 0; border-color: var(--teal-400); background: var(--surface-2); }
.create-id { font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted); }
.hbtn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--r-md); background: var(--surface-2); border: 0.5px solid var(--border); color: var(--fg-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; }
.hbtn:hover { color: var(--fg); border-color: var(--border-strong); }

.create-body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 380px; }
.create-preview { padding: 24px; overflow-y: auto; border-right: 0.5px solid var(--border); }
.create-chat { display: flex; flex-direction: column; min-height: 0; background: var(--surface); }

/* Превью idle */
.prev-idle { height: 100%; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; }
.prev-icon { width: 56px; height: 56px; border-radius: var(--r-lg); background: var(--teal-dim); color: var(--teal-400); display: inline-flex; align-items: center; justify-content: center; border: 0.5px solid var(--border-strong); }
.prev-title { font-family: var(--font-sans); font-size: 15px; font-weight: 500; color: var(--fg); }
.prev-sub { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); max-width: 360px; }
.prev-skeleton { width: min(560px, 90%); margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
.sk-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.sk-cell { height: 56px; }
.sk-chart { height: 150px; }
.sk-table { height: 80px; }
.sk, .sk-cell { border-radius: var(--r-md); background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 50%, var(--surface-2) 100%); background-size: 240px 100%; animation: oes-shimmer 1.6s linear infinite; }
@keyframes oes-shimmer { 0% { background-position: -240px 0; } 100% { background-position: calc(240px + 100%) 0; } }

/* Чат-панель */
.cchat-head { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 0.5px solid var(--border); font-family: var(--font-mono); font-size: 11px; color: var(--teal-400); }
.cchat-log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.bubble-row { display: flex; flex-direction: column; }
.bubble-row.user { align-items: flex-end; }
.bubble { font-family: var(--font-sans); font-size: 13px; line-height: 1.55; padding: 10px 14px; border-radius: 12px; max-width: 90%; }
.bubble-user { background: var(--teal-dim); color: var(--fg); border: 0.5px solid var(--border-strong); border-bottom-right-radius: 4px; }
.bubble-bot { background: var(--surface-2); color: var(--fg); border: 0.5px solid var(--border); border-bottom-left-radius: 4px; }
.cchat-foot { padding: 12px 16px; border-top: 0.5px solid var(--border); }
.composer { display: flex; align-items: flex-end; gap: 8px; background: var(--surface-2); border: 0.5px solid var(--border-strong); border-radius: var(--r-lg); padding: 8px 8px 8px 12px; }
.composer-input { flex: 1; min-width: 0; resize: none; background: transparent; border: 0; outline: 0; font-family: var(--font-sans); font-size: 13px; line-height: 20px; color: var(--fg); max-height: 200px; }
.composer-btn.send { width: 32px; height: 32px; border-radius: var(--r-md); display: inline-flex; align-items: center; justify-content: center; background: var(--teal-400); color: var(--fg-on-teal); border: 0.5px solid var(--teal-400); flex-shrink: 0; }
.composer-btn.send:hover:not(:disabled) { background: var(--teal-300); }
.composer-btn.send:disabled { background: var(--surface-3); color: var(--fg-dim); border-color: transparent; cursor: not-allowed; }

/* ≤1200px — одна колонка, чат снизу */
@media (max-width: 1199px) {
  .create-body { grid-template-columns: 1fr; grid-template-rows: 1fr min(40vh, 360px); }
  .create-preview { border-right: 0; border-bottom: 0.5px solid var(--border); }
}
</style>
