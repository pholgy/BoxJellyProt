/**
 * Bioluminescent Marine Research Station Theme
 *
 * Color philosophy: Deep-sea research facility aesthetic.
 * Dark navy backgrounds with electric blue/teal accents.
 * Glassmorphism panels simulate underwater observation windows.
 *
 * Designed for the Box Jellyfish Toxin Analysis application.
 * All colors are desaturated to ~70% to avoid AI-cliche neon aesthetics.
 */

export const bioColors = {
  // Base backgrounds - deep navy progression
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
  // Glassmorphism values
  glass: {
    bg: 'rgba(15, 20, 25, 0.8)',
    bgLight: 'rgba(26, 35, 50, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  // Rating colors for scientific results (binding affinity etc.)
  rating: {
    excellent: '#4ECDC4',
    good: '#00D4FF',
    moderate: '#f59e0b',
    weak: '#f97316',
    veryWeak: '#ef4444',
  },
} as const;

/** Ant Design v5 theme override configuration */
export const antdBioTheme = {
  token: {
    colorPrimary: bioColors.accent[500],
    colorBgContainer: bioColors.navy[700],
    colorBgElevated: bioColors.navy[600],
    colorBgLayout: bioColors.navy[800],
    colorText: bioColors.text.primary,
    colorTextSecondary: bioColors.text.secondary,
    colorBorder: bioColors.glass.border,
    colorBorderSecondary: 'rgba(255, 255, 255, 0.05)',
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
} as const;

/** CSS custom properties for injection into :root or scoped containers */
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
