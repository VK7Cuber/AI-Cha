import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../store/navigationStore';
import { useCartStore } from '../../store/cartStore';

export function useNavigationTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigate: navStoreNavigate } = useNavigationStore((s) => ({
    navigate: s.navigate
  }));
  const clearCart = useCartStore((s) => s.clearCart);
  const timeoutRef = useRef<number | null>(null);
  const inactivityMs = 120000;

  const scheduleTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      clearCart();
      navigate('/');
    }, inactivityMs);
  }, [clearCart, navigate, inactivityMs]);

  useEffect(() => {
    navStoreNavigate(location.pathname as any);
    scheduleTimeout();
  }, [location.pathname, navStoreNavigate, scheduleTimeout]);

  useEffect(() => {
    const handler = () => scheduleTimeout();
    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'touchstart',
      'scroll',
      'wheel',
      'keydown'
    ];
    events.forEach((event) => window.addEventListener(event, handler));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleTimeout]);
}
