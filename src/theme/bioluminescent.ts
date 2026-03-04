/**
 * Premium White Theme - Box Jellyfish Toxin Analyzer
 *
 * Clean, polished scientific interface with soft whites,
 * refined blues, and subtle shadows. No neon, no glow.
 *
 * Color philosophy: Lab-grade clarity meets editorial elegance.
 */

export const themeColors = {
  // Backgrounds
  bg: {
    page: '#F8F9FB',
    surface: '#FFFFFF',
    surfaceHover: '#F3F5F7',
    sidebar: '#FFFFFF',
    elevated: '#FFFFFF',
    muted: '#F1F3F5',
    input: '#FFFFFF',
  },
  // Borders
  border: {
    default: '#E2E5EA',
    subtle: '#EEF0F3',
    strong: '#D0D4DA',
    focus: '#2563EB',
  },
  // Text
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    muted: '#9CA3AF',
    accent: '#2563EB',
    inverse: '#FFFFFF',
  },
  // Accent - refined blue
  accent: {
    600: '#2563EB',
    500: '#3B82F6',
    400: '#60A5FA',
    100: '#DBEAFE',
    50: '#EFF6FF',
    bg: 'rgba(37, 99, 235, 0.06)',
    border: 'rgba(37, 99, 235, 0.15)',
  },
  // Teal/Success
  teal: {
    600: '#059669',
    500: '#10B981',
    100: '#D1FAE5',
    50: '#ECFDF5',
  },
  // Semantic
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  // Rating colors
  rating: {
    excellent: '#059669',
    good: '#2563EB',
    moderate: '#D97706',
    weak: '#EA580C',
    veryWeak: '#DC2626',
  },
  // Shadow values
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.1)',
    sidebar: '1px 0 4px rgba(0, 0, 0, 0.04)',
  },
} as const;

/** Ant Design v5 theme override - clean white */
export const antdBioTheme = {
  token: {
    colorPrimary: themeColors.accent[600],
    colorBgContainer: themeColors.bg.surface,
    colorBgElevated: themeColors.bg.elevated,
    colorBgLayout: themeColors.bg.page,
    colorText: themeColors.text.primary,
    colorTextSecondary: themeColors.text.secondary,
    colorBorder: themeColors.border.default,
    colorBorderSecondary: themeColors.border.subtle,
    borderRadius: 10,
    fontFamily: "'Geist', 'Noto Sans Thai', system-ui, -apple-system, sans-serif",
    colorLink: themeColors.accent[600],
    colorSuccess: themeColors.success,
    colorWarning: themeColors.warning,
    colorError: themeColors.error,
    colorBgBase: themeColors.bg.page,
    colorTextBase: themeColors.text.primary,
  },
  components: {
    Table: {
      colorBgContainer: themeColors.bg.surface,
      headerBg: themeColors.bg.muted,
      headerColor: themeColors.text.primary,
      rowHoverBg: themeColors.bg.surfaceHover,
      borderColor: themeColors.border.subtle,
      colorText: themeColors.text.primary,
    },
    Card: {
      colorBgContainer: themeColors.bg.surface,
      colorBorderSecondary: themeColors.border.subtle,
    },
    Select: {
      colorBgContainer: themeColors.bg.input,
      colorBgElevated: themeColors.bg.surface,
      optionSelectedBg: themeColors.accent[50],
    },
    Button: {
      borderRadius: 10,
    },
    Alert: {
      colorInfoBg: themeColors.accent[50],
      colorInfoBorder: themeColors.accent.border,
    },
    Tabs: {
      colorBgContainer: 'transparent',
      itemSelectedColor: themeColors.accent[600],
      inkBarColor: themeColors.accent[600],
    },
    Statistic: {
      colorTextDescription: themeColors.text.secondary,
    },
    Divider: {
      colorSplit: themeColors.border.subtle,
    },
    Input: {
      colorBgContainer: themeColors.bg.input,
      activeBorderColor: themeColors.accent[600],
    },
    Slider: {
      trackBg: themeColors.accent[600],
      trackHoverBg: themeColors.accent[500],
      handleColor: themeColors.accent[600],
      railBg: themeColors.border.default,
    },
    Progress: {
      defaultColor: themeColors.accent[600],
    },
    Checkbox: {
      colorPrimary: themeColors.accent[600],
    },
  },
} as const;
