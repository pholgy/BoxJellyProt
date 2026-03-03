# Bioluminescent Design Overhaul - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Box Jellyfish Toxin Analysis app from utilitarian Streamlit-like design to a stunning bioluminescent marine research station interface, preserving all scientific functionality and Thai language support.

**Architecture:** Performance-conscious CSS-first approach. Override Ant Design + Tailwind theming with deep navy backgrounds, electric blue accents, and glassmorphism effects. Three-tier device capability detection ensures the app works on academic hardware. All animations use only `transform` and `opacity` for GPU acceleration. Existing Zustand stores, services, and data types remain untouched.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Ant Design v5, Framer Motion, React Three Fiber, Recharts, Zustand

---

## Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion for animation orchestration**

Run:
```bash
npm install framer-motion
```

**Step 2: Verify installation**

Run:
```bash
node -e "require('framer-motion/package.json').version" 2>/dev/null || node -e "const p = JSON.parse(require('fs').readFileSync('node_modules/framer-motion/package.json'));console.log(p.version)"
```

Expected: Prints version number (10.x or 11.x)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion for animation system"
```

---

## Task 2: Create Bioluminescent Theme System

**Files:**
- Create: `src/theme/bioluminescent.ts`
- Create: `src/theme/index.ts`

**Step 1: Create the theme configuration**

Create `src/theme/bioluminescent.ts`:

```typescript
/**
 * Bioluminescent Marine Research Station Theme
 *
 * Color philosophy: Deep-sea research facility aesthetic.
 * Dark navy backgrounds with electric blue/teal accents.
 * Glassmorphism panels simulate underwater observation windows.
 */

export const bioColors = {
  // Base backgrounds
  navy: {
    900: '#0a0f14',
    800: '#0F1419',
    700: '#1A2332',
    600: '#243044',
    500: '#2e3e56',
  },
  // Primary accent - Electric Blue (desaturated to ~70%)
  accent: {
    500: '#00D4FF',
    400: '#33ddff',
    300: '#66e5ff',
    200: '#99eeff',
    100: '#ccf6ff',
    glow: 'rgba(0, 212, 255, 0.3)',
    subtle: 'rgba(0, 212, 255, 0.1)',
    border: 'rgba(0, 212, 255, 0.2)',
  },
  // Secondary accent - Teal
  teal: {
    500: '#4ECDC4',
    400: '#71d7d0',
    300: '#94e1dc',
    glow: 'rgba(78, 205, 196, 0.3)',
    subtle: 'rgba(78, 205, 196, 0.1)',
  },
  // Text hierarchy
  text: {
    primary: '#f4f4f5',    // zinc-100
    secondary: '#a1a1aa',  // zinc-400
    muted: '#71717a',      // zinc-500
    accent: '#00D4FF',
  },
  // Semantic colors
  success: '#4ECDC4',
  warning: '#f59e0b',
  error: '#ef4444',
  // Glassmorphism
  glass: {
    bg: 'rgba(15, 20, 25, 0.8)',
    bgLight: 'rgba(26, 35, 50, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  // Rating colors (scientific results)
  rating: {
    excellent: '#4ECDC4',
    good: '#00D4FF',
    moderate: '#f59e0b',
    weak: '#f97316',
    veryWeak: '#ef4444',
  },
} as const;

/** Ant Design theme override token */
export const antdBioTheme = {
  token: {
    colorPrimary: bioColors.accent[500],
    colorBgContainer: bioColors.navy[700],
    colorBgElevated: bioColors.navy[600],
    colorBgLayout: bioColors.navy[800],
    colorText: bioColors.text.primary,
    colorTextSecondary: bioColors.text.secondary,
    colorBorder: bioColors.glass.border,
    colorBorderSecondary: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    fontFamily: "'Geist', 'Noto Sans Thai', system-ui, sans-serif",
    colorLink: bioColors.accent[500],
    colorSuccess: bioColors.success,
    colorWarning: bioColors.warning,
    colorError: bioColors.error,
    colorBgBase: bioColors.navy[800],
    colorTextBase: bioColors.text.primary,
  },
  components: {
    Table: {
      colorBgContainer: 'rgba(15, 20, 25, 0.4)',
      headerBg: 'rgba(0, 212, 255, 0.08)',
      headerColor: bioColors.text.primary,
      rowHoverBg: 'rgba(0, 212, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
      colorText: bioColors.text.primary,
    },
    Card: {
      colorBgContainer: bioColors.glass.bg,
      colorBorderSecondary: bioColors.glass.border,
    },
    Select: {
      colorBgContainer: bioColors.navy[700],
      colorBgElevated: bioColors.navy[600],
      optionSelectedBg: 'rgba(0, 212, 255, 0.15)',
    },
    Button: {
      borderRadius: 12,
    },
    Alert: {
      colorInfoBg: 'rgba(0, 212, 255, 0.08)',
      colorInfoBorder: bioColors.accent.border,
    },
    Tabs: {
      colorBgContainer: 'transparent',
      itemSelectedColor: bioColors.accent[500],
      inkBarColor: bioColors.accent[500],
    },
    Statistic: {
      colorTextDescription: bioColors.text.secondary,
    },
    Divider: {
      colorSplit: 'rgba(255, 255, 255, 0.08)',
    },
    Input: {
      colorBgContainer: bioColors.navy[700],
      activeBorderColor: bioColors.accent[500],
    },
    Slider: {
      trackBg: bioColors.accent[500],
      trackHoverBg: bioColors.accent[400],
      handleColor: bioColors.accent[500],
      railBg: 'rgba(255, 255, 255, 0.1)',
    },
    Progress: {
      defaultColor: bioColors.accent[500],
    },
    Checkbox: {
      colorPrimary: bioColors.accent[500],
    },
  },
};

/** CSS custom properties injected into :root */
export const cssCustomProperties: Record<string, string> = {
  '--bio-navy-900': bioColors.navy[900],
  '--bio-navy-800': bioColors.navy[800],
  '--bio-navy-700': bioColors.navy[700],
  '--bio-navy-600': bioColors.navy[600],
  '--bio-navy-500': bioColors.navy[500],
  '--bio-accent': bioColors.accent[500],
  '--bio-accent-glow': bioColors.accent.glow,
  '--bio-accent-subtle': bioColors.accent.subtle,
  '--bio-accent-border': bioColors.accent.border,
  '--bio-teal': bioColors.teal[500],
  '--bio-teal-glow': bioColors.teal.glow,
  '--bio-teal-subtle': bioColors.teal.subtle,
  '--bio-text-primary': bioColors.text.primary,
  '--bio-text-secondary': bioColors.text.secondary,
  '--bio-text-muted': bioColors.text.muted,
  '--bio-glass-bg': bioColors.glass.bg,
  '--bio-glass-border': bioColors.glass.border,
};
```

**Step 2: Create theme barrel export**

Create `src/theme/index.ts`:

```typescript
export { bioColors, antdBioTheme, cssCustomProperties } from './bioluminescent';
```

**Step 3: Commit**

```bash
git add src/theme/
git commit -m "feat: create bioluminescent theme system with color palette and Ant Design overrides"
```

---

## Task 3: Create Device Capability Detection Hook

**Files:**
- Create: `src/hooks/useDeviceCapability.ts`
- Create: `src/hooks/index.ts`

**Step 1: Create the performance detection hook**

Create `src/hooks/useDeviceCapability.ts`:

```typescript
import { useState, useEffect } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low';

interface DeviceCapabilities {
  tier: PerformanceTier;
  supportsBackdropFilter: boolean;
  supportsWebGL: boolean;
  prefersReducedMotion: boolean;
}

function detectTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'low';

  const cores = navigator.hardwareConcurrency || 2;
  const dpr = window.devicePixelRatio || 1;
  const memory = (navigator as any).deviceMemory;

  if (dpr > 1 && cores > 4 && (!memory || memory >= 8)) return 'high';
  if (cores > 2) return 'medium';
  return 'low';
}

