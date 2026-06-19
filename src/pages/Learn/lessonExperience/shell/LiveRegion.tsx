/**
 * Single polite live region (Req 16.5). Phase changes, feedback results, test
 * results, and hint reveals all write here. When there is no message the region
 * is left unchanged rather than cleared, avoiding spurious empty announcements.
 */
import React from 'react';

interface LiveRegionProps {
    message: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ message }) => (
    <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {message}
    </div>
);

export default LiveRegion;
