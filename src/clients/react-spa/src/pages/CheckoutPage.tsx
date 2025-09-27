// ---- File: src/pages/CheckoutPage.tsx ----
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { FaShoppingCart } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

// Interfaces for the enriched data we will fetch
interface ProductDetail {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
}

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: cartItems, status } = useSelector((state: RootState) => state.cart);

  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if the cart is empty after initial load
    if (!isLoading && enrichedItems.length === 0) {
      navigate('/cart');
    }
  }, [isLoading, enrichedItems, navigate]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cartItems.length === 0) {
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
            name: details?.name || 'Product Not Found',
            price: details?.price || 0, // Use the current price from the backend
            imageUrl: details?.imageUrl || '',
          };
        });

        setEnrichedItems(newEnrichedItems);
      } catch (error) {
        console.error("Failed to fetch product details for checkout", error);
        toast.error("Could not load product details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartItems]);

  const cartTotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handlePlaceOrder = async () => {
    try {
      const createdOrder = await dispatch(placeOrder()).unwrap();
      
      // Log the actual response from the backend to help with debugging.
      // Check your browser's developer console to see this output.
      console.log('Backend response after creating order:', createdOrder);

      // Safely check for the order ID. Also checks for 'orderId' as a fallback.
      const orderId = createdOrder?.id;

      if (orderId) {
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderId}`);
      } else {
        // If no ID is found, the API response is not what we expect.
        toast.error('Failed to create order: Invalid response from server.');
        console.error('Error: The server response for the new order did not contain an "id".', createdOrder);
      }
    } catch (error) {
      toast.error('Failed to place order.');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading Checkout...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-4 flex items-center">
            <FaShoppingCart className="mr-3 text-gray-500" /> Order Summary
        </h2>

        <div className="space-y-4 mb-6">
          {enrichedItems.map(item => (
            <div key={item.productId} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center">
                <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 py-4 border-t">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={status === 'loading' || enrichedItems.length === 0}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Processing...' : `Place Order (${formatCurrency(cartTotal)})`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;