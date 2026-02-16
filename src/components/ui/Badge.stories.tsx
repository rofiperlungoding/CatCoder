import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
    title: 'UI/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'outline'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Success: Story = {
    args: {
        variant: 'success',
        children: 'Success',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        children: 'Warning',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Danger',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Badge',
    },
};
