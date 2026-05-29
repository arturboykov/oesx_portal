import type { Meta, StoryObj } from '@storybook/vue3';
import Button from 'primevue/button';

// PrimeVue Button под пресетом OES X — демонстрация моста токенов.
// Meta без дженерика: типы PrimeVue Button слишком сложны для вывода Storybook.
const meta: Meta = {
  title: 'PrimeVue/Button',
  component: Button as unknown as Record<string, unknown>,
  argTypes: {
    severity: { control: 'select', options: [undefined, 'secondary', 'success', 'info', 'warn', 'danger', 'contrast'] },
    size: { control: 'select', options: [undefined, 'small', 'large'] },
    disabled: { control: 'boolean' },
    text: { control: 'boolean' },
    outlined: { control: 'boolean' },
  },
  args: { label: 'Опубликовать', disabled: false },
};
export default meta;

type Story = StoryObj;

export const Playground: Story = {};

export const Severities: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <Button label="Primary" />
        <Button label="Secondary" severity="secondary" />
        <Button label="Danger" severity="danger" />
        <Button label="Warn" severity="warn" />
        <Button label="Text" text />
        <Button label="Disabled" disabled />
      </div>`,
  }),
};
