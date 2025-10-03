// ---- Modify file: src/clients/react-spa/src/pages/CheckoutPage.tsx ----
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { 
  FaShoppingCart, 
  FaPaypal, 
  FaUser, 
  FaLock,
  FaShippingFast
} from 'react-icons/fa';
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

interface ShippingInfo {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// ** THE FIX IS HERE **: Construct the full payload with shipping address
interface PlaceOrderPayload {
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    shippingAddress: {
        fullName: string;
        addressLine: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}


const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  // ** REFINEMENT **: State to manage the current checkout step
  const [step, setStep] = useState(1); 
  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });

  // Load saved shipping info from localStorage
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem('drobbleShippingInfo');
    if (savedShippingInfo) {
      try {
        setShippingInfo(JSON.parse(savedShippingInfo));
      } catch (error) {
        console.error('Failed to load saved shipping info', error);
      }
    }
  }, []);

  // Save shipping info to localStorage whenever it changes
  useEffect(() => {
    if (shippingInfo.email || shippingInfo.firstName || shippingInfo.lastName) {
      localStorage.setItem('drobbleShippingInfo', JSON.stringify(shippingInfo));
    }
  }, [shippingInfo]);

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
  const shippingCost = 0; // Free shipping
  const tax = cartTotal * 0.08; // 8% tax
  const finalTotal = cartTotal + shippingCost + tax;

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ShippingInfo)[] = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field].trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  // ** REFINEMENT **: New handler to validate and move to the next step
  const handleContinueToPayment = () => {
    if (validateForm()) {
        setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const orderItems = enrichedItems.map(item => ({ 
      productId: item.productId, 
      quantity: item.quantity, 
      price: item.price 
    }));

    const orderPayload: PlaceOrderPayload = {
        items: orderItems,
        shippingAddress: {
            fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            addressLine: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zipCode: shippingInfo.zipCode,
            country: shippingInfo.country,
        }
    };

    try {
        const createdOrder = await dispatch(placeOrder(orderPayload)).unwrap();
        const orderId = createdOrder?.id || createdOrder?.Id;

        if (!orderId) {
            throw new Error("Failed to get Order ID after creation.");
        }
      
      localStorage.setItem('drobbleOrderId', orderId);

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
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="animate-pulse">
            <FaShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 dark:text-slate-400">Loading your checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ** REFINEMENT **: Make the stepper dynamic based on the current step */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-8 font-medium text-gray-700 dark:text-slate-300">
          <span className={`pb-1 flex items-center ${step === 1 ? 'border-b-2 border-green-600 text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            <FaUser className="mr-2" />
            Information
          </span>
          <span className={`pb-1 flex items-center ${step === 2 ? 'border-b-2 border-green-600 text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            <FaLock className="mr-2" />
            Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Checkout Content */}
        <div className="lg:col-span-2">
          {/* ** REFINEMENT **: Conditionally render the content for each step */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-slate-100">
                Contact & Shipping Information
              </h3>
              {/* Shipping Form JSX (same as before) */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-slate-200">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email and Phone inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email Address *</label>
                        <input type="email" value={shippingInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="email" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Phone Number *</label>
                        <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="tel" required />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-slate-200">Shipping Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     {/* First and Last Name inputs */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First Name *</label>
                        <input type="text" value={shippingInfo.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="given-name" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last Name *</label>
                        <input type="text" value={shippingInfo.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="family-name" required />
                    </div>
                  </div>
                  <div className="mb-4">
                    {/* Street Address input */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Street Address *</label>
                    <input type="text" value={shippingInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="street-address" required />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* City, State, ZIP inputs */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">City *</label>
                        <input type="text" value={shippingInfo.city} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="address-level2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">State *</label>
                        <input type="text" value={shippingInfo.state} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="address-level1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">ZIP Code *</label>
                        <input type="text" value={shippingInfo.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="postal-code" required />
                    </div>
                  </div>
                  <div>
                    {/* Country select */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Country *</label>
                    <select value={shippingInfo.country} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoComplete="country" required >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Philippines">Philippines</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button for Step 1 */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                <button
                    onClick={handleContinueToPayment}
                    className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <span>Continue to Payment</span>
                    <FaShippingFast />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-slate-100">Review & Pay</h3>
                
                {/* Review Information */}
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700 dark:text-slate-200">Shipping Information</h4>
                        <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    <div className="text-gray-600 dark:text-slate-400 text-sm space-y-1">
                        <p>{`${shippingInfo.firstName} ${shippingInfo.lastName}`}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`}</p>
                        <p>{shippingInfo.country}</p>
                        <p>Email: {shippingInfo.email}</p>
                        <p>Phone: {shippingInfo.phone}</p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <FaLock className="text-green-500 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-green-800 dark:text-green-300">Secure Payment</h4>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                You will be redirected to PayPal's secure site to complete your payment. Your information is encrypted and safe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          {/* ... Order Summary JSX (same as before) ... */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 sticky top-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <FaShoppingCart className="mr-3" /> 
                    Order Summary
                </h2>
                <p className="text-green-100 text-sm mt-1">{enrichedItems.length} item{enrichedItems.length !== 1 ? 's' : ''} in cart</p>
            </div>
            
            <div className={`p-4 ${enrichedItems.length > 4 ? 'max-h-80 overflow-y-auto' : 'overflow-visible'} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800/50 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-slate-500`}>
                <div className="space-y-3">
                    {enrichedItems.map(item => (
                        <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg cursor-pointer" onClick={() => handleProductClick(item.productId)} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-800 dark:text-slate-200 truncate">{item.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-slate-400">Qty: {item.quantity}</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400">• {formatCurrency(item.price)} each</span>
                                    </div>
                                    <span className="font-semibold text-green-600 dark:text-green-400 text-sm">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">Subtotal</span><span className="text-gray-800 dark:text-slate-200">{formatCurrency(cartTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">Shipping</span><span className="text-green-600 dark:text-green-400">Free</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-slate-400">Tax</span><span className="text-gray-800 dark:text-slate-200">{formatCurrency(tax)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-slate-600 pt-3"><span className="text-gray-800 dark:text-slate-100">Total</span><span className="text-green-600 dark:text-green-400">{formatCurrency(finalTotal)}</span></div>
                </div>
            </div>

            {/* ** REFINEMENT **: Only show the PayPal button on Step 2 */}
            {step === 2 && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing || enrichedItems.length === 0}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FaPaypal />
                        <span>{isProcessing ? 'Processing...' : 'Continue to PayPal'}</span>
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;