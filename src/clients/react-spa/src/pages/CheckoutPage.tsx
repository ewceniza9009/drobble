import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { FaShoppingCart, FaPaypal } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

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
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
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
            price: details?.price || 0,
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

  const handlePlaceOrder = async () => {
    if (!email || !firstName || !lastName || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    const orderItems = enrichedItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price }));

    try {
      // 1. Create the order in our system first to get an OrderId
      const createdOrder = await dispatch(placeOrder(orderItems)).unwrap();
      const orderId = createdOrder?.id || createdOrder?.Id;

      if (!orderId) {
        throw new Error("Failed to get Order ID after creation.");
      }
      
      // Store the new order ID in local storage before redirecting to PayPal
      localStorage.setItem('drobbleOrderId', orderId);

      // 2. Create the PayPal payment order using the new OrderId
      const paymentResponse = await api.post('/payments/create-order', {
        orderId: orderId,
        gateway: 'PayPal'
      });
      
      const { approvalUrl } = paymentResponse.data;

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        throw new Error("Could not get PayPal approval URL.");
      }

    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
      console.error(error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-gray-700 dark:text-slate-300">Loading Checkout...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-8 font-medium text-gray-700 dark:text-slate-300">
          <span className="border-b-2 border-blue-600 pb-1 text-gray-900 dark:text-white">Information</span>
          <span className="text-gray-400 pb-1">Shipping</span>
          <span className="text-gray-400 pb-1">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Checkout Forms */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Contact Information</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
              />
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Shipping Address</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 dark:border-slate-700 pb-4 flex items-center text-gray-800 dark:text-slate-100">
            <FaShoppingCart className="mr-3" /> Order Summary
          </h2>
          <div className="space-y-4 mb-6">
            {enrichedItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 py-4 border-t border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 dark:text-green-400">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-slate-700 pt-3 text-gray-800 dark:text-slate-100">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-400">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || enrichedItems.length === 0}
            className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-4 rounded-lg transition-all text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FaPaypal />
            <span>{isProcessing ? 'Processing...' : 'Continue to PayPal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

