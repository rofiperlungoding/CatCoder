import { Delete02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'ghost', 'danger'],
            description: 'The visual style of the button',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'The size of the button',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Whether the button should take up the full width of its container',
        },
        disabled: {
            control: 'boolean',
        },
        onClick: { action: 'clicked' },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Danger Button',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Button',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large Button',
    },
};

export const FullWidth: Story = {
    args: {
        fullWidth: true,
        children: 'Full Width Button',
    },
    parameters: {
        layout: 'padded',
    },
};

export const WithIcon: Story = {
    args: {
        variant: 'primary',
        children: (
            <>
                Get Started <Icon icon={ArrowRight01Icon} size={16} className="ml-2" />
            </>
        ),
    },
};

export const IconOnly: Story = {
    args: {
        variant: 'danger',
        size: 'sm',
        children: <Icon icon={Delete02Icon} size={16} />,
        'aria-label': 'Delete',
    }
}
