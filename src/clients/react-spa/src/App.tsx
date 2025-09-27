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

// Lazy load all page components
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Lazy load Admin pages
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'));

// Lazy load Vendor pages
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));

interface JwtPayload { role: string; }

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  let userRole = '';
  if (token) {
    try {
      userRole = jwtDecode<JwtPayload>(token).role;
    } catch {
      // Invalid token, will be handled by ProtectedRoute
    }
  }

  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="bottom-center" />
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">Drobble Store</Link>
          <div className="flex-grow mx-8 hidden md:block"><SearchBar /></div>
          <div className="flex items-center space-x-6">
            <CartIcon />
            {token ? (
              <>
                {userRole === 'Admin' && <Link to="/admin" title="Admin Panel"><FaCog size="1.2em" /></Link>}
                {userRole === 'Vendor' && <Link to="/vendor/products" title="Vendor Panel"><FaCog size="1.2em" /></Link>}
                <Link to="/profile" title="My Account"><FaUser size="1.2em" /></Link>
                <button onClick={handleLogout} title="Logout"><FaSignOutAlt size="1.2em" /></button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center p-8 text-xl">Loading...</div>}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* --- Authenticated User Routes (All roles can access these) --- */}
            <Route element={<ProtectedRoute allowedRoles={['User', 'Vendor', 'Admin']} />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            </Route>
            
            {/* --- Admin Only Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                {/* THIS IS THE CHANGE: Redirect /admin to /admin/users */}
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductEdit />} />
                <Route path="products/edit/:productId" element={<AdminProductEdit />} />
              </Route>
            </Route>

            {/* --- Vendor Routes (Admins can also access) --- */}
            <Route element={<ProtectedRoute allowedRoles={['Vendor', 'Admin']} />}>
                <Route path="/vendor/products" element={<VendorProducts />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;