import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { removeItemFromCart, updateItemQuantity } from '../store/cartSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaTrash, FaShoppingCart, FaPlus, FaMinus, FaArrowLeft, FaShieldAlt, FaCreditCard, FaTruck } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cartItems, status } = useSelector((state: RootState) => state.cart);
  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cartItems.length === 0) {
        setEnrichedItems([]);
        setIsInitialLoading(false);
        return;
      }

      try {
        const productIds = cartItems.map(item => item.productId);
        const response = await api.post<ProductDetail[]>('/products/batch', productIds);
        const productDetailsMap = new Map(response.data.map(p => [p.id, p]));

        const newEnrichedItems = cartItems.map(item => {
          const details = productDetailsMap.get(item.productId);
          return {
            ...item,
            name: details?.name || 'Product not found',
            price: details?.price || 0,
            imageUrl: details?.imageUrl || '',
            description: details?.description || '',
          };
        });

        setEnrichedItems(newEnrichedItems);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        // FIX: This now only affects the initial page load spinner.
        if (isInitialLoading) {
            setIsInitialLoading(false);
        }
      }
    };

    fetchProductDetails();
  }, [cartItems]); // This effect still correctly re-runs when the cart changes.

  const handleRemove = (productId: string) => {
    dispatch(removeItemFromCart(productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    dispatch(updateItemQuantity({ productId, quantity: newQuantity }));
  };

  const cartTotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

  // FIX: This check now only runs on the very first load.
  if (isInitialLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="animate-pulse">
          <FaShoppingCart className="mx-auto text-5xl text-green-400 mb-4" />
          <p className="text-lg text-gray-700 dark:text-slate-300">Loading your cart...</p>
        </div>
      </div>
    </div>
  );
  
  if (enrichedItems.length === 0) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <FaShoppingCart className="mx-auto text-6xl text-green-400 mb-6" />
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100">Your Cart is Empty</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Start exploring our collection!
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all shadow-md"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center border border-blue-600 dark:border-blue-400 text-gray-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Shopping Cart</h1>
        </div>
        <Link 
          to="/" 
          className="flex items-center text-gray-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="space-y-4">
            {enrichedItems.map((item) => (
              <div key={item.productId} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* FIX: Wrapped image in a fixed-size container to ensure consistent layout */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl || 'https://placehold.co/120x120/png?text=Product'} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-slate-100">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 dark:text-slate-400 text-sm mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-lg font-bold mb-3 text-gray-800 dark:text-slate-200">{formatCurrency(item.price)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Quantity:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                          disabled={status === 'loading'}
                        >
                          <FaMinus className="text-sm text-gray-600 dark:text-slate-300" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800 dark:text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                          disabled={status === 'loading'}
                        >
                          <FaPlus className="text-sm text-gray-600 dark:text-slate-300" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col items-end space-y-3 sm:ml-auto">
                    <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</p>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="flex items-center text-red-500 hover:text-red-700 transition-colors font-medium text-sm"
                      title="Remove item"
                    >
                      <FaTrash className="mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border dark:border-slate-700 border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2 text-gray-700 dark:text-slate-300">
                <FaTruck className="text-2xl" />
                <span className="text-sm font-medium">Free Shipping</span>
                <span className="text-xs text-gray-600 dark:text-slate-400">On all orders</span>
              </div>
              <div className="flex flex-col items-center space-y-2 text-gray-700 dark:text-slate-300">
                <FaShieldAlt className="text-2xl" />
                <span className="text-sm font-medium">Secure Checkout</span>
                <span className="text-xs text-gray-600 dark:text-slate-400">256-bit encryption</span>
              </div>
              <div className="flex flex-col items-center space-y-2 text-gray-700 dark:text-slate-300">
                <FaCreditCard className="text-2xl" />
                <span className="text-sm font-medium">Easy Returns</span>
                <span className="text-xs text-gray-600 dark:text-slate-400">30-day policy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 sticky top-8">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-200 dark:border-slate-700 pb-4 flex items-center text-gray-800 dark:text-slate-100">
              <FaShoppingCart className="mr-3" />
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-4 text-gray-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className="dark:text-slate-200">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-xl pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
              <span className="text-green-600 dark:text-green-400">Total</span>
              <span className="text-green-600 dark:text-green-400">{formatCurrency(cartTotal)}</span>
            </div>

            <Link
              to="/checkout"
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg shadow-md flex items-center justify-center space-x-2"
            >
              <FaCreditCard />
              <span>Proceed to Checkout</span>
            </Link>
            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <FaShieldAlt />
              <span className="text-sm font-medium">Secure checkout guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;