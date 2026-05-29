<script setup lang="ts">
/* Настройки агента (порт SettingsAgent): основной агент + саб-агенты + MCP. */
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import { Icon, CubeLogo } from '../../icons';
import { makeShortId } from '../../utils';
import { useAppState } from '../../store';

const toast = useToast();
const app = useAppState();
const primaryName = app.primaryAgentName;

const DEFAULT_AGENT_PROMPT = `You are a personal AI workspace assistant.

When the user asks for code, SQL, dashboards, charts, HTML, or any technical output — delegate to the developer sub-agent.

CALL sessions_recent WITH EXACTLY THESE 3 PARAMETERS: user_id, limit=20, after=null.`;
const DEFAULT_SUBAGENT_PROMPT = `You are an expert software developer. You write clean, efficient, production-ready code.
## Dashboards & HTML output: produce a self-contained HTML file with inline styles.`;

const modelOptions = [
  { label: 'По умолчанию (из конфига)', value: 'default' },
  { label: 'CLAUDE-OPUS-4-6', value: 'claude-opus-4-6' },
  { label: 'CLAUDE-SONNET-4-5', value: 'claude-sonnet-4-5' },
  { label: 'CLAUDE-HAIKU-4-5', value: 'claude-haiku-4-5' },
  { label: 'GPT-5.4-2026-03-05', value: 'gpt-5-4' },
  { label: 'GROK-4.20-0309', value: 'grok-4-20' },
];
const model = ref('default');
const prompt = ref(DEFAULT_AGENT_PROMPT);

interface Sub { id: string; name: string; subId: string; instructions: string }
const subagents = ref<Sub[]>([{ id: 'sa-dev', name: 'Разработчик', subId: 'openai/claude-sonnet-4-5', instructions: DEFAULT_SUBAGENT_PROMPT }]);
const editingSubId = ref<string | null>(null);
const editingSubText = ref('');
function startEditSub(sa: Sub) { editingSubId.value = sa.id; editingSubText.value = sa.instructions; }
function saveEditSub() {
  subagents.value = subagents.value.map((x) => (x.id === editingSubId.value ? { ...x, instructions: editingSubText.value } : x));
  toast.add({ severity: 'success', summary: 'Инструкции саб-агента обновлены', life: 2500 });
  editingSubId.value = null;
}
const addingSub = ref(false);
const subForm = ref({ name: '', subId: '', instructions: '' });
function addSub() {
  if (!subForm.value.name.trim() || !subForm.value.subId.trim()) return;
  subagents.value.push({ id: 'sa-' + makeShortId(), name: subForm.value.name.trim(), subId: subForm.value.subId.trim(), instructions: subForm.value.instructions || 'Без инструкций' });
  toast.add({ severity: 'success', summary: 'Саб-агент добавлен', detail: subForm.value.name.trim(), life: 2500 });
  subForm.value = { name: '', subId: '', instructions: '' };
  addingSub.value = false;
}
function delSub(id: string) { subagents.value = subagents.value.filter((x) => x.id !== id); }

interface Mcp { id: string; name: string; url: string; transport: string }
const mcps = ref<Mcp[]>([{ id: 'mcp-shift', name: 'Оценка смены', url: 'https://shift-rating-mcp-port.oeswork.io/mcp', transport: 'streamable-http' }]);
const addingMcp = ref(false);
const mcpForm = ref({ name: '', url: '' });
function addMcp() {
  if (!mcpForm.value.name.trim() || !mcpForm.value.url.trim()) return;
  mcps.value.push({ id: 'mcp-' + makeShortId(), name: mcpForm.value.name.trim(), url: mcpForm.value.url.trim(), transport: 'streamable-http' });
  toast.add({ severity: 'success', summary: 'MCP-сервер добавлен', detail: mcpForm.value.name.trim(), life: 2500 });
  mcpForm.value = { name: '', url: '' };
  addingMcp.value = false;
}
function delMcp(id: string) { mcps.value = mcps.value.filter((x) => x.id !== id); }

function save() { toast.add({ severity: 'success', summary: 'Контейнер перезапущен', detail: 'Настройки агента сохранены', life: 3000 }); }
</script>

