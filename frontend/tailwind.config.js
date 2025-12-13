/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D32F2F',
        gold: '#FFD700',
        green: '#388E3C',
        gray: '#757575',
        black: '#212121',
        white: '#FFFFFF'
      }
    }
  },
  plugins: []
};