function checkBackdropFilter(): boolean {
  if (typeof CSS === 'undefined') return false;
  return CSS.supports('backdrop-filter', 'blur(1px)') ||
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function useDeviceCapability(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    tier: 'medium',
    supportsBackdropFilter: true,
    supportsWebGL: true,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setCapabilities({
      tier: detectTier(),
      supportsBackdropFilter: checkBackdropFilter(),
      supportsWebGL: checkWebGL(),
      prefersReducedMotion: motionQuery.matches,
    });

    const handler = (e: MediaQueryListEvent) => {
      setCapabilities(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    motionQuery.addEventListener('change', handler);
    return () => motionQuery.removeEventListener('change', handler);
  }, []);

  return capabilities;
}
```

**Step 2: Create hooks barrel export**

Create `src/hooks/index.ts`:

```typescript
export { useDeviceCapability } from './useDeviceCapability';
export type { PerformanceTier } from './useDeviceCapability';
```

**Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add device capability detection hook for progressive enhancement"
```

---

## Task 4: Extend Tailwind Config with Bioluminescent Palette

**Files:**
- Modify: `tailwind.config.js`

**Step 1: Update tailwind config**

Replace `tailwind.config.js` contents with:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#00D4FF',
        secondary: '#4ECDC4',
        bio: {
          900: '#0a0f14',
          800: '#0F1419',
          700: '#1A2332',
          600: '#243044',
          500: '#2e3e56',
        },
        accent: {
          DEFAULT: '#00D4FF',
          light: '#33ddff',
          dark: '#00a8cc',
        },
        teal: {
          DEFAULT: '#4ECDC4',
          light: '#71d7d0',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'bio-shift': 'bioShift 20s ease-in-out infinite',
        'bio-pulse': 'bioPulse 4s ease-in-out infinite',
        'bio-glow': 'bioGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        bioShift: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        bioPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        bioGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 212, 255, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 212, 255, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'bio': '0 0 15px rgba(0, 212, 255, 0.15)',
        'bio-lg': '0 0 30px rgba(0, 212, 255, 0.2)',
        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
```

**Step 2: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: extend Tailwind config with bioluminescent color palette and animations"
```

---

## Task 5: Overhaul Global CSS with Bioluminescent Foundation

**Files:**
- Modify: `src/index.css`

**Step 1: Replace global styles**

Replace `src/index.css` contents with:

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   BIOLUMINESCENT MARINE RESEARCH STATION THEME
   ============================================ */

@layer base {
  :root {
    --bio-navy-900: #0a0f14;
    --bio-navy-800: #0F1419;
    --bio-navy-700: #1A2332;
    --bio-navy-600: #243044;
    --bio-accent: #00D4FF;
    --bio-accent-glow: rgba(0, 212, 255, 0.3);
    --bio-accent-subtle: rgba(0, 212, 255, 0.1);
    --bio-accent-border: rgba(0, 212, 255, 0.2);
    --bio-teal: #4ECDC4;
    --bio-teal-subtle: rgba(78, 205, 196, 0.1);
    --bio-glass-bg: rgba(15, 20, 25, 0.8);
    --bio-glass-border: rgba(255, 255, 255, 0.1);
    --bio-ease: cubic-bezier(0.16, 1, 0.3, 1);
  }

  body {
    font-family: 'Geist', 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
    background-color: var(--bio-navy-800);
    color: #f4f4f5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  /* === Bioluminescent Background === */
  .bio-background {
    position: relative;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(78, 205, 196, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(0, 212, 255, 0.04) 0%, transparent 40%),
      linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #0F1419 100%);
    min-height: 100dvh;
  }

  /* === Glassmorphism Panel === */
  .glass-panel {
    background: var(--bio-glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--bio-glass-border);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
  }

  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur(1px)) {
    .glass-panel {
      background: rgba(15, 20, 25, 0.95);
    }
  }

  .glass-panel-light {
    background: rgba(26, 35, 50, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--bio-glass-border);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
  }

  /* === Bioluminescent Headers === */
  .main-header {
    font-size: 2rem;
    font-weight: 700;
    color: #f4f4f5;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .main-header-glow {
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
  }

  .sub-header {
    font-size: 1.1rem;
    color: #a1a1aa;
    line-height: 1.6;
    max-width: 65ch;
  }

  /* === Bioluminescent Buttons === */
  .bio-button {
    border-radius: 0.75rem;
    transition: all 0.3s var(--bio-ease);
    border: 1px solid var(--bio-accent-border);
    background: rgba(0, 212, 255, 0.1);
    color: var(--bio-accent);
    font-weight: 500;
    padding: 0.5rem 1.25rem;
  }

  .bio-button:hover {
    background: rgba(0, 212, 255, 0.18);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    transform: translateY(-1px);
  }

  .bio-button:active {
    transform: scale(0.98);
    box-shadow: none;
  }

  .bio-button-primary {
    background: var(--bio-accent);
    color: #0F1419;
    border-color: transparent;
    font-weight: 600;
  }

  .bio-button-primary:hover {
    background: #33ddff;
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.35);
  }

  /* === Sidebar / Navigation Panel === */
  .bio-sidebar {
    background: var(--bio-glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-right: 1px solid var(--bio-glass-border);
    box-shadow:
      inset -1px 0 0 rgba(255, 255, 255, 0.05),
      4px 0 24px rgba(0, 0, 0, 0.3);
  }

  .bio-nav-item {
    transition: all 0.3s var(--bio-ease);
    border-radius: 0.5rem;
    border: 1px solid transparent;
  }

  .bio-nav-item:hover {
    background: rgba(0, 212, 255, 0.06);
    border-color: rgba(0, 212, 255, 0.1);
    transform: translateX(2px);
  }

  .bio-nav-item.active {
    background: rgba(0, 212, 255, 0.12);
    border-color: var(--bio-accent-border);
    color: var(--bio-accent);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
  }

  /* === Data Tables === */
  .bio-table-wrapper {
    background: rgba(15, 20, 25, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--bio-accent-border);
    border-radius: 1rem;
    overflow: hidden;
  }

  /* === Metric Cards (Streamlit-style replacements) === */
  .metric-card {
    background: rgba(26, 35, 50, 0.5);
    border: 1px solid var(--bio-glass-border);
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    transition: all 0.3s var(--bio-ease);
  }

  .metric-card:hover {
    border-color: var(--bio-accent-border);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.08);
  }

  /* === Feature Cards === */
  .bio-card {
    background: var(--bio-glass-bg);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--bio-glass-border);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    border-radius: 1rem;
    transition: all 0.4s var(--bio-ease);
  }

  .bio-card:hover {
    border-color: var(--bio-accent-border);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0 20px rgba(0, 212, 255, 0.08);
    transform: translateY(-2px);
  }

  /* === Rating Colors (Scientific Results) === */
  .result-excellent { color: #4ECDC4; }
  .result-good { color: #00D4FF; }
  .result-moderate { color: #f59e0b; }
  .result-weak { color: #f97316; }
  .result-very-weak { color: #ef4444; }

  /* === Skeleton Loading === */
  .bio-skeleton {
    background: linear-gradient(
      90deg,
      rgba(26, 35, 50, 0.5) 25%,
      rgba(0, 212, 255, 0.08) 50%,
      rgba(26, 35, 50, 0.5) 75%
    );
    background-size: 400% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: 0.5rem;
  }

  /* === Scrollbar Styling === */
  .bio-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .bio-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .bio-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.2);
    border-radius: 3px;
  }
  .bio-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.35);
  }

  /* === 3D Viewer Holographic Overlay === */
  .holographic-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 212, 255, 0.03) 2px,
        rgba(0, 212, 255, 0.03) 4px
      );
    z-index: 1;
  }

  /* === Dividers === */
  .bio-divider {
    border-color: rgba(255, 255, 255, 0.08);
  }
}

