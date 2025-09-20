import { Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store/store'; 
import { fetchCart } from './store/cartSlice'; 
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CartIcon from './components/CartIcon';
import LoginPage from './pages/LoginPage';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // This effect runs once when the app component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);


  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">Drobble Store</Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:underline">Login</Link>
            <CartIcon />
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;