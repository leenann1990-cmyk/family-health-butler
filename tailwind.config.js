/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warm: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontSize: {
        'elder-sm': ['1.15rem', { lineHeight: '1.75rem' }],
        'elder-base': ['1.35rem', { lineHeight: '2rem' }],
        'elder-lg': ['1.65rem', { lineHeight: '2.25rem' }],
        'elder-xl': ['2rem', { lineHeight: '2.5rem' }],
        'elder-2xl': ['2.5rem', { lineHeight: '3rem' }],
        'elder-3xl': ['3rem', { lineHeight: '3.5rem' }],
      }
    },
  },
  plugins: [],
};
