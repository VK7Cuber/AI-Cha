import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeScreen from './components/screens/WelcomeScreen/WelcomeScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen/ModeSelectionScreen';
import CatalogScreen from './components/screens/CatalogScreen/CatalogScreen';
import CartScreen from './components/screens/CartScreen/CartScreen';
import PaymentScreen from './components/screens/PaymentScreen/PaymentScreen';
import RatingScreen from './components/screens/RatingScreen/RatingScreen';
import RecommendationsScreen from './components/screens/RecommendationsScreen/RecommendationsScreen';
import { PageTransition } from './components/animations/PageTransition/PageTransition';
import { useNavigationTracking } from './components/hooks/useNavigationTracking';
import { PropsWithChildren } from 'react';

function WithNavigationTracking({ children }: PropsWithChildren) {
  useNavigationTracking();
  return children as JSX.Element;
}

const router = createBrowserRouter([
  { path: '/', element: <PageTransition><WithNavigationTracking><WelcomeScreen /></WithNavigationTracking></PageTransition> },
  { path: '/mode', element: <PageTransition><WithNavigationTracking><ModeSelectionScreen /></WithNavigationTracking></PageTransition> },
  { path: '/catalog', element: <PageTransition><WithNavigationTracking><CatalogScreen /></WithNavigationTracking></PageTransition> },
  { path: '/cart', element: <PageTransition><WithNavigationTracking><CartScreen /></WithNavigationTracking></PageTransition> },
  { path: '/payment', element: <PageTransition><WithNavigationTracking><PaymentScreen /></WithNavigationTracking></PageTransition> },
  { path: '/rating', element: <PageTransition><WithNavigationTracking><RatingScreen /></WithNavigationTracking></PageTransition> },
  { path: '/recommendations', element: <PageTransition><WithNavigationTracking><RecommendationsScreen /></WithNavigationTracking></PageTransition> }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