/* === Ant Design Dark Theme Overrides === */
.ant-card {
  background: var(--bio-glass-bg) !important;
  border-color: var(--bio-glass-border) !important;
  border-radius: 1rem !important;
}

.ant-card-head {
  border-bottom-color: rgba(255, 255, 255, 0.06) !important;
  color: #f4f4f5 !important;
}

.ant-card-head-title {
  color: #f4f4f5 !important;
}

.ant-card-body {
  color: #a1a1aa !important;
}

.ant-table-wrapper {
  border-radius: 1rem;
  overflow: hidden;
}

.ant-table {
  background: transparent !important;
}

.ant-table-thead > tr > th {
  background: rgba(0, 212, 255, 0.08) !important;
  color: #f4f4f5 !important;
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  font-weight: 600;
}

.ant-table-tbody > tr > td {
  border-bottom-color: rgba(255, 255, 255, 0.04) !important;
  color: #a1a1aa !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ant-table-tbody > tr:hover > td {
  background: rgba(0, 212, 255, 0.04) !important;
}

.ant-select-selector {
  background: var(--bio-navy-700) !important;
  border-color: var(--bio-glass-border) !important;
  color: #f4f4f5 !important;
}

.ant-select-dropdown {
  background: var(--bio-navy-600) !important;
  border: 1px solid var(--bio-glass-border) !important;
}

.ant-select-item {
  color: #a1a1aa !important;
}

.ant-select-item-option-selected {
  background: rgba(0, 212, 255, 0.12) !important;
  color: var(--bio-accent) !important;
}

.ant-select-item-option-active {
  background: rgba(0, 212, 255, 0.06) !important;
}

.ant-alert {
  background: rgba(0, 212, 255, 0.06) !important;
  border-color: var(--bio-accent-border) !important;
  border-radius: 0.75rem !important;
}

.ant-alert-message {
  color: #f4f4f5 !important;
}

.ant-alert-description {
  color: #a1a1aa !important;
}

.ant-tabs-tab {
  color: #71717a !important;
}

.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: var(--bio-accent) !important;
}

.ant-tabs-ink-bar {
  background: var(--bio-accent) !important;
}

.ant-statistic-title {
  color: #71717a !important;
}

.ant-statistic-content {
  color: #f4f4f5 !important;
}

.ant-input {
  background: var(--bio-navy-700) !important;
  border-color: var(--bio-glass-border) !important;
  color: #f4f4f5 !important;
}

.ant-input:focus, .ant-input-focused {
  border-color: var(--bio-accent) !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.15) !important;
}

.ant-checkbox-checked .ant-checkbox-inner {
  background-color: var(--bio-accent) !important;
  border-color: var(--bio-accent) !important;
}

.ant-slider-track {
  background: var(--bio-accent) !important;
}

.ant-slider-handle::after {
  box-shadow: 0 0 0 2px var(--bio-accent) !important;
}

.ant-progress-bg {
  background: linear-gradient(90deg, var(--bio-accent), var(--bio-teal)) !important;
}

.ant-divider {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.ant-btn-primary {
  background: var(--bio-accent) !important;
  border-color: var(--bio-accent) !important;
  color: #0F1419 !important;
  font-weight: 600;
  border-radius: 0.75rem !important;
  box-shadow: none !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.ant-btn-primary:hover {
  background: #33ddff !important;
  border-color: #33ddff !important;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.25) !important;
  transform: translateY(-1px);
}

.ant-btn-primary:active {
  transform: scale(0.98) !important;
}

.ant-btn-default {
  background: rgba(0, 212, 255, 0.08) !important;
  border-color: var(--bio-accent-border) !important;
  color: var(--bio-accent) !important;
  border-radius: 0.75rem !important;
}

.ant-typography {
  color: #f4f4f5 !important;
}

.ant-typography.ant-typography-secondary {
  color: #a1a1aa !important;
}

/* === Recharts Bioluminescent Overrides === */
.recharts-cartesian-grid line {
  stroke: rgba(255, 255, 255, 0.06);
}

.recharts-text {
  fill: #a1a1aa;
}

.recharts-tooltip-wrapper .recharts-default-tooltip {
  background: var(--bio-navy-700) !important;
  border: 1px solid var(--bio-accent-border) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
}

.recharts-tooltip-label {
  color: #f4f4f5 !important;
}

.recharts-tooltip-item {
  color: #a1a1aa !important;
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: overhaul global CSS with bioluminescent theme, glassmorphism, and Ant Design dark overrides"
```

---

## Task 6: Update App.tsx with Bioluminescent Theme Provider

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx**

Replace `src/App.tsx` contents with:

```tsx
import React, { useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProteinsPage } from './pages/ProteinsPage';
import { DrugsPage } from './pages/DrugsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExportPage } from './pages/ExportPage';
import { antdBioTheme } from './theme';
import './index.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('🏠 หน้าแรก');

  const getRouteFromPage = (page: string): string => {
    switch (page) {
      case '🏠 หน้าแรก':
        return 'home';
      case '🧬 โปรตีนพิษ':
        return 'proteins';
      case '💊 สารยา':
        return 'drugs';
      case '🔬 จำลองการทดลอง':
        return 'simulation';
      case '📊 ผลลัพธ์':
        return 'results';
      case '📥 ส่งออกข้อมูล':
        return 'export';
      default:
        return 'home';
    }
  };

  const renderPage = () => {
    const route = getRouteFromPage(currentPage);

    switch (route) {
      case 'home':
        return <HomePage />;
      case 'proteins':
        return <ProteinsPage />;
      case 'drugs':
        return <DrugsPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'results':
        return <ResultsPage />;
      case 'export':
        return <ExportPage />;
      default:
        return <HomePage />;
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <ConfigProvider
      theme={{
        ...antdBioTheme,
        algorithm: antdTheme.darkAlgorithm,
      }}
    >
      <div data-testid="app-loaded" className="bio-background">
        <AppLayout currentPage={currentPage} onPageChange={handlePageChange}>
          {renderPage()}
        </AppLayout>
      </div>
    </ConfigProvider>
  );
};

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate bioluminescent theme provider with Ant Design dark algorithm"
```

---

## Task 7: Transform AppLayout to Bioluminescent Shell

**Files:**
- Modify: `src/components/Layout/AppLayout.tsx`

**Step 1: Update the layout**

Replace `src/components/Layout/AppLayout.tsx` contents with:

```tsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DatabaseService } from '../../services/database';
import { ErrorBoundary } from '../ErrorBoundary';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage = '🏠 หน้าแรก',
  onPageChange
}) => {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await DatabaseService.getDatabaseStats();
      } catch (error) {
        console.warn('Database initialization failed:', error);
      }
    };

    initDatabase();
  }, []);

  const handleNavigation = (newPage: string) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="flex min-h-[100dvh]"
        data-testid="app-layout"
      >
        {/* Sidebar Navigation Panel */}
        <ErrorBoundary
          fallback={
            <div className="w-72 min-h-[100dvh] bio-sidebar flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <p>เมนูไม่สามารถโหลดได้</p>
              </div>
            </div>
          }
        >
          <Sidebar
            currentPage={page}
            onNavigate={handleNavigation}
          />
        </ErrorBoundary>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bio-scrollbar">
          <ErrorBoundary>
            <div className="min-h-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/Layout/AppLayout.tsx
git commit -m "feat: transform AppLayout to bioluminescent shell with glass sidebar"
```

---

## Task 8: Transform Sidebar to Glassmorphism Navigation Panel

**Files:**
- Modify: `src/components/Layout/Sidebar.tsx`

**Step 1: Update sidebar with bioluminescent design**

Replace `src/components/Layout/Sidebar.tsx` contents with:

```tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/database';
import { DatabaseErrorBoundary } from '../ErrorBoundary';
import { JellyfishIcon } from '../Icons';

export interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface DatabaseStats {
  total_proteins: number;
  total_drugs: number;
}

