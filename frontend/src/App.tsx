import { useEffect } from 'react';
import { AppRouter } from './Router';
import { useThemeStore } from './store/themeStore';
import { useNavigationTracking } from './components/hooks/useNavigationTracking';

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useNavigationTracking();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <AppRouter />;
}

export default App;