<template>
  <div>
    <!-- Основной агент -->
    <div class="card pad0">
      <div class="ca-head"><Icon name="cpu" :size="13" style="color: var(--teal-400)" /><span>Основной агент</span></div>
      <div class="ca-body">
        <div class="primary-box">
          <CubeLogo :size="16" color="var(--teal-400)" />
          <div style="flex: 1; min-width: 0">
            <div class="pb-cap">Имя</div>
            <div class="pb-name">{{ primaryName }}</div>
          </div>
          <span class="pb-pill"><span class="dot dot-pos" /> Основной</span>
        </div>
        <FloatLabel variant="on">
          <Select id="ag-model" v-model="model" :options="modelOptions" optionLabel="label" optionValue="value" style="width: 100%" />
          <label for="ag-model">Модель</label>
        </FloatLabel>
        <div class="field">
          <FloatLabel variant="on">
            <Textarea id="ag-prompt" v-model="prompt" autoResize rows="6" style="width: 100%" />
            <label for="ag-prompt">Системные инструкции</label>
          </FloatLabel>
          <span class="field-hint">Переопределяет системный промпт агента</span>
        </div>
      </div>
    </div>

    <!-- Саб-агенты -->
    <div class="card pad0">
      <div class="ca-head"><Icon name="brain" :size="13" style="color: var(--teal-400)" /><span>Саб-агенты · {{ subagents.length }}</span></div>
      <div class="ca-list">
        <div v-for="sa in subagents" :key="sa.id" class="sa-item" :class="{ editing: editingSubId === sa.id }">
          <div class="sa-top">
            <div style="min-width: 0">
              <div class="sa-name">{{ sa.name }}</div>
              <div class="sa-id">{{ sa.subId }}</div>
            </div>
            <div style="display: flex; gap: 12px">
              <button v-if="editingSubId !== sa.id" class="lnk" @click="startEditSub(sa)">Редактировать</button>
              <button class="lnk lnk-neg" @click="delSub(sa.id)">Удалить</button>
            </div>
          </div>
          <div v-if="editingSubId === sa.id" class="sa-edit">
            <Textarea v-model="editingSubText" autoResize rows="6" style="width: 100%" />
            <div style="display: flex; gap: 8px">
              <Button label="Сохранить" size="small" @click="saveEditSub" />
              <Button label="Отмена" size="small" severity="secondary" @click="editingSubId = null" />
            </div>
          </div>
          <div v-else class="sa-instr">{{ sa.instructions }}</div>
        </div>

        <div v-if="addingSub" class="sa-form">
          <InputText v-model="subForm.name" placeholder="Имя саб-агента" />
          <InputText v-model="subForm.subId" placeholder="ID (латиница, без пробелов)" />
          <Textarea v-model="subForm.instructions" rows="3" placeholder="Системные инструкции саб-агента…" />
          <div style="display: flex; gap: 8px">
            <Button label="Добавить" size="small" :disabled="!subForm.name.trim() || !subForm.subId.trim()" @click="addSub" />
            <Button label="Отмена" size="small" severity="secondary" @click="addingSub = false" />
          </div>
        </div>
        <Button v-else label="Добавить саб-агента" size="small" text @click="addingSub = true"><template #icon><Icon name="plus" :size="11" /></template></Button>
      </div>
    </div>

    <!-- MCP -->
    <div class="card pad0">
      <div class="ca-head"><Icon name="wrench" :size="13" style="color: var(--teal-400)" /><span>MCP серверы · {{ mcps.length }}</span></div>
      <div class="ca-list">
        <div v-for="m in mcps" :key="m.id" class="sa-item">
          <div class="sa-top">
            <div style="min-width: 0; flex: 1">
              <div class="sa-name">{{ m.name }}</div>
              <div class="sa-id ellipsis">{{ m.url }}</div>
              <div class="sa-id">{{ m.transport }}</div>
            </div>
            <button class="lnk lnk-neg" @click="delMcp(m.id)">Удалить</button>
          </div>
        </div>
        <div v-if="addingMcp" class="sa-form">
          <InputText v-model="mcpForm.name" placeholder="Название" />
          <InputText v-model="mcpForm.url" placeholder="URL https://…" />
          <div style="display: flex; gap: 8px">
            <Button label="Добавить" size="small" :disabled="!mcpForm.name.trim() || !mcpForm.url.trim()" @click="addMcp" />
            <Button label="Отмена" size="small" severity="secondary" @click="addingMcp = false" />
          </div>
        </div>
        <Button v-else label="Добавить сервер" size="small" text @click="addingMcp = true"><template #icon><Icon name="plus" :size="11" /></template></Button>
      </div>
    </div>

    <Button label="Сохранить и перезапустить контейнер" style="width: 100%; justify-content: center" @click="save" />
  </div>
</template>

<style scoped>
.card.pad0 { padding: 0; overflow: hidden; margin-bottom: 12px; }
.ca-head { padding: 10px 18px; border-bottom: 0.5px solid var(--border); display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted); }
.ca-body { padding: 22px 18px 18px; display: flex; flex-direction: column; gap: 24px; }
.ca-list { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.primary-box { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--r-md); background: rgba(29,184,154,0.06); border: 0.5px solid rgba(29,184,154,0.30); }
.pb-cap { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted); }
.pb-name { font-family: var(--font-sans); font-size: 15px; font-weight: 600; color: var(--fg); margin-top: 2px; }
.pb-pill { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(29,184,154,0.12); border: 0.5px solid rgba(29,184,154,0.32); color: var(--pos); }
.field { display: flex; flex-direction: column; gap: 8px; }
.field-hint { font-family: var(--font-sans); font-size: 11px; color: var(--fg-muted); }
.sa-item { padding: 12px 14px; border: 0.5px solid var(--border); border-radius: var(--r-md); background: var(--surface-2); }
.sa-item.editing { border-color: var(--teal-400); }
.sa-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.sa-name { font-family: var(--font-sans); font-size: 13px; font-weight: 500; color: var(--fg); }
.sa-id { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 2px; }
.sa-id.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sa-instr { font-family: var(--font-sans); font-size: 11px; color: var(--fg-muted); line-height: 1.45; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sa-edit { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.sa-form { padding: 14px; border: 0.5px solid var(--teal-400); border-radius: var(--r-md); background: var(--surface-2); display: flex; flex-direction: column; gap: 8px; }
.lnk { background: transparent; border: 0; color: var(--teal-400); font-family: var(--font-sans); font-size: 12px; cursor: pointer; padding: 0; }
.lnk-neg { color: var(--neg); }
</style>
