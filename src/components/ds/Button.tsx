import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    /** Square icon-only button. */
    iconOnly?: boolean;
}

const VARIANT: Record<Variant, string> = {
    primary: 'cc-btn-primary',
    // The icon tier reuses the secondary surface treatment.
    secondary: 'cc-btn-secondary',
    ghost: 'cc-btn-ghost',
    icon: 'cc-btn-secondary',
};

// Heights: sm 32 / md 40 / lg 44 (spec v2). Radius 12px on all (via .cc-btn).
const SIZE: Record<Size, string> = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-11 px-6 text-base',
};

const ICON_SIZE: Record<Size, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
};

/**
 * Tactile button. Tiers: primary (clay green), secondary (surface+border),
 * ghost (transparent), icon (square). Identical hover/press/focus states.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    iconOnly = false,
    className = '',
    children,
    ...props
}) => {
    const sizing = iconOnly || variant === 'icon' ? ICON_SIZE[size] : SIZE[size];
    return (
        <button
            className={`cc-btn ${VARIANT[variant]} ${sizing} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