const navigationItems = [
  '🏠 หน้าแรก',
  '🧬 โปรตีนพิษ',
  '💊 สารยา',
  '🔬 จำลองการทดลอง',
  '📊 ผลลัพธ์',
  '📥 ส่งออกข้อมูล'
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const databaseStats = await DatabaseService.getDatabaseStats();
        setStats(databaseStats);
      } catch (error) {
        console.error('Error loading database stats:', error);
        setStats({ total_proteins: 12, total_drugs: 25 });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <aside
      className="w-72 min-h-[100dvh] bio-sidebar flex flex-col"
      role="navigation"
      aria-label="เมนูหลักการนำทาง"
    >
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-white/[0.06]">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <JellyfishIcon
              className="w-20 h-20 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)]"
              alt="Box Jellyfish - แมงกะพรุนกล่อง"
            />
            <div className="absolute inset-0 rounded-full bg-accent/5 blur-xl" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-zinc-100 mb-1 tracking-tight">
          เมนูหลัก
        </h1>
        <p className="text-sm text-zinc-500">เลือกหน้า</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5" aria-label="เมนูหน้าต่างๆ">
        <div className="space-y-1" role="list">
          {navigationItems.map((item, index) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`
                w-full text-left px-4 py-3 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-bio-800
                bio-nav-item
                ${currentPage === item
                  ? 'active text-accent'
                  : 'text-zinc-400 hover:text-zinc-200'
                }
              `}
              role="listitem"
              aria-label={`ไปยังหน้า ${item}`}
              aria-current={currentPage === item ? 'page' : undefined}
              tabIndex={currentPage === item ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(item);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % navigationItems.length;
                  const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement;
                  nextButton?.focus();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = index === 0 ? navigationItems.length - 1 : index - 1;
                  const prevButton = e.currentTarget.parentElement?.children[prevIndex] as HTMLButtonElement;
                  prevButton?.focus();
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  const firstButton = e.currentTarget.parentElement?.children[0] as HTMLButtonElement;
                  firstButton?.focus();
                } else if (e.key === 'End') {
                  e.preventDefault();
                  const lastButton = e.currentTarget.parentElement?.children[navigationItems.length - 1] as HTMLButtonElement;
                  lastButton?.focus();
                }
              }}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-5 border-white/[0.06]" />

        {/* Database Stats */}
        <DatabaseErrorBoundary>
          <div className="space-y-3 px-1" role="region" aria-label="สถิติฐานข้อมูล">
            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-accent mb-1 font-mono"
                aria-label={`จำนวนโปรตีน ${isLoading ? 'กำลังโหลด' : stats?.total_proteins || 0} โปรตีน`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_proteins || 0
                )}
              </div>
              <div className="text-sm font-medium text-zinc-400">จำนวนโปรตีน</div>
            </div>

            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-teal mb-1 font-mono"
                aria-label={`จำนวนสารยา ${isLoading ? 'กำลังโหลด' : stats?.total_drugs || 0} สารยา`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_drugs || 0
                )}
              </div>
              <div className="text-sm font-medium text-zinc-400">จำนวนสารยา</div>
            </div>
          </div>
        </DatabaseErrorBoundary>

        {/* Divider */}
        <hr className="my-5 border-white/[0.06]" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        <div className="text-xs text-zinc-600 text-center space-y-1">
          <p>โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0</p>
          <p>&copy; 2025 - เพื่อการศึกษาและวิจัย</p>
        </div>
      </div>
    </aside>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/Layout/Sidebar.tsx
git commit -m "feat: transform Sidebar to glassmorphism navigation panel with bioluminescent styling"
```

---

## Task 9: Transform HomePage to Bioluminescent Design

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/HomePage.css`

**Step 1: Update HomePage.css**

Replace `src/pages/HomePage.css` contents with:

```css
.homepage {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 2.5rem;
}

.feature-cards .ant-card {
  background: var(--bio-glass-bg) !important;
  border: 1px solid var(--bio-glass-border) !important;
  border-radius: 1rem !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature-cards .ant-card:hover {
  border-color: var(--bio-accent-border) !important;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.08);
  transform: translateY(-2px);
}

.feature-cards .ant-card-head-title {
  color: #f4f4f5 !important;
  font-weight: 600;
}

.feature-cards .ant-card-body ul {
  color: #a1a1aa;
  padding-left: 0;
  list-style: none;
}

.feature-cards .ant-card-body li {
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1rem;
}

.feature-cards .ant-card-body li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--bio-accent);
  box-shadow: 0 0 6px var(--bio-accent-glow);
  transform: translateY(-50%);
}

.feature-cards .ant-card-body strong {
  color: var(--bio-accent);
}

.workflow-section {
  margin-bottom: 2rem;
}

.workflow-section .ant-table-wrapper {
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--bio-accent-border);
}

.featured-results {
  margin-top: 1rem;
}

.featured-metric .ant-statistic-content-value {
  color: var(--bio-accent) !important;
  font-weight: 700 !important;
}

.binding-affinity {
  color: var(--bio-teal);
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
}

.target-protein {
  font-size: 0.85rem;
}

.reference {
  color: #71717a !important;
  font-size: 0.85rem;
}
```

**Step 2: Update HomePage.tsx for bioluminescent header styling**

In `src/pages/HomePage.tsx`, update the header section JSX. Change:

```tsx
        <Title level={1} className="main-header">
          🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง
        </Title>
        <Paragraph className="sub-header">
          โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต
        </Paragraph>
```

To:

```tsx
        <Title level={1} className="main-header main-header-glow">
          🪼 โปรแกรมวิเคราะห์โครงสร้างโปรตีนในพิษแมงกะพรุนกล่อง
        </Title>
        <Paragraph className="sub-header">
          โดยใช้ฐานข้อมูลชีวสารสนเทศเพื่อการออกแบบยาต้านพิษในอนาคต
        </Paragraph>
```

