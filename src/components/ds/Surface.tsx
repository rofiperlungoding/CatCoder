import React from 'react';

type Elevation = 1 | 2 | 3;

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    elevation?: Elevation;
    /** Render an ambient brand glow behind the content. */
    glow?: boolean;
    as?: keyof React.JSX.IntrinsicElements;
}

const ELEVATION_CLASS: Record<Elevation, string> = {
    1: 'cc-e1',
    2: 'cc-e2',
    3: 'cc-e3',
};

/**
 * Base card surface for the CatCoder design system.
 * Soft-UI: layered shadow + 1px top light edge + sheen gradient (via .cc-card).
 */
export const Surface: React.FC<SurfaceProps> = ({
    elevation = 2,
    glow = false,
    className = '',
    children,
    ...props
}) => {
    return (
        <div
            className={`cc-card ${ELEVATION_CLASS[elevation]} ${glow ? 'cc-glow overflow-hidden' : ''} ${className}`}
            {...props}
        >
            {glow ? <div className="relative z-10 h-full">{children}</div> : children}
        </div>
    );
};

export default Surface;
