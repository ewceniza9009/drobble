// ---- File: src/pages/ProfilePage.tsx ----
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../api/axios';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { productId: string; quantity: number; price: number }[];
}

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

  if (isLoading) return <p>Loading order history...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block hover:bg-gray-50 transition-colors">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Order ID: {order.id.substring(0, 8)}...</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p>Status: {order.status}</p>
                <p>Total: ${order.totalAmount.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;