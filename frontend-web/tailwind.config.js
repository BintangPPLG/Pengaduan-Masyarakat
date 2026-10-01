/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        primaryDark: '#059669',
        primaryDeep: '#047857',
        primaryLight: '#34D399',
        accent: '#A7F3D0',
        secondary: '#ECFDF5',
        surfaceWarm: '#F8FAFC',
        softWhite: '#FFFFFFE6',
        ink: '#0F172A',
        inkMuted: '#475569',
        inkFaint: '#94A3B8',
        cream: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
        peach: {
          300: '#A7F3D0',
          400: '#6EE7B7',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 20px 50px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
        'glass-hover': '0 25px 60px -12px rgba(16, 185, 129, 0.16), 0 1px 3px rgba(15, 23, 42, 0.04)',
        glow: '0 12px 36px -4px rgba(16, 185, 129, 0.22)',
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'card-elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '20px',
        '3xl2': '26px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