**Step 3: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.css
git commit -m "feat: transform HomePage to bioluminescent design with glass cards and glow effects"
```

---

## Task 10: Transform ProteinsPage Styling

**Files:**
- Modify: `src/pages/ProteinsPage.tsx`

**Step 1: Read the current ProteinsPage**

Read `src/pages/ProteinsPage.tsx` to understand current class names.

**Step 2: Update Tailwind classes throughout ProteinsPage**

Apply these class substitutions throughout the file:
- `bg-white` → `glass-panel`
- `bg-gray-50` → `bg-bio-800`
- `border-gray-200` → `border-white/[0.06]`
- `text-gray-900` → `text-zinc-100`
- `text-gray-700` → `text-zinc-300`
- `text-gray-600` → `text-zinc-400`
- `text-gray-500` → `text-zinc-500`
- `text-blue-600` → `text-accent`
- `bg-blue-100` → `bg-accent/10`
- `bg-blue-50` → `bg-accent/5`
- `hover:bg-gray-50` → `hover:bg-white/[0.04]`
- `shadow-sm` → remove or replace with `shadow-bio`
- Container divs: add `max-w-[1400px] mx-auto` for page-level containers

The 3D Canvas viewer section: wrap with a `relative` div and add the holographic overlay:
```tsx
<div className="relative rounded-xl overflow-hidden border border-accent/20">
  <Canvas ...>
    {/* existing Three.js content */}
  </Canvas>
  <div className="holographic-overlay" />
</div>
```

**Step 3: Commit**

```bash
git add src/pages/ProteinsPage.tsx
git commit -m "feat: apply bioluminescent styling to ProteinsPage with glass panels and holographic 3D overlay"
```

---

## Task 11: Transform DrugsPage Styling

**Files:**
- Modify: `src/pages/DrugsPage.tsx`

**Step 1: Read and update DrugsPage**

Apply the same class substitution pattern as Task 10. Additionally:
- Wrap the 3D molecular viewer with `holographic-overlay` div
- Style the drug info panel with `glass-panel` class
- Apply `font-mono` to molecular formulas and weight values
- Update the data table to use `bio-table-wrapper` class

**Step 2: Commit**

```bash
git add src/pages/DrugsPage.tsx
git commit -m "feat: apply bioluminescent styling to DrugsPage with holographic molecular viewer"
```

---

## Task 12: Transform SimulationPage Styling

**Files:**
- Modify: `src/pages/SimulationPage.tsx`

**Step 1: Read and update SimulationPage**

Apply class substitutions and additionally:
- Style protein/drug selection panels with `glass-panel`
- Style the launch button with `bio-button-primary` classes
- Apply `font-mono` to simulation parameter values
- Style the progress bar section with bioluminescent gradient
- Style the success alert and preview table

**Step 2: Commit**

```bash
git add src/pages/SimulationPage.tsx
git commit -m "feat: apply bioluminescent styling to SimulationPage with glass selection panels"
```

---

## Task 13: Transform ResultsPage Styling

**Files:**
- Modify: `src/pages/ResultsPage.tsx`

**Step 1: Read and update ResultsPage**

Apply class substitutions and additionally:
- Style statistics cards at top with `metric-card` + `font-mono` for numbers
- Update the tab interface with bioluminescent styling
- Update Recharts colors:
  - Bar chart fill: `#00D4FF` (accent blue)
  - Pie chart colors: `['#00D4FF', '#4ECDC4', '#f59e0b', '#f97316', '#ef4444']`
- Style Top 10 expandable cards with `bio-card`
- Style analysis tables with `bio-table-wrapper`

**Step 2: Commit**

```bash
git add src/pages/ResultsPage.tsx
git commit -m "feat: apply bioluminescent styling to ResultsPage with themed charts and glass stat cards"
```

---

## Task 14: Transform ExportPage Styling

**Files:**
- Modify: `src/pages/ExportPage.tsx`

**Step 1: Read and update ExportPage**

Apply class substitutions and additionally:
- Style export option cards with `bio-card`
- Style download buttons with `bio-button-primary`
- Style data preview table with `bio-table-wrapper`
- Style publication table with enhanced typography
- Apply `font-mono` to scientific data values

**Step 2: Commit**

```bash
git add src/pages/ExportPage.tsx
git commit -m "feat: apply bioluminescent styling to ExportPage with glass export cards"
```

---

## Task 15: Enhance 3D Visualization Materials

**Files:**
- Modify: `src/pages/ProteinsPage.tsx` (3D section)
- Modify: `src/pages/DrugsPage.tsx` (3D section)

**Step 1: Update Three.js materials for bioluminescent glow**

In ProteinsPage.tsx, find the `<meshStandardMaterial>` or `<meshPhongMaterial>` elements and update:

