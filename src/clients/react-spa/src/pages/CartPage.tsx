import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { removeItemFromCart } from '../store/cartSlice';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaTrash } from 'react-icons/fa';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
}

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cartItems.length === 0) {
        setEnrichedItems([]);
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
            name: details?.name || 'Product not found',
            price: details?.price || 0,
            imageUrl: details?.imageUrl || '',
          };
        });

        setEnrichedItems(newEnrichedItems);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [cartItems]);

  const handleRemove = (productId: string) => {
    dispatch(removeItemFromCart(productId));
  };

  const cartTotal = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isLoading) return <p>Loading cart...</p>;
  if (enrichedItems.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {enrichedItems.map((item) => (
          <div key={item.productId} className="flex items-center py-4 border-b last:border-b-0">
            <img src={item.imageUrl || 'https://placehold.co/100x100/png?text=...'} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
            <div className="flex-grow">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            </div>
            <div className="flex items-center space-x-4">
              <p className="font-semibold w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Remove item"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end font-bold text-xl pt-4 border-t">
          <span>Total: ${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to="/checkout"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;