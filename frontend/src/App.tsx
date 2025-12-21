import { useEffect } from 'react';
import { AppRouter } from './Router';
import { useThemeStore } from './store/themeStore';

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <AppRouter />;
}

export default App;

