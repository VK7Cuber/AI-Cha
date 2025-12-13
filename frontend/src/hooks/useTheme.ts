import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const isTransitioning = useThemeStore((s) => s.isTransitioning);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { theme, isTransitioning, setTheme, toggleTheme };
}

export default useTheme;

