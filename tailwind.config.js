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
