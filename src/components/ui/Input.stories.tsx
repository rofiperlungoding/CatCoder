import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        error: { control: 'text' },
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithLabel: Story = {
    args: {
        label: 'Username',
        placeholder: 'Enter username',
    },
};

export const WithIcon: Story = {
    args: {
        label: 'Email',
        type: 'email',
        placeholder: 'john@example.com',
        icon: <Mail size={18} />,
    },
};

export const WithError: Story = {
    args: {
        label: 'Password',
        type: 'password',
        value: '123',
        icon: <Lock size={18} />,
        error: 'Password must be at least 8 characters',
    },
};

export const Disabled: Story = {
    args: {
        label: 'Disabled Input',
        placeholder: 'Cannot type here',
        disabled: true,
    },
};
