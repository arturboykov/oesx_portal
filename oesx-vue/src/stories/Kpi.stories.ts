import type { Meta, StoryObj } from '@storybook/vue3';
import Kpi from '../components/Kpi.vue';

const meta: Meta<typeof Kpi> = {
  title: 'Atoms/Kpi',
  component: Kpi,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'pos', 'neg', 'warn', 'teal', 'info'] },
    subTone: { control: 'select', options: ['neutral', 'pos', 'neg', 'warn', 'teal', 'info'] },
  },
  args: { label: 'КИО смены', value: '78.2', unit: '%', sub: '+2.4 п.п. к плану', subTone: 'pos', tone: 'teal' },
  render: (args) => ({
    components: { Kpi },
    setup: () => ({ args }),
    template: '<div style="max-width:280px"><Kpi v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof Kpi>;

export const Playground: Story = {};

export const Grid: Story = {
  render: () => ({
    components: { Kpi },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:760px">
        <Kpi label="Объём вскрыши" value="14.6" unit="тыс.м³" sub="−0.4 к плану" subTone="neg" tone="neutral" />
        <Kpi label="КИО смены" value="78.2" unit="%" sub="+2.4 п.п." subTone="pos" tone="teal" />
        <Kpi label="Средний цикл" value="2.8" unit="мин" sub="в норме" tone="info" />
      </div>`,
  }),
};
