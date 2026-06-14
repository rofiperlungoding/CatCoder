import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
    primary: 'cc-btn-primary',
    secondary: 'cc-btn-secondary',
    ghost: 'cc-btn-ghost',
};

const SIZE: Record<Size, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
};

/**
 * Tactile button. Primary = clay-lite green with inner highlight, soft glow,
 * and a press state (handled in .cc-btn-* CSS).
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    ...props
}) => (
    <button
        className={`cc-btn ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default Button;
