/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#F4FAF6',
          100: '#E8F6EE',
          150: '#DCF2E4',
          200: '#C8ECCF',
        },
        peach: {
          300: '#A0E8BC',
          400: '#84DC9F',
          500: '#6FCF97',
          600: '#56B97E',
        },
        ink: '#1C1917',
        inkMuted: '#78716C',
      },
      boxShadow: {
        clay: '0 22px 44px rgba(111, 207, 151, 0.2), 0 10px 24px rgba(28, 25, 23, 0.06)',
        'clay-sm': '0 12px 28px rgba(111, 207, 151, 0.16), 0 4px 14px rgba(28, 25, 23, 0.05)',
      },
    },
  },
  plugins: [],
};
