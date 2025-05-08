/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#1A1A1A',
          800: '#2D2D2D',
          700: '#4A4A4A',
          600: '#6B7280',
          500: '#A0A0A0',
          400: '#B0B0B0',
        },
        yellow: {
          400: '#FFC107',
          500: '#FFCA28',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        },
        green: {
          500: '#10B981',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};