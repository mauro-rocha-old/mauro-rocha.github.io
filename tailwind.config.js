/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        primary: '#ffffff',
        accent: '#3b82f6',
      },
      cursor: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
