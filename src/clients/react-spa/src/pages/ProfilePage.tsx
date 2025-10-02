import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  FaChevronRight, 
  FaBoxOpen, 
  FaUser, 
  FaHistory, 
  FaShoppingBag, 
  FaCalendar, 
  FaReceipt, 
  FaHourglassHalf, 
  FaCreditCard,
  FaExclamationTriangle,
  FaSync,
  FaFilter,
  FaShoppingCart,
  FaStore
} from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemsCount: number;
  items: Array<{ id: string; name: string; quantity: number }>;
}

type FilterStatus = 'all' | 'pending' | 'completed' | 'shipped' | 'delivered';

interface AccountStats {
  memberSince: string;
  totalOrders: number;
  lifetimeSpent: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: { [key: string]: { class: string; icon: JSX.Element } } = {
    Pending: {
      class: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-500/30',
      icon: <FaHourglassHalf className="w-4 h-4" />
    },
    Paid: {
      class: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30',
      icon: <FaReceipt className="w-4 h-4" />
    },
    Shipped: {
      class: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-500/30',
      icon: <FaShoppingBag className="w-4 h-4" />
    },
    Delivered: {
      class: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-500/30',
      icon: <FaBoxOpen className="w-4 h-4" />
    },
    Cancelled: {
      class: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-500/30',
      icon: <FaExclamationTriangle className="w-4 h-4" />
    },
    Refunded: {
      class: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
      icon: <FaReceipt className="w-4 h-4" />
    },
  };
  
  const config = statusConfig[status] || statusConfig.Pending;
  
  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 w-fit ${config.class}`}>
      {config.icon}
      {status}
    </span>
  );
};

const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const Sidebar = ({ stats }: { stats: AccountStats }) => {
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 h-fit">
      {/* Account Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Account Overview
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Member since</span>
            <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{stats.memberSince}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Total orders</span>
            <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{stats.totalOrders}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Lifetime spent</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {formatCurrency(stats.lifetimeSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center">
          <FaStore className="mr-2 text-blue-600" />
          Quick Links
        </h3>
        <div className="space-y-2">
          <Link 
            to="/products" 
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm py-2"
          >
            <FaShoppingBag className="w-4 h-4" />
            All Products
          </Link>
          <Link 
            to="/cart" 
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm py-2"
          >
            <FaShoppingCart className="w-4 h-4" />
            My Cart
          </Link>
          <Link 
            to="/profile" 
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm py-2"
          >
            <FaUser className="w-4 h-4" />
            My Account
          </Link>
        </div>
      </div>

      {/* Store Info */}
      <div className="pt-6 border-t border-gray-200 dark:border-slate-600">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3">Drobble</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Your one-stop shop for the best products online. Quality and customer satisfaction are our top priorities.
        </p>
        
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-slate-200 mb-2">Contact Us</h4>
            <p className="text-gray-600 dark:text-slate-400">Email: support@drobble.com</p>
            <p className="text-gray-600 dark:text-slate-400">Phone: (123) 456-7890</p>
            <p className="text-gray-600 dark:text-slate-400">Cebu City, Philippines</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [error, setError] = useState<string | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats>({
    memberSince: '2024',
    totalOrders: 0,
    lifetimeSpent: 0
  });

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await api.get<Order[]>('/orders/my-orders');
      const ordersWithCounts = response.data.map(order => ({
        ...order,
        itemsCount: order.items?.length || 0
      }));
      setOrders(ordersWithCounts);
      
      // Calculate account stats
      const totalOrders = ordersWithCounts.length;
      const lifetimeSpent = ordersWithCounts.reduce((sum, order) => sum + order.totalAmount, 0);
      setAccountStats(prev => ({
        ...prev,
        totalOrders,
        lifetimeSpent
      }));
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setError('Failed to load orders. Please try again.');
      toast.error('Could not load your orders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayNow = async (orderId: string) => {
    setIsPaying(orderId);
    const loadingToast = toast.loading('Redirecting to payment...');
    
    try {
      const paymentResponse = await api.post('/payments/create-order', {
        orderId: orderId,
        gateway: 'PayPal'
      });
      
      const { approvalUrl } = paymentResponse.data;

      if (approvalUrl) {
        toast.dismiss(loadingToast);
        window.location.href = approvalUrl;
      } else {
        throw new Error("Could not get PayPal approval URL.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Could not initiate payment. Please try again.');
      console.error('Failed to create payment order:', error);
    } finally {
      setIsPaying(null);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'pending':
        return order.status === 'Pending';
      case 'completed':
        return ['Delivered', 'Paid', 'Shipped'].includes(order.status);
      case 'shipped':
        return order.status === 'Shipped';
      case 'delivered':
        return order.status === 'Delivered';
      default:
        return true;
    }
  });

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const completedOrders = orders.filter(o => o.status !== 'Pending');

  const statusFilters: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: pendingOrders.length },
    { value: 'completed', label: 'Completed', count: completedOrders.length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse mb-8">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-96"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
              <FaUser className="text-2xl text-gray-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">My Account</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                Welcome back! Here's your order history.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="ml-auto text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-gray-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && filter === 'all' && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-6 flex items-center">
                <FaHourglassHalf className="mr-3 text-yellow-500" />
                Pending Payment
                <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-sm px-2 py-1 rounded-full">
                  {pendingOrders.length}
                </span>
              </h2>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700/50 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-800 dark:text-slate-200">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <FaCalendar className="w-3 h-3" />
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {order.itemsCount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''} • {order.items[0]?.name}
                            {order.itemsCount > 1 && ` and ${order.itemsCount - 1} more`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <button
                          onClick={() => handlePayNow(order.id)}
                          disabled={isPaying === order.id}
                          className="inline-flex items-center justify-center bg-green-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-green-700 transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px]"
                        >
                          <FaCreditCard className="mr-2 w-4 h-4" />
                          {isPaying === order.id ? 'Redirecting...' : 'Pay Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 flex items-center">
                <FaHistory className="mr-3 text-gray-400" />
                Order History
              </h2>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <FaBoxOpen className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  {filter === 'all' ? 'No Orders Yet' : `No ${filter} orders`}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  {filter === 'all' 
                    ? "You haven't placed any orders yet. Start shopping to see your orders here."
                    : `You don't have any ${filter} orders at the moment.`
                  }
                </p>
                {filter === 'all' && (
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FaShoppingBag className="w-4 h-4" />
                    Start Shopping
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Link to={`/orders/${order.id}`} key={order.id} className="block group">
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <p className="text-gray-800 dark:text-slate-200 font-semibold">
                              Order #{order.id.substring(0, 8).toUpperCase()}
                            </p>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <FaCalendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span>
                              {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {order.itemsCount > 0 && (
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                              Includes: {order.items[0]?.name}
                              {order.itemsCount > 1 && ` and ${order.itemsCount - 1} more item${order.itemsCount - 1 !== 1 ? 's' : ''}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(order.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              Total
                            </p>
                          </div>
                          <FaChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-lg flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <Sidebar stats={accountStats} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;