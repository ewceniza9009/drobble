import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaChevronRight, FaBoxOpen, FaUser, FaHistory, FaShoppingBag, FaCalendar, FaReceipt } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemsCount?: number;
}

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
        icon: <FaShoppingBag className="mr-1" />
    },
    Delivered: {
        class: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30',
        icon: <FaBoxOpen className="mr-1" />
    },
    Cancelled: {
        class: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-500/30',
        icon: <FaHistory className="mr-1" />
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

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
        const ordersWithCounts = response.data.map(order => ({
          ...order,
          itemsCount: (order as any).items.length || 0 
        }));
        setOrders(ordersWithCounts);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="animate-pulse">
          <FaHistory className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 dark:text-slate-400">Loading your order history...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <FaUser className="text-2xl text-gray-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">My Account</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Welcome back! Here's your order history.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content - Order History */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 flex items-center">
                Order History
              </h2>
              <span className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 px-3 py-1 rounded-full text-sm font-medium">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FaBoxOpen className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-6">You haven't placed any orders. When you do, they'll show up here!</p>
                <Link 
                  to="/" 
                  className="inline-flex items-center bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition-all"
                >
                  <FaShoppingBag className="mr-2" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link to={`/orders/${order.id}`} key={order.id} className="block group">
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded-lg">
                              <FaReceipt className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">ORDER NUMBER</p>
                              <p className="text-gray-800 dark:text-slate-200 font-semibold">#{order.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                            <span className="flex items-center">
                              <FaCalendar className="mr-1" />
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            {order.itemsCount && (
                              <span className="flex items-center">
                                <FaShoppingBag className="mr-1" />
                                {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status and Amount */}
                        <div className="flex flex-col items-start lg:items-end space-y-2">
                          <StatusBadge status={order.status} />
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(order.totalAmount)}</p>
                        </div>

                        {/* Chevron */}
                        <div className="lg:pl-4">
                          <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-lg" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 sticky top-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100 flex items-center">
              <FaUser className="mr-2 text-gray-400" />
              Account Overview
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Member since</span>
                <span className="text-gray-800 dark:text-slate-200 font-medium">2024</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Total orders</span>
                <span className="text-gray-800 dark:text-slate-200 font-medium">{orders.length}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Lifetime spent</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <Link 
                to="/" 
                className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-900 transition-all text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;