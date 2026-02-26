import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

// Require the icon and any valid HugeiconsIcon props
type IconProps = ComponentProps<typeof HugeiconsIcon>;

export const Icon: React.FC<IconProps> = ({
  size = 20, // Default sizing common in standard icons
  color = 'currentColor', // Default standard text color inheritance
  strokeWidth = 2, // Default thickness up from 1.5 for industrial aesthetic
  className = '',
  ...rest
}) => {
  return (
    <HugeiconsIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      {...rest}
    />
  );
};
