// ---- File: App.tsx ----
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import type { AppDispatch, RootState } from './store/store';
import { fetchCart } from './store/cartSlice';
import { logout } from './store/authSlice';
import CartIcon from './components/CartIcon';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import SearchBar from './components/SearchBar';
import AdminLayout from './layouts/AdminLayout';
import AdminReviews from './pages/admin/AdminReviews';
import VendorLayout from './layouts/VendorLayout';
import VendorReviews from './pages/vendor/VendorReviews';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import toast from 'react-hot-toast/headless';

// Lazy load all page components for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSucceesPage'));

// Lazy load Admin pages
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

// Lazy load Vendor pages
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));

interface JwtPayload { role: string; }

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { mode: themeMode } = useSelector((state: RootState) => state.theme);

  // Apply the dark/light class to the root HTML element when the theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);
  }, [themeMode]);

  let userRole = '';
  if (token) {
    try {
      userRole = jwtDecode<JwtPayload>(token).role;
    } catch {
      // Invalid token, will be handled by ProtectedRoute or logout
      console.error("Invalid token found.");
    }
  }

  // Fetch the user's cart from the backend if they are logged in
  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('You have been logged out.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="bottom-center" />
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-y-4">
          <Link to="/" className="text-2xl font-bold text-slate-800 dark:text-white hover:text-green-600 transition-colors">
            {/* Using an SVG or image for the logo is more flexible */}
            <img src="/appicontext.svg" alt="drobble logo" className="h-8 w-auto" />
          </Link>

          {/* Search bar: full-width on mobile, auto-width on desktop */}
          <div className="w-full order-last md:w-auto md:flex-grow md:order-none md:mx-8">
            <SearchBar />
          </div>
          
          <div className="flex items-center space-x-5">
            <ThemeToggle />
            <CartIcon />
            {token ? (
              <>
                {userRole === 'Admin' && <Link to="/admin" title="Admin Panel" className="text-slate-600 dark:text-slate-300 hover:text-green-600 transition-colors"><FaCog size="1.2em" /></Link>}
                {userRole === 'Vendor' && <Link to="/vendor" title="Vendor Panel" className="text-slate-600 dark:text-slate-300 hover:text-green-600 transition-colors"><FaCog size="1.2em" /></Link>}
                <Link to="/profile" title="My Account" className="text-slate-600 dark:text-slate-300 hover:text-green-600 transition-colors"><FaUser size="1.2em" /></Link>
                <button onClick={handleLogout} title="Logout" className="text-slate-600 dark:text-slate-300 hover:text-green-600 transition-colors"><FaSignOutAlt size="1.2em" /></button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-green-600 transition-colors">Login</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-center p-8 text-xl text-gray-600 dark:text-slate-400">Loading Page...</div>}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* --- Authenticated User Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['User', 'Vendor', 'Admin']} />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
            </Route>
            
            {/* --- Admin Only Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="products/new" element={<AdminProductEdit />} />
                <Route path="products/edit/:productId" element={<AdminProductEdit />} />
              </Route>
            </Route>

            {/* --- Vendor Routes (also accessible by Admin) --- */}
            <Route element={<ProtectedRoute allowedRoles={['Vendor', 'Admin']} />}>
              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="reviews" element={<VendorReviews />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
