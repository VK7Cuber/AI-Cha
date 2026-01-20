import { create } from 'zustand';

type Screen =
  | '/'
  | '/mode'
  | '/catalog'
  | '/cart'
  | '/payment'
  | '/rating'
  | '/recommendations';

interface NavigationState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  inactivityTimeout: number; // ms
  orderMode: 'ai' | 'manual';
  navigate: (screen: Screen) => void;
  goBack: () => Screen | null;
  resetInactivityTimeout: (ms?: number) => void;
  setOrderMode: (mode: 'ai' | 'manual') => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentScreen: '/',
  previousScreen: null,
  inactivityTimeout: 120000,
  orderMode: 'manual',

  navigate: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen
    })),

  goBack: () => {
    const { previousScreen, currentScreen } = get();
    if (!previousScreen) return null;
    set({ currentScreen: previousScreen, previousScreen: currentScreen });
    return previousScreen;
  },

  resetInactivityTimeout: (ms = 120000) => set({ inactivityTimeout: ms }),

  setOrderMode: (mode) => set({ orderMode: mode })
}));
