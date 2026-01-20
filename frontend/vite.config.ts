import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // IMPORTANT:
  // On many macOS setups `localhost` resolves to IPv6 `::1` first.
  // If backend is not reachable on IPv6 loopback, Vite proxy can fail with ECONNRESET.
  // Default to IPv4 loopback explicitly for stable dev.
  const rawBase = (env.VITE_API_URL || 'http://127.0.0.1:8080').replace(/\/api\/?$/, '');
  const targetBase = rawBase.replace('http://localhost', 'http://127.0.0.1').replace('https://localhost', 'https://127.0.0.1');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: targetBase,
          changeOrigin: true
        }
      }
    },
    build: {
      sourcemap: mode === 'development'
    }
  };
});

