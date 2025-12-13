import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isTransitioning: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const THEME_KEY = 'ai-cha-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isTransitioning: false,
  setTheme: (theme: Theme) => {
    const html = document.documentElement;
    const isDark = theme === 'dark';
    html.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, theme);
    set({ theme, isTransitioning: true });
    setTimeout(() => set({ isTransitioning: false }), 300);
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
  initTheme: () => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme | null) || 'light';
    get().setTheme(saved);
  }
}));

