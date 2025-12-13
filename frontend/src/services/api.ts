import axios from 'axios';

function resolveBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  if (raw && raw.startsWith('http')) {
    return raw.match(/\/api\/?$/) ? raw : `${raw.replace(/\/+$/, '')}/api`;
  }
  // Без VITE_API_URL — бьём прямо на backend 8080 на том же хосте, чтобы обойти блокировки прокси/расширений.
  // В режиме разработки используем прокси Vite (`/api` → 8080)
  if (import.meta.env.DEV) {
    return '/api';
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8080/api`;
}

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Простая обработка ошибок сети
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      return Promise.reject(new Error('Проблемы с подключением к серверу'));
    }
    return Promise.reject(error);
  }
);

export default api;

