<script setup lang="ts">
/* Чат — Фаза 2 (порт SectionChat, упрощённый): пустой hero c приветствием,
   composer (автогров + вложение + отправка), дропдаун «Создать решение».
   Полный сценарный диалог из прототипа — следующая итерация. */
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { Icon, CubeLogo } from '../icons';
import { KIND_OPTIONS } from '../routes-def';
import { useAppState } from '../store';

const router = useRouter();
const toast = useToast();
const app = useAppState();
const botName = app.primaryAgentName;

interface Msg { id: number; role: 'user' | 'bot'; text: string }
const messages = ref<Msg[]>([]);
const input = ref('');
const started = computed(() => messages.value.length > 0);
const chatTitle = ref('Новый чат');
const historyCount = 11;
function newChat() { messages.value = []; input.value = ''; chatTitle.value = 'Новый чат'; }
function soon(w: string) { toast.add({ severity: 'info', summary: w, detail: 'В следующей фазе миграции', life: 2500 }); }
const ta = ref<HTMLTextAreaElement | null>(null);
let seq = 0;

function autogrow() {
  const el = ta.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 15 * 22) + 'px';
}
function send() {
  const text = input.value.trim();
  if (!text) return;
  messages.value.push({ id: ++seq, role: 'user', text });
  input.value = '';
  nextTick(autogrow);
  // Простой ответ-заглушка (без сценарной машины прототипа)
  const reply = `Принял запрос. Чтобы собрать решение по нему — нажмите «Создать решение» и выберите тип. (Сценарный диалог появится в следующей фазе.)`;
  messages.value.push({ id: ++seq, role: 'bot', text: reply });
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
}

// Создать решение
const createOpen = ref(false);
const createRef = ref<HTMLElement | null>(null);
function onDown(e: MouseEvent) { if (createRef.value && !createRef.value.contains(e.target as Node)) createOpen.value = false; }
onMounted(() => document.addEventListener('mousedown', onDown));
onUnmounted(() => document.removeEventListener('mousedown', onDown));
function openCreate(kindId: string) { createOpen.value = false; router.push({ path: '/create', query: { kind: kindId } }); }

function attach() { toast.add({ severity: 'info', summary: 'Вложение файла', detail: 'До 25 МБ — обработчик в следующей фазе', life: 2500 }); }
</script>

<template>
  <div class="chat-shell">
    <!-- Шапка чата -->
    <div class="chat-header">
      <label class="chat-titlebox">
        <input v-model="chatTitle" class="chat-title-input" />
        <Icon name="edit" :size="13" class="chat-title-pencil" />
      </label>
      <button class="hbtn" @click="soon('История чатов')"><Icon name="clock" :size="12" /> История · {{ historyCount }}</button>
      <button class="hbtn" @click="newChat"><Icon name="plus" :size="12" /> Новый чат</button>
    </div>

    <!-- Пустой hero -->
    <div v-if="!started" class="chat-hero">
      <div class="hero-logo"><CubeLogo :size="40" color="var(--teal-400)" /></div>
      <div class="hero-greet">Чем я могу помочь?</div>

      <div class="composer">
        <textarea ref="ta" v-model="input" class="composer-input" rows="1" placeholder="Спросите про парк, КИО, циклы или объёмы…" @input="autogrow" @keydown="onKeydown" />
        <div class="composer-actions">
          <button class="composer-btn" title="Прикрепить файл" @click="attach"><Icon name="paperclip" :size="15" /></button>
          <button class="composer-btn send" title="Отправить" :disabled="!input.trim()" @click="send"><Icon name="send" :size="15" /></button>
        </div>
      </div>

      <div ref="createRef" class="hero-create">
        <button class="btn-create" @click="createOpen = !createOpen">
          <Icon name="plus" :size="13" /> Создать решение
          <Icon name="chevron-down" :size="12" :style="{ transform: createOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .15s' }" />
        </button>
        <div v-if="createOpen" class="popover" style="top: calc(100% + 6px); left: 50%; transform: translateX(-50%); width: 280px">
          <button v-for="k in KIND_OPTIONS" :key="k.id" class="popover-item popover-item-lg" @click="openCreate(k.id)">
            <span class="popover-icon"><Icon :name="k.icon" :size="14" /></span>
            <span style="flex: 1; min-width: 0">
              <span style="display: block; font-family: var(--font-sans); font-size: 13px; color: var(--fg); font-weight: 500">{{ k.label }}</span>
              <span style="display: block; font-family: var(--font-sans); font-size: 11px; color: var(--fg-muted); margin-top: 2px">{{ k.desc }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Начатый чат -->
    <template v-else>
      <div class="chat-log">
        <div v-for="m in messages" :key="m.id" class="bubble-row" :class="m.role">
          <div v-if="m.role === 'bot'" class="bubble-bot-name"><CubeLogo :size="11" color="var(--teal-400)" /> {{ botName }}</div>
          <div class="bubble" :class="m.role === 'user' ? 'bubble-user' : 'bubble-bot'">{{ m.text }}</div>
        </div>
      </div>
      <div class="chat-foot">
        <div class="composer">
          <textarea ref="ta" v-model="input" class="composer-input" rows="1" placeholder="Сообщение…" @input="autogrow" @keydown="onKeydown" />
          <div class="composer-actions">
            <button class="composer-btn" title="Прикрепить файл" @click="attach"><Icon name="paperclip" :size="15" /></button>
            <button class="composer-btn send" title="Отправить" :disabled="!input.trim()" @click="send"><Icon name="send" :size="15" /></button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chat-shell { display: flex; flex-direction: column; height: calc(100vh - var(--nav-h)); min-width: 0; }

/* Шапка */
.chat-header { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: var(--surface); border-bottom: 0.5px solid var(--border); }
.chat-titlebox { flex: 1; min-width: 0; height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: var(--r-sm); border: 0.5px solid transparent; cursor: text; transition: all .15s var(--ease-apple); }
.chat-titlebox:hover { border-color: var(--border); background: var(--surface-2); }
.chat-titlebox:focus-within { border-color: var(--teal-400); background: var(--surface-2); }
.chat-title-input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-family: var(--font-sans); font-size: 16px; font-weight: 500; color: var(--fg); }
.chat-title-pencil { color: var(--fg-muted); opacity: 0; transition: opacity .15s; flex-shrink: 0; }
.chat-titlebox:hover .chat-title-pencil, .chat-titlebox:focus-within .chat-title-pencil { opacity: 1; }
.hbtn { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: var(--r-md); background: var(--surface-2); border: 0.5px solid var(--border); color: var(--fg-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; flex-shrink: 0; }
.hbtn:hover { color: var(--fg); border-color: var(--border-strong); }

/* Hero */
.chat-hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; }
.hero-logo { opacity: 0.95; }
.hero-greet { font-family: var(--font-sans); font-size: 26px; font-weight: 500; letter-spacing: -0.02em; color: var(--fg); }
.hero-create { position: relative; }

