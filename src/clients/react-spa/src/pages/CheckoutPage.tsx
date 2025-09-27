import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { FaShoppingCart, FaCreditCard, FaPaypal, FaLock, FaTruck } from 'react-icons/fa';
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
  const { items: cartItems, status } = useSelector((state: RootState) => state.cart);

  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    try {
      const createdOrder = await dispatch(placeOrder()).unwrap();
      const orderId = createdOrder?.id || createdOrder?.Id;
      if (orderId) {
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderId}`);
      } else {
        toast.error('Failed to create order: ID was not found in the server response.');
        console.error("CRITICAL ERROR: The server's response object did not contain an 'id' or 'Id' property.", createdOrder);
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-8  font-medium">
          <span className="border-b-2 border-blue-600 pb-1">Information</span>
          <span className="text-gray-400 pb-1">Shipping</span>
          <span className="text-gray-400 pb-1">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Checkout Forms */}
        <div className="space-y-8">
          {/* Express Checkout */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Express checkout</h3>
            <div className="space-y-3">
              <button className="w-full bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                <span>Maya</span>
              </button>
              <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                <FaPaypal className="" />
                <span>PayPal</span>
              </button>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                GCash
              </button>
            </div>
            
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contact information</h3>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="newsletter" className="rounded" />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Email me about new collections, special events, promotions and what's going on at Our Place.
                  </label>
                </div>
                
                <p className="text-xs text-gray-500">
                  By providing your email address, you agree to our Terms of Service and Privacy Policy. 
                  You may unsubscribe at any time.
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold  mb-4">Shipping address</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium  mb-1">Country/region</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Philippines</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="Enter street or postcode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-8">
          <h2 className="text-xl font-semibold  mb-6 border-b border-gray-200 pb-4 flex items-center">
            <FaShoppingCart className="mr-3" /> Order Summary
          </h2>
          
          {/* Product List */}
          <div className="space-y-4 mb-6">
            {enrichedItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-md" 
                  />
                  <div>
                    <p className="font-semibold ">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold ">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          {/* Order Total */}
          <div className="space-y-3 py-4 border-t border-gray-200">
            <div className="flex justify-between ">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between ">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg  border-t border-gray-200 pt-3">
              <span>Total</span>
              <span  className="text-blue-600">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-green-600 mt-4 py-3 border-t border-gray-200">
            <FaLock />
            <span className="text-sm font-medium">Secure checkout</span>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={status === 'loading' || enrichedItems.length === 0}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FaCreditCard />
            <span>{status === 'loading' ? 'Processing...' : `Place Order (${formatCurrency(cartTotal)})`}</span>
          </button>

          {/* Shipping Info */}
          <div className="flex items-center justify-center space-x-2 text-gray-600 mt-4 text-sm">
            <FaTruck />
            <span>Free shipping on all orders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;