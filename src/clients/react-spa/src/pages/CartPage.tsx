import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { removeItemFromCart } from '../store/cartSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
}

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cartItems.length === 0) {
        setEnrichedItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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
          };
        });

        setEnrichedItems(newEnrichedItems);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartItems]);

  const handleRemove = (productId: string) => {
    dispatch(removeItemFromCart(productId));
  };

  const cartTotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isLoading) return <p className="py-10 text-center">Loading cart...</p>;
  
  if (enrichedItems.length === 0) return (
    <div className="text-center bg-white p-12 rounded-xl shadow-lg border border-slate-200">
        <FaShoppingCart className="mx-auto text-5xl text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Your Cart is Empty</h2>
        <p className="text-slate-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Start Shopping
        </Link>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {enrichedItems.map((item) => (
            <div key={item.productId} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
              <div className="flex-grow">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                <p className="text-sm font-semibold text-blue-600">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-semibold w-24 text-right text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-28">
            <h2 className="text-xl font-bold mb-4 border-b pb-3 text-slate-800">Order Summary</h2>
            <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 mt-4 border-t">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;