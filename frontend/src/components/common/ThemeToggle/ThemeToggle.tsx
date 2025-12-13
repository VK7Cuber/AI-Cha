import clsx from 'clsx';
import useTheme from '../../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full bg-surfaceElevated text-primary shadow-md ring-1 ring-grayLight transition-all hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isTransitioning && 'animate-pulseSoft',
        className
      )}
      aria-label="Переключить тему"
    >
      <span className="text-h2">{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
}

export default ThemeToggle;

