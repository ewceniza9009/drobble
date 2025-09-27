// ---- File: src/pages/ProfilePage.tsx ----
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

// A small component to render a colored status badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: { [key: string]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Paid: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Refunded: 'bg-gray-100 text-gray-800',
  };

  const badgeClass = statusClasses[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
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
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) return <p className="text-center">Loading order history...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <FaBoxOpen className="mx-auto text-5xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Orders Yet</h2>
            <p className="text-gray-500 mt-2">You haven't placed any orders. When you do, they'll show up here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block group">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:border-blue-500 border border-transparent transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono text-gray-800">{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <StatusBadge status={order.status} />
                        <FaChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;