/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        table: {
          dark: '#071611',
          felt: '#0d281e',
          border: '#1b4d3e',
          accent: '#10b981',
        },
        card: {
          bg: '#ffffff',
          spade: '#06b6d4',
          heart: '#ef4444',
          club: '#10b981',
          diamond: '#f59e0b',
        },
        neon: {
          gold: '#fbbf24',
          cyan: '#22d3ee',
          emerald: '#34d399',
          rose: '#fb7185',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(16, 185, 129, 0.35)',
        'glow-gold': '0 0 30px rgba(251, 191, 36, 0.4)',
        'glow-cyan': '0 0 25px rgba(34, 211, 238, 0.35)',
        felt: 'inset 0 0 100px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
