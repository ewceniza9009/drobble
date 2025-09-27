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

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: { [key: string]: string } = {
    Pending: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200',
    Paid: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200',
    Shipped: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200',
    Delivered: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200',
    Cancelled: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200',
    Refunded: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200',
  };

  const badgeClass = statusClasses[status] || 'bg-slate-100 text-slate-800';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
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

  if (isLoading) return <p className="text-center py-10">Loading order history...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl shadow-lg border border-slate-200">
            <FaBoxOpen className="mx-auto text-5xl text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">No Orders Yet</h2>
            <p className="text-slate-500 mt-2">You haven't placed any orders. When you do, they'll show up here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block group">
              <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 border border-slate-200 transition-all duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-slate-600 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex items-center space-x-4 ml-6">
                        <StatusBadge status={order.status} />
                        <FaChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
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