import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// Vue-версия OES X. Порт 5174 — чтобы не конфликтовать с React-прототипом (5173).
// base '/' для локальной разработки; при деплое выставить '/oesx/' как в React-версии.
export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: { port: 5174 },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
