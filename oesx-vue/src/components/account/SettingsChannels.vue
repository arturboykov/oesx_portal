<script setup lang="ts">
/* Каналы взаимодействия (порт SettingsChannels): карточки + connect/configure/
   disconnect через PrimeVue Dialog. */
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import Chip from '../Chip.vue';
import RowToggle from '../RowToggle.vue';
import { ChannelGlyph, Icon } from '../../icons';
import { OESDATA, type Channel } from '../../data';

const toast = useToast();
const channels = ref<Channel[]>(OESDATA.channels.map((c) => ({ ...c })));

type Mode = 'connect' | 'configure' | 'disconnect';
const modal = ref<{ mode: Mode; channel: Channel } | null>(null);
const handle = ref('');
function open(mode: Mode, channel: Channel) { modal.value = { mode, channel }; handle.value = ''; }
function close() { modal.value = null; }

function placeholder(ch: Channel) {
  return ch.kind === 'email' || ch.kind === 'teams' ? 'user@vgk.ru' : ch.kind === 'tg' ? '@username' : 'идентификатор';
}
function finishConnect() {
  const ch = modal.value!.channel;
  channels.value = channels.value.map((c) => (c.kind === ch.kind ? { ...c, state: 'connected', linkedAs: handle.value.trim() } : c));
  toast.add({ severity: 'success', summary: `${ch.name} подключён`, detail: `Привязан как ${handle.value.trim()}`, life: 3000 });
  close();
}
function finishConfigure() {
  toast.add({ severity: 'success', summary: 'Настройки сохранены', detail: modal.value!.channel.name, life: 2500 });
  close();
}
function finishDisconnect() {
  const ch = modal.value!.channel;
  channels.value = channels.value.map((c) => (c.kind === ch.kind ? { ...c, state: 'available', linkedAs: null } : c));
  toast.add({ severity: 'success', summary: `${ch.name} отключён`, detail: 'Канал переведён в доступные.', life: 3000 });
  close();
}
function contactIt(ch: Channel) { toast.add({ severity: 'success', summary: 'Запрос в ИТ отправлен', detail: ch.name, life: 2500 }); }
</script>

<template>
  <div>
    <div class="section-head"><span class="sh-title">Каналы взаимодействия</span><div class="sh-line" /></div>
    <div class="ch-note">Единый Workspace для всех каналов — память, история и контекст общие.</div>

    <div class="ch-grid">
      <div v-for="c in channels" :key="c.kind" class="card ch-card">
        <div class="ch-top">
          <ChannelGlyph :kind="c.kind" :size="20" />
          <div style="flex: 1; min-width: 0">
            <div class="ch-name">{{ c.name }}</div>
            <div class="ch-meta">{{ c.meta }}</div>
          </div>
          <Chip v-if="c.state === 'connected'" kind="pos" dot>ПОДКЛЮЧЁН</Chip>
          <Chip v-else-if="c.state === 'pending'" kind="warn">ОЖИДАЕТ ИТ</Chip>
          <Chip v-else kind="neutral">ДОСТУПЕН</Chip>
        </div>
        <div class="ch-desc">{{ c.desc }}</div>
        <div v-if="c.linkedAs" class="ch-linked">
          <Icon name="link" :size="11" style="color: var(--fg-muted)" />
          <span class="ch-linked-l">привязан как</span>
          <span class="ch-linked-v">{{ c.linkedAs }}</span>
        </div>
        <div class="ch-actions">
          <template v-if="c.state === 'connected'">
            <Button label="Настроить" size="small" severity="secondary" @click="open('configure', c)"><template #icon><Icon name="settings" :size="11" /></template></Button>
            <Button label="Отключить" size="small" severity="secondary" @click="open('disconnect', c)" />
          </template>
          <Button v-else-if="c.state === 'pending'" label="Связаться с ИТ" size="small" severity="warn" @click="contactIt(c)" />
          <Button v-else label="Подключить" size="small" @click="open('connect', c)" />
        </div>
      </div>
    </div>

    <!-- Подключить -->
    <Dialog :visible="modal?.mode === 'connect'" modal :header="`Подключить ${modal?.channel.name}`" :style="{ width: '440px' }" @update:visible="(v) => !v && close()">
      <div class="dlg-note">Введите ваш идентификатор в {{ modal?.channel.name }}. После подтверждения мы отправим вам ссылку для привязки аккаунта.</div>
      <FloatLabel variant="on">
        <InputText id="ch-handle" v-model="handle" :placeholder="modal ? placeholder(modal.channel) : ''" style="width: 100%" />
        <label for="ch-handle">Идентификатор *</label>
      </FloatLabel>
      <template #footer>
        <Button label="Отмена" severity="secondary" @click="close" />
        <Button label="Привязать" :disabled="!handle.trim()" @click="finishConnect" />
      </template>
    </Dialog>

    <!-- Настроить -->
    <Dialog :visible="modal?.mode === 'configure'" modal :header="`Настройки · ${modal?.channel.name}`" :style="{ width: '460px' }" @update:visible="(v) => !v && close()">
      <div class="card" style="display: flex; flex-direction: column; gap: 14px">
        <RowToggle title="Получать алерты" desc="Доставка срабатываний алертов в этот канал" :modelValue="true" />
        <RowToggle title="Утренний дайджест" desc="Сводка по парку и решениям в 06:30" :modelValue="false" />
        <RowToggle title="Уведомления о форках" desc="Когда коллеги форкают ваши решения" :modelValue="true" />
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" @click="close" />
        <Button label="Сохранить" @click="finishConfigure" />
      </template>
    </Dialog>

    <!-- Отключить -->
    <Dialog :visible="modal?.mode === 'disconnect'" modal :header="`Отключить ${modal?.channel.name}?`" :style="{ width: '460px' }" @update:visible="(v) => !v && close()">
      <div class="dlg-note">Канал «{{ modal?.channel.name }}» больше не будет получать уведомления и срабатывания алертов. Привязка будет снята.</div>
      <template #footer>
        <Button label="Отмена" severity="secondary" @click="close" />
        <Button label="Отключить" severity="danger" @click="finishDisconnect" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.ch-note { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); margin-bottom: 14px; line-height: 1.5; }
.ch-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.ch-card { display: flex; flex-direction: column; gap: 14px; }
.ch-top { display: flex; align-items: center; gap: 12px; }
.ch-name { font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--fg); }
.ch-meta { font-family: var(--font-mono); font-size: 10px; color: var(--fg-muted); margin-top: 2px; }
.ch-desc { font-family: var(--font-sans); font-size: 12px; color: var(--fg-muted); line-height: 1.5; }
.ch-linked { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--surface-2); border-radius: 4px; border: 0.5px solid var(--border); }
.ch-linked-l { font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted); }
.ch-linked-v { font-family: var(--font-mono); font-size: 11px; color: var(--fg); }
.ch-actions { display: flex; gap: 8px; }
.dlg-note { font-family: var(--font-sans); font-size: 14px; color: var(--fg-muted); line-height: 1.6; margin-bottom: 22px; }
</style>
