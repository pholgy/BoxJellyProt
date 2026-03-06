import React, { useState, useEffect, useCallback, memo } from 'react';

/**
 * A tiny jellyfish that follows the cursor with a springy delay.
 * Only renders on pointer devices (no touch).
 */
export const CursorJellyfish: React.FC = memo(() => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only show on devices with a fine pointer (mouse)
    const mq = window.matchMedia('(pointer: fine)');
    setIsPointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!isPointer) return;
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPointer, handleMouseMove, handleMouseLeave]);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setIsPointer(false);
  }, []);

  if (!isPointer || !visible) return null;

  return (
    <div
      className="cursor-jellyfish"
      aria-hidden="true"
      style={{
        transform: `translate(${pos.x + 12}px, ${pos.y + 12}px)`,
      }}
    >
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
        {/* Mini jellyfish bell */}
        <ellipse cx="10" cy="7" rx="8" ry="5.5" fill="#4FC3F7" opacity="0.6" />
        <ellipse cx="10" cy="7" rx="6" ry="4" fill="#29B6F6" opacity="0.7" />
        {/* Tiny eyes */}
        <circle cx="8" cy="6.5" r="0.8" fill="#1565C0" />
        <circle cx="12" cy="6.5" r="0.8" fill="#1565C0" />
        {/* Smile */}
        <path d="M9 8.5 Q10 9.5 11 8.5" stroke="#1565C0" strokeWidth="0.5" fill="none" />
        {/* Mini tentacles */}
        <path d="M5 11 C4 14, 3 17, 2 20" stroke="#F06292" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
        <path d="M8 12 C7 15, 6 18, 5 21" stroke="#F06292" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
        <path d="M12 12 C13 15, 14 18, 15 21" stroke="#F06292" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
        <path d="M15 11 C16 14, 17 17, 18 20" stroke="#F06292" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
      </svg>
    </div>
  );
});

CursorJellyfish.displayName = 'CursorJellyfish';
