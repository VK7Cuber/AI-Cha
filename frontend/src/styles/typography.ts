export const typography = {
  fontFamily: ['"Inter"', '"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'].join(', '),
  sizes: {
    base: '1.125rem', // ~18px
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    button: '1.25rem',
    small: '0.875rem'
  },
  weights: {
    regular: 400,
    medium: 600,
    bold: 700
  },
  lineHeights: {
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6
  }
};

export type Typography = typeof typography;

