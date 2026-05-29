import type { Preview } from '@storybook/vue3';
import { setup } from '@storybook/vue3';
import PrimeVue from 'primevue/config';
import { OESXPreset } from '../src/presets/oesx-preset';

// Тот же порядок CSS, что в приложении: токены → layout → мост PrimeVue.
import '../src/assets/tokens.css';
import '../src/assets/app.css';
import '../src/assets/prime-bridge.css';

setup((app) => {
  app.use(PrimeVue, {
    theme: { preset: OESXPreset, options: { darkModeSelector: '[data-theme="dark"]', cssLayer: false } },
  });
});

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Тема OES X',
      defaultValue: 'dark',
      toolbar: {
        title: 'Тема',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Тёмная' },
          { value: 'light', title: 'Светлая' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, ctx) => {
      document.documentElement.setAttribute('data-theme', (ctx.globals.theme as string) || 'dark');
      return { components: { story }, template: '<div style="padding:24px"><story /></div>' };
    },
  ],
};

export default preview;
