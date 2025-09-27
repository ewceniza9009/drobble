import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../store/apiSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatting';

// Interfaces for enriched data
interface ProductDetail {
  id: string;
  name: string;
  imageUrl: string;
}

interface EnrichedOrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

// Re-using the StatusBadge component for a consistent look
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


const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId!, { skip: !orderId });

  const [enrichedItems, setEnrichedItems] = useState<EnrichedOrderItem[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(true);

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

  if (isLoading || isFetchingDetails) return <p className="text-center py-10">Loading order details...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Error loading order.</p>;
  if (!order) return <p className="text-center py-10">Order not found.</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-6 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Order Details</h1>
                <p className="text-sm text-slate-500 mt-1">Order #{order.id}</p>
            </div>
            <div className="text-sm text-slate-600 mt-4 sm:mt-0 sm:text-right">
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center justify-start sm:justify-end space-x-2 mt-1">
                    <span><strong>Status:</strong></span>
                    <StatusBadge status={order.status} />
                </div>
            </div>
        </div>

      <h2 className="text-xl font-semibold mb-4 text-slate-700">Items Ordered</h2>
      <div className="space-y-4">
        {enrichedItems.map((item) => (
          <div key={item.productId} className="flex items-center py-3 border-b border-slate-100 last:border-b-0">
            <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
            <div className="flex-grow">
              <p className="font-semibold text-slate-800">{item.name}</p>
              <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
            </div>
            <p className="font-semibold w-24 text-right text-slate-700">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>FREE</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-slate-800 pt-2 mt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;