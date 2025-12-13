import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeScreen from './components/screens/WelcomeScreen/WelcomeScreen';
import ModeSelectionScreen from './components/screens/ModeSelectionScreen/ModeSelectionScreen';
import CatalogScreen from './components/screens/CatalogScreen/CatalogScreen';
import CartScreen from './components/screens/CartScreen/CartScreen';
import PaymentScreen from './components/screens/PaymentScreen/PaymentScreen';
import RatingScreen from './components/screens/RatingScreen/RatingScreen';
import RecommendationsScreen from './components/screens/RecommendationsScreen/RecommendationsScreen';

const router = createBrowserRouter([
  { path: '/', element: <WelcomeScreen /> },
  { path: '/mode', element: <ModeSelectionScreen /> },
  { path: '/catalog', element: <CatalogScreen /> },
  { path: '/cart', element: <CartScreen /> },
  { path: '/payment', element: <PaymentScreen /> },
  { path: '/rating', element: <RatingScreen /> },
  { path: '/recommendations', element: <RecommendationsScreen /> }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

