import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../store/navigationStore';

export function useNavigationTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigate: navStoreNavigate, resetInactivityTimeout } = useNavigationStore((s) => ({
    navigate: s.navigate,
    resetInactivityTimeout: s.resetInactivityTimeout
  }));

  useEffect(() => {
    navStoreNavigate(location.pathname as any);
    resetInactivityTimeout();
  }, [location.pathname, navStoreNavigate, resetInactivityTimeout]);

  useEffect(() => {
    const handler = () => navigate('/');
    const timeout = setTimeout(handler, useNavigationStore.getState().inactivityTimeout);
    return () => clearTimeout(timeout);
  }, [navigate]);
}
