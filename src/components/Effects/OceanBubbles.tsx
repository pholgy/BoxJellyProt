import React, { memo } from 'react';

/**
 * Cute floating ocean bubbles background effect.
 * Pure CSS animation - no JS overhead.
 */
export const OceanBubbles: React.FC = memo(() => (
  <div className="ocean-bubbles" aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        className="bubble"
        style={{
          '--delay': `${i * 2.5}s`,
          '--size': `${4 + (i % 4) * 3}px`,
          '--left': `${5 + (i * 8) % 90}%`,
          '--duration': `${8 + (i % 5) * 3}s`,
          '--wobble': `${20 + (i % 3) * 15}px`,
        } as React.CSSProperties}
      />
    ))}
  </div>
));

OceanBubbles.displayName = 'OceanBubbles';
