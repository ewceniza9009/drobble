import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import type { AppDispatch } from '../store/store';
import { removeItemFromCart } from '../store/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status } = useSelector((state: RootState) => state.cart);

  // Note: In a real app, you would fetch product details (name, image) here
  // For now, we will just display the IDs and quantities from our cart state.

  const handleRemove = (productId: string) => {
    dispatch(removeItemFromCart(productId));
  };

  if (status === 'loading') return <p>Updating cart...</p>;
  if (items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Product ID: {item.productId}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
            <button
              onClick={() => handleRemove(item.productId)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartPage;