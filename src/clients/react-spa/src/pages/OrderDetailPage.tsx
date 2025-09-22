// ---- File: src/pages/OrderDetailPage.tsx ----
import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../store/apiSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';

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

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId!, {
    skip: !orderId, // don't fetch if orderId is not available yet
  });

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

  if (isLoading || isFetchingDetails) return <p className="text-center">Loading order details...</p>;
  if (error) return <p className="text-center text-red-500">Error loading order.</p>;
  if (!order) return <p className="text-center">Order not found.</p>;

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Order Confirmation</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase!</p>
      
      <div className="border-b pb-4 mb-4">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span className="font-semibold text-green-600">{order.status}</span></p>
        <p><strong>Order Total:</strong> <span className="font-bold text-xl">${order.totalAmount.toFixed(2)}</span></p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Items Ordered</h2>
      <div className="space-y-4">
        {enrichedItems.map((item) => (
          <div key={item.productId} className="flex items-center py-2 border-b last:border-b-0">
            <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
            <div className="flex-grow">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            </div>
            <p className="font-semibold w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailPage;