import { createRouter, createWebHistory } from 'vue-router';
import AccountPage from './pages/AccountPage.vue';
import SolutionsPage from './pages/SolutionsPage.vue';
import UsagePage from './pages/UsagePage.vue';
import ChatPage from './pages/ChatPage.vue';
import AdminPage from './pages/AdminPage.vue';
import CreatePage from './pages/CreatePage.vue';

// Фаза 2 завершена: все основные разделы перенесены на Vue + PrimeVue.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/chat' },
    { path: '/chat', component: ChatPage, meta: { id: 'chat' } },
    { path: '/solutions', component: SolutionsPage, meta: { id: 'solutions' } },
    { path: '/create', component: CreatePage, meta: { id: 'create' } },
    { path: '/usage', component: UsagePage, meta: { id: 'usage' } },
    { path: '/settings', component: AccountPage, meta: { id: 'settings' } },
    { path: '/admin', component: AdminPage, meta: { id: 'admin' } },
  ],
});
