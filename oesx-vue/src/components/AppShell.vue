<script setup lang="ts">
import { computed } from 'vue';
import TopNav from './TopNav.vue';
import Sidebar from './Sidebar.vue';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAppState } from '../store';

const app = useAppState();
const sidebarAttr = computed(() => (app.state.sidebarCollapsed ? 'collapsed' : 'expanded'));
</script>

<template>
  <div class="app" :data-sidebar="sidebarAttr">
    <TopNav />
    <div class="body">
      <Sidebar />
      <router-view />
    </div>
    <Toast position="bottom-right" />
    <ConfirmDialog />
  </div>
</template>
