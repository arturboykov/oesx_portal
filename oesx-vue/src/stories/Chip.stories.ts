import type { Meta, StoryObj } from '@storybook/vue3';
import Chip from '../components/Chip.vue';

const KINDS = ['dash', 'alert', 'app', 'command', 'pos', 'neg', 'warn', 'neutral', 'draft'];

const meta: Meta<typeof Chip> = {
  title: 'Atoms/Chip',
  component: Chip,
  argTypes: {
    kind: { control: 'select', options: KINDS },
    dot: { control: 'boolean' },
  },
  args: { kind: 'command', dot: false },
  render: (args) => ({
    components: { Chip },
    setup: () => ({ args }),
    template: '<Chip v-bind="args">{{ String(args.kind).toUpperCase() }}</Chip>',
  }),
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const AllKinds: Story = {
  render: () => ({
    components: { Chip },
    setup: () => ({ kinds: KINDS }),
    template: '<div style="display:flex;gap:8px;flex-wrap:wrap"><Chip v-for="k in kinds" :key="k" :kind="k" dot>{{ k.toUpperCase() }}</Chip></div>',
  }),
};
