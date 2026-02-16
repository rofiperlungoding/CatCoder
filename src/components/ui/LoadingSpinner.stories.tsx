import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
    title: 'UI/LoadingSpinner',
    component: LoadingSpinner,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'number' },
        className: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
    args: {
        size: 24,
    },
};

export const Small: Story = {
    args: {
        size: 16,
    },
};

export const Large: Story = {
    args: {
        size: 48,
    },
};

export const CustomColor: Story = {
    args: {
        size: 32,
        className: 'text-primary',
    },
};
