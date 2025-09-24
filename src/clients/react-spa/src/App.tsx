// ---- File: src/App.tsx ----
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import type { AppDispatch, RootState } from './store/store';
import { fetchCart } from './store/cartSlice';
import { logout } from './store/authSlice';
import CartIcon from './components/CartIcon';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import SearchBar from './components/SearchBar'; // Import the new SearchBar

// Lazy load page components for code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage')); // Import the new SearchPage

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="bottom-center" />
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">Drobble Store</Link>
          <div className="flex-grow flex justify-center">
            <SearchBar />
          </div>
          <div className="flex items-center space-x-6">
            <CartIcon />
            {token ? (
              <>
                <Link to="/profile" className="text-gray-600 hover:text-blue-500" title="My Account">
                  <FaUser size="1.2em" />
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-blue-500" title="Logout">
                  <FaSignOutAlt size="1.2em" />
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:underline">Login</Link>
            )}              
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center p-8 text-xl font-semibold">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} /> {/* Add new search route */}

            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;