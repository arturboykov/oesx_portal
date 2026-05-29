import type { Meta, StoryObj } from '@storybook/vue3';
import TokensShowcase from './TokensShowcase.vue';

const meta: Meta<typeof TokensShowcase> = {
  title: 'Foundations/Design Tokens',
  component: TokensShowcase,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof TokensShowcase>;

export const All: Story = {};