/* Composer */
.composer { display: flex; align-items: center; gap: 8px; width: min(680px, 92vw); background: var(--surface-2); border: 0.5px solid var(--border-strong); border-radius: var(--r-lg); padding: 8px 10px 8px 14px; }
.composer-input { flex: 1; min-width: 0; resize: none; background: transparent; border: 0; outline: 0; font-family: var(--font-sans); font-size: 14px; line-height: 22px; color: var(--fg); max-height: 330px; }
.composer-actions { display: flex; align-items: center; gap: 6px; }
.composer-btn { width: 32px; height: 32px; border-radius: var(--r-md); display: inline-flex; align-items: center; justify-content: center; color: var(--fg-muted); border: 0.5px solid var(--border); background: var(--surface); transition: all .15s; }
.composer-btn:hover { color: var(--fg); border-color: var(--border-strong); }
.composer-btn.send { background: var(--teal-400); color: var(--fg-on-teal); border-color: var(--teal-400); }
.composer-btn.send:hover:not(:disabled) { background: var(--teal-300); }
.composer-btn.send:disabled { background: var(--surface-3); color: var(--fg-dim); border-color: transparent; cursor: not-allowed; }

.btn-create { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: var(--r-md); background: var(--teal-400); color: var(--fg-on-teal); border: 0.5px solid var(--teal-400); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.03em; cursor: pointer; transition: background .15s; }
.btn-create:hover { background: var(--teal-300); }

/* Conversation */
.chat-log { flex: 1; overflow-y: auto; padding: 24px 24px 8px; display: flex; flex-direction: column; gap: 16px; max-width: 820px; width: 100%; margin: 0 auto; }
.bubble-row { display: flex; flex-direction: column; gap: 4px; }
.bubble-row.user { align-items: flex-end; }
.bubble-bot-name { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; color: var(--teal-400); }
.bubble { font-family: var(--font-sans); font-size: 13px; line-height: 1.55; padding: 12px 16px; border-radius: 12px; max-width: 78%; }
.bubble-user { background: var(--teal-dim); color: var(--fg); border: 0.5px solid var(--border-strong); border-bottom-right-radius: 4px; }
.bubble-bot { background: var(--surface); color: var(--fg); border: 0.5px solid var(--border); border-bottom-left-radius: 4px; }
.chat-foot { padding: 12px 24px 20px; display: flex; justify-content: center; }
.chat-foot .composer { width: min(820px, 100%); }
</style>