```tsx
<meshStandardMaterial
  color="#00D4FF"
  transparent
  opacity={0.85}
  emissive="#004455"
  emissiveIntensity={0.3}
  roughness={0.3}
  metalness={0.7}
/>
```

In DrugsPage.tsx, update molecular atom colors to use bioluminescent palette:
- Carbon atoms: `#a1a1aa` (zinc-400)
- Oxygen atoms: `#ef4444` (red, keep for scientific accuracy)
- Nitrogen atoms: `#00D4FF` (accent blue)
- Default: `#4ECDC4` (teal)

Update the scene background/environment:
```tsx
<Canvas style={{ background: '#0a0f14' }}>
  <ambientLight intensity={0.4} />
  <pointLight position={[10, 10, 10]} color="#00D4FF" intensity={0.6} />
  <pointLight position={[-10, -10, -5]} color="#4ECDC4" intensity={0.3} />
  {/* existing geometry */}
</Canvas>
```

**Step 2: Commit**

```bash
git add src/pages/ProteinsPage.tsx src/pages/DrugsPage.tsx
git commit -m "feat: enhance 3D molecular visualizations with bioluminescent materials and lighting"
```

---

## Task 16: Add Framer Motion Page Transitions

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add page transition animations**

Update `src/App.tsx` to wrap page rendering with Framer Motion:

```tsx
import { AnimatePresence, motion } from 'framer-motion';

// Inside the renderPage function, wrap the return:
const route = getRouteFromPage(currentPage);
const PageComponent = {
  home: HomePage,
  proteins: ProteinsPage,
  drugs: DrugsPage,
  simulation: SimulationPage,
  results: ResultsPage,
  export: ExportPage,
}[route] || HomePage;

// In the JSX, replace {renderPage()} with:
<AnimatePresence mode="wait">
  <motion.div
    key={route}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
  >
    <PageComponent />
  </motion.div>
</AnimatePresence>
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add smooth page transitions with Framer Motion"
```

---

## Task 17: Update ErrorBoundary for Dark Theme

**Files:**
- Modify: `src/components/ErrorBoundary/ErrorBoundary.tsx`

**Step 1: Update error boundary styling**

Update the error boundary's fallback UI class names:
- Background: `bg-bio-800`
- Text: `text-zinc-100` for headers, `text-zinc-400` for descriptions
- Error details: `bg-bio-900 text-zinc-300 font-mono`
- Retry button: `bio-button-primary`
- DatabaseErrorBoundary warning: update colors to match theme

**Step 2: Commit**

```bash
git add src/components/ErrorBoundary/ErrorBoundary.tsx
git commit -m "feat: update ErrorBoundary styling for bioluminescent dark theme"
```

---

## Task 18: Verify Build and Fix TypeScript Errors

**Files:**
- Any files with TypeScript errors

**Step 1: Run TypeScript check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors (or fix any that appear)

**Step 2: Run production build**

Run:
```bash
npm run build
```

Expected: Build completes without errors

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors from bioluminescent theme integration"
```

---

## Task 19: Visual Smoke Test

**Step 1: Start dev server and verify each page**

Run:
```bash
npm run dev
```

**Step 2: Manually verify each page renders correctly**

Open `http://localhost:5173` and check:
1. Dark navy background visible across all pages
2. Sidebar has glassmorphism effect with emoji navigation
3. Navigation highlights active page with blue glow
4. HomePage cards have glass effect and hover animations
5. ProteinsPage tables have dark theme styling
6. DrugsPage molecular viewer has holographic overlay
7. SimulationPage controls are visible against dark background
8. ResultsPage charts use bioluminescent color palette
9. ExportPage export buttons have glow hover effect
10. Page transitions animate smoothly between views

**Step 3: Fix any visual issues found**

Address any contrast, readability, or styling issues discovered during verification.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: visual polish and contrast adjustments from smoke testing"
```

---

## Task 20: Run Existing Tests

**Step 1: Run unit tests**

Run:
```bash
npm run test:run
```

Expected: All existing tests pass (styling changes should not break functionality tests)

**Step 2: Run E2E tests**

Run:
```bash
npm run test:e2e
```

Expected: All E2E tests pass (functionality is preserved, only visual changes)

**Step 3: Fix any failing tests**

If tests fail due to CSS class name changes in selectors, update test selectors to match new class names while preserving test logic.

**Step 4: Commit test fixes**

```bash
git add -A
git commit -m "fix: update test selectors for bioluminescent theme class names"
```

---

## Summary

**Total Tasks:** 20
**New Files Created:** 3 (`src/theme/bioluminescent.ts`, `src/theme/index.ts`, `src/hooks/useDeviceCapability.ts`, `src/hooks/index.ts`)
**Files Modified:** ~15 (App.tsx, index.css, tailwind.config.js, all pages, layout components, error boundary)
**Dependencies Added:** 1 (framer-motion)
**Scientific Logic Touched:** None (all changes are visual/styling only)
**Data Flow Changes:** None (Zustand stores, services, types all unchanged)
