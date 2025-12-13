import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeScreen from './components/screens/WelcomeScreen/WelcomeScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen/ModeSelectionScreen';
import CatalogScreen from './components/screens/CatalogScreen/CatalogScreen';
import CartScreen from './components/screens/CartScreen/CartScreen';
import PaymentScreen from './components/screens/PaymentScreen/PaymentScreen';
import RatingScreen from './components/screens/RatingScreen/RatingScreen';
import RecommendationsScreen from './components/screens/RecommendationsScreen/RecommendationsScreen';
import { PageTransition } from './components/animations/PageTransition/PageTransition';

const router = createBrowserRouter([
  { path: '/', element: <PageTransition><WelcomeScreen /></PageTransition> },
  { path: '/mode', element: <PageTransition><ModeSelectionScreen /></PageTransition> },
  { path: '/catalog', element: <PageTransition><CatalogScreen /></PageTransition> },
  { path: '/cart', element: <PageTransition><CartScreen /></PageTransition> },
  { path: '/payment', element: <PageTransition><PaymentScreen /></PageTransition> },
  { path: '/rating', element: <PageTransition><RatingScreen /></PageTransition> },
  { path: '/recommendations', element: <PageTransition><RecommendationsScreen /></PageTransition> }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

