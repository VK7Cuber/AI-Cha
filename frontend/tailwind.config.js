/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        primaryActive: 'var(--color-primary-active)',
        gold: 'var(--color-gold)',
        goldHover: 'var(--color-gold-hover)',
        goldActive: 'var(--color-gold-active)',
        green: 'var(--color-green)',
        greenHover: 'var(--color-green-hover)',
        greenActive: 'var(--color-green-active)',
        gray: 'var(--color-gray)',
        grayLight: 'var(--color-gray-light)',
        grayLighter: 'var(--color-gray-lighter)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceElevated: 'var(--color-surface-elevated)',
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        base: '1.125rem',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        button: '1.25rem',
        small: '0.875rem'
      },
      lineHeight: {
        snug: '1.2',
        normal: '1.4',
        relaxed: '1.6'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        pulseSoft: { '0%, 100%': { opacity: 0.85 }, '50%': { opacity: 1 } }
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

