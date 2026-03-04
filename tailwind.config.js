/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#059669',
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F8F9FB',
          muted: '#F1F3F5',
          hover: '#F3F5F7',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
        teal: {
          DEFAULT: '#059669',
          light: '#10B981',
          50: '#ECFDF5',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'panel': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'sidebar': '1px 0 4px rgba(0, 0, 0, 0.04)',
        'input-focus': '0 0 0 3px rgba(37, 99, 235, 0.12)',
      },
    },
  },
  plugins: [],
}
