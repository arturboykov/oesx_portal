import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { OESXPreset } from './presets/oesx-preset';
import { router } from './router';
import App from './App.vue';

// Порядок CSS важен: токены OES X → layout → мост PrimeVue последним.
import './assets/tokens.css';
import './assets/app.css';
import './assets/prime-bridge.css';

// Тему ведёт OES X через [data-theme] на <html>. dark — по умолчанию.
if (!document.documentElement.getAttribute('data-theme')) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: OESXPreset,
    options: {
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: false,
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(router);

app.mount('#app');
