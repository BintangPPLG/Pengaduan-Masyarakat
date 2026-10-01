/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        primaryDark: '#059669',
        primaryLight: '#34D399',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        ink: '#0F172A',
        inkMuted: '#64748B',
        inkFaint: '#94A3B8',
        cream: {
          50: '#F8FAFC',
          100: '#F8FAFC',
          150: '#F1F5F9',
          200: '#E2E8F0',
        },
        peach: {
          300: '#A7F3D0',
          400: '#6EE7B7',
          500: '#10B981',
          600: '#059669',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        card: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 20px 40px -10px rgba(16, 185, 129, 0.12)',
        clay: '0 10px 30px -5px rgba(15, 23, 42, 0.06)',
        'clay-sm': '0 4px 14px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
