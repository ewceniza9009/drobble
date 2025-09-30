// ---- File: src/pages/OrderDetailPage.tsx ----
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../store/apiSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatting';
import { FaBox, FaCalendar, FaReceipt, FaShoppingBag, FaTruck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Interfaces for enriched data
interface ProductDetail {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

interface EnrichedOrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

// Enhanced StatusBadge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: { [key: string]: { class: string; icon: JSX.Element } } = {
    Pending: {
      class: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-500/30',
      icon: <FaCalendar className="mr-1" />
    },
    Paid: {
      class: 'bg-green-100 text-green-800 ring-1 ring-inset ring-blue-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30',
      icon: <FaReceipt className="mr-1" />
    },
    Shipped: {
      class: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-500/30',
      icon: <FaTruck className="mr-1" />
    },
    Delivered: {
      class: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30',
      icon: <FaBox className="mr-1" />
    },
    Cancelled: {
      class: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-500/30',
      icon: <FaShoppingBag className="mr-1" />
    },
    Refunded: {
      class: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
      icon: <FaReceipt className="mr-1" />
    },
  };
  
  const config = statusConfig[status] || { class: 'bg-slate-100 text-slate-800', icon: <FaShoppingBag className="mr-1" /> };
  
  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center w-fit ${config.class}`}>
      {config.icon}
      {status}
    </span>
  );
};

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId!, { skip: !orderId });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [enrichedItems, setEnrichedItems] = useState<EnrichedOrderItem[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        const promise = cancelOrder(order.id).unwrap();
        toast.promise(promise, {
            loading: 'Cancelling order...',
            success: () => {
                navigate('/profile');
                return 'Order cancelled successfully.';
            },
            error: 'Failed to cancel order.',
        });
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!order || order.items.length === 0) {
        setIsFetchingDetails(false);
        return;
      }
      try {
        setIsFetchingDetails(true);
        const productIds = order.items.map(item => item.productId);
        const response = await api.post<ProductDetail[]>('/products/batch', productIds);
        const productDetailsMap = new Map(response.data.map(p => [p.id, p]));
        const newEnrichedItems = order.items.map(item => {
          const details = productDetailsMap.get(item.productId);
          return {
            ...item,
            name: details?.name || 'Product not found',
            imageUrl: details?.imageUrl || '',
          };
        });
        setEnrichedItems(newEnrichedItems);
      } catch (err) {
        console.error("Failed to fetch product details for order", err);
      } finally {
        setIsFetchingDetails(false);
      }
    };
    fetchProductDetails();
  }, [order]);

  if (isLoading || isFetchingDetails) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="animate-pulse">
          <FaShoppingBag className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 dark:text-slate-400">Loading order details...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
        <p className="text-red-600 text-lg">Error loading order details.</p>
      </div>
    </div>
  );
  
  if (!order) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <FaShoppingBag className="mx-auto text-5xl text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-slate-400 text-lg">Order not found.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">Order Details</h1>
            <p className="text-gray-600 dark:text-slate-400">Order #<span className="font-mono font-semibold">{order.id}</span></p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {order.status === 'Pending' && (
                <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-400 flex items-center"
                >
                    <FaTimes className="mr-2" />
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
            )}
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-slate-100 flex items-center">
              <FaShoppingBag className="mr-3 text-gray-400" />
              Items Ordered
            </h2>
            
            <div className="space-y-4">
              {enrichedItems.map((item) => (
                <div key={item.productId} className="flex items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-sm transition-shadow">
                  <img 
                    src={item.imageUrl || 'https://placehold.co/100x100/png?text=Product'} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-md mr-4" 
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-slate-100 text-lg">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Quantity: {item.quantity}</p>
                    <p className="text-gray-600 dark:text-slate-300 font-medium mt-1">{formatCurrency(item.price)} each</p>
                  </div>
                  <p className="font-semibold text-lg text-gray-800 dark:text-slate-100 w-24 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-slate-400">Order Placed</span>
                <span className="text-gray-800 dark:text-slate-200 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 sticky top-8">
            <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 dark:border-slate-700 pb-4 text-gray-800 dark:text-slate-100 flex items-center">
              <FaReceipt className="mr-3 text-gray-400" />
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Subtotal ({enrichedItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="text-gray-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Tax</span>
                <span className="text-gray-800 dark:text-slate-200">Included</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-xl pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
              <span className="text-gray-800 dark:text-slate-100">Total</span>
              <span className="text-green-600 dark:text-green-400">{formatCurrency(order.totalAmount)}</span>
            </div>

            {/* Order Information */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Order Date:</span>
                  <span className="text-gray-800 dark:text-slate-200">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;