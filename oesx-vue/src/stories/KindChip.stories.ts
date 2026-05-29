import type { Meta, StoryObj } from '@storybook/vue3';
import KindChip from '../components/KindChip.vue';

const KINDS = ['dash', 'alert', 'command', 'automation', 'app', 'draft'];

const meta: Meta<typeof KindChip> = {
  title: 'Atoms/KindChip',
  component: KindChip,
  argTypes: { kind: { control: 'select', options: KINDS } },
  args: { kind: 'dash' },
};
export default meta;

type Story = StoryObj<typeof KindChip>;

export const Playground: Story = {};

export const AllKinds: Story = {
  render: () => ({
    components: { KindChip },
    setup: () => ({ kinds: KINDS }),
    template: '<div style="display:flex;gap:8px;flex-wrap:wrap"><KindChip v-for="k in kinds" :key="k" :kind="k" /></div>',
  }),
};
