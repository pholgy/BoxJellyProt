import React, { useState, useEffect, useCallback } from 'react';

interface JellyfishIconProps {
  className?: string;
  alt?: string;
  interactive?: boolean;
}

type Mood = 'idle' | 'happy' | 'love' | 'sleepy';

const KawaiiJellyfish: React.FC<{ className?: string; mood: Mood; onClick?: () => void; ariaLabel?: string }> = ({ className, mood, onClick, ariaLabel }) => {
  const [blinkFrame, setBlinkFrame] = useState(false);

  // Blink every 3-5 seconds
  useEffect(() => {
    const blink = () => {
      setBlinkFrame(true);
      setTimeout(() => setBlinkFrame(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const eyeStyle = blinkFrame ? 'scaleY(0.1)' : 'scaleY(1)';
  const isHappy = mood === 'happy' || mood === 'love';
  const isSleepy = mood === 'sleepy';

  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      role="img"
      aria-label={ariaLabel || "Cute jellyfish mascot"}
    >
      {/* Glow effect */}
      <defs>
        <radialGradient id="jellyglow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#B3E5FC" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#B3E5FC" stopOpacity="0" />
        </radialGradient>
        <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="1" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feFlood floodColor="#4FC3F7" floodOpacity="0.2" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow */}
      <circle cx="48" cy="36" r="35" fill="url(#jellyglow)" />

      {/* Jellyfish bell with gradient */}
      <ellipse cx="48" cy="32" rx="30" ry="20" fill="#4FC3F7" filter="url(#softshadow)">
        <animate attributeName="ry" values="20;21;20" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="48" cy="32" rx="26" ry="16" fill="#29B6F6">
        <animate attributeName="ry" values="16;17;16" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="48" cy="32" rx="18" ry="11" fill="#03A9F4" />

      {/* Highlight shimmer */}
      <ellipse cx="40" cy="26" rx="6" ry="3" fill="#E1F5FE" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="54" cy="28" rx="3" ry="1.5" fill="#E1F5FE" opacity="0.5" />

      {/* Blush marks */}
      {isHappy && (
        <>
          <circle cx="36" cy="34" r="3" fill="#F48FB1" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.3;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="34" r="3" fill="#F48FB1" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.3;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Eyes */}
      <g>
        {isSleepy ? (
          <>
            {/* Sleeping eyes - closed lines */}
            <line x1="39" y1="30" x2="45" y2="30" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="51" y1="30" x2="57" y2="30" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            {/* Happy eyes - upward arcs */}
            <path d="M39 31 Q42 27 45 31" stroke="#1565C0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M51 31 Q54 27 57 31" stroke="#1565C0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Normal eyes with blink */}
            <ellipse cx="42" cy="30" rx="2.5" ry="3" fill="#1565C0" style={{ transform: eyeStyle, transformOrigin: '42px 30px' }} />
            <ellipse cx="54" cy="30" rx="2.5" ry="3" fill="#1565C0" style={{ transform: eyeStyle, transformOrigin: '54px 30px' }} />
            {/* Eye shine */}
            <circle cx="43" cy="29" r="0.8" fill="#BBDEFB" />
            <circle cx="55" cy="29" r="0.8" fill="#BBDEFB" />
          </>
        )}
      </g>

      {/* Mouth */}
      {isHappy ? (
        <path d="M45 35 Q48 39 51 35" stroke="#1565C0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      ) : isSleepy ? (
        <circle cx="48" cy="35" r="1.5" fill="#1565C0" opacity="0.6" />
      ) : (
        <path d="M46 35 Q48 37 50 35" stroke="#1565C0" strokeWidth="1" fill="none" strokeLinecap="round" />
      )}

      {/* Body */}
      <ellipse cx="48" cy="44" rx="7" ry="8" fill="#81C784" opacity="0.7">
        <animate attributeName="ry" values="8;9;8" dur="2.5s" repeatCount="indefinite" />
      </ellipse>

      {/* Tentacles with wave animation */}
      <path d="M36 48 C34 54, 30 60, 28 68" stroke="#F06292" strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M36 48 C34 54, 30 60, 28 68;M36 48 C32 54, 28 60, 26 68;M36 48 C34 54, 30 60, 28 68" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M42 50 C40 56, 36 62, 34 70" stroke="#F06292" strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M42 50 C40 56, 36 62, 34 70;M42 50 C38 56, 34 62, 32 70;M42 50 C40 56, 36 62, 34 70" dur="2.8s" repeatCount="indefinite" />
      </path>
      <path d="M48 52 C48 58, 46 64, 44 72" stroke="#F06292" strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M48 52 C48 58, 46 64, 44 72;M48 52 C46 58, 44 64, 42 72;M48 52 C48 58, 46 64, 44 72" dur="3.2s" repeatCount="indefinite" />
      </path>
      <path d="M54 50 C56 56, 60 62, 62 70" stroke="#F06292" strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M54 50 C56 56, 60 62, 62 70;M54 50 C58 56, 62 62, 64 70;M54 50 C56 56, 60 62, 62 70" dur="2.6s" repeatCount="indefinite" />
      </path>
      <path d="M60 48 C62 54, 66 60, 68 68" stroke="#F06292" strokeWidth="2" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M60 48 C62 54, 66 60, 68 68;M60 48 C64 54, 68 60, 70 68;M60 48 C62 54, 66 60, 68 68" dur="3.4s" repeatCount="indefinite" />
      </path>

      {/* Love hearts when mood is 'love' */}
      {mood === 'love' && (
        <>
          <text x="22" y="20" fontSize="8" opacity="0.8">
            <animate attributeName="y" values="20;10;20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            &#x2764;
          </text>
          <text x="68" y="16" fontSize="6" opacity="0.6">
            <animate attributeName="y" values="16;6;16" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            &#x2764;
          </text>
          <text x="28" y="12" fontSize="5" opacity="0.4">
            <animate attributeName="y" values="12;4;12" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
            &#x2764;
          </text>
        </>
      )}

      {/* Sleepy Zzz */}
      {isSleepy && (
        <>
          <text x="62" y="22" fontSize="7" fill="#90CAF9" fontWeight="bold">
            <animate attributeName="y" values="22;18;22" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            z
          </text>
          <text x="68" y="16" fontSize="5" fill="#90CAF9" fontWeight="bold">
            <animate attributeName="y" values="16;12;16" dur="2.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.3s" repeatCount="indefinite" />
            z
          </text>
        </>
      )}
    </svg>
  );
};

export const JellyfishIcon: React.FC<JellyfishIconProps> = ({
  className = "w-20 h-20",
  alt = "Jellyfish",
  interactive = false
}) => {
  const [mood, setMood] = useState<Mood>('idle');
  const [clickCount, setClickCount] = useState(0);

  const handleClick = useCallback(() => {
    if (!interactive) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setMood('love');
      setTimeout(() => { setMood('idle'); setClickCount(0); }, 3000);
    } else {
      setMood('happy');
      setTimeout(() => setMood('idle'), 2000);
    }
  }, [interactive, clickCount]);

  // Occasional sleepy state
  useEffect(() => {
    if (!interactive) return;
    const timeout = setTimeout(() => {
      if (mood === 'idle') {
        setMood('sleepy');
        setTimeout(() => setMood('idle'), 4000);
      }
    }, 30000 + Math.random() * 30000);
    return () => clearTimeout(timeout);
  }, [interactive, mood]);

  return (
    <KawaiiJellyfish
      className={className}
      mood={mood}
      onClick={interactive ? handleClick : undefined}
      ariaLabel={alt}
    />
  );
};
