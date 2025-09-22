// ---- File: src/components/CheckoutPage.tsx ----
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, status } = useSelector((state: RootState) => state.cart);
  const total = items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
        toast.error("Your cart is empty.");
        return;
    }

    try {
      // .unwrap() will return the payload or throw an error
      const createdOrder = await dispatch(placeOrder()).unwrap();
      toast.success('Order placed successfully!');
      navigate(`/orders/${createdOrder.id}`); // Redirect to the new order detail page
    } catch (error) {
      toast.error('Failed to place order.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={item.productId} className="flex justify-between py-2">
            <span>Product ID: {item.productId.substring(0, 8)}... (x{item.quantity})</span>
            <span>${(item.priceAtAdd * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={status === 'loading'}
          className="mt-6 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;