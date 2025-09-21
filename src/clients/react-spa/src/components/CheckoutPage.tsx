import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { placeOrder } from '../store/cartSlice';

const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items } = useSelector((state: RootState) => state.cart);
  const total = items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

  const handlePlaceOrder = async () => {
    try {
      await dispatch(placeOrder()).unwrap();
      alert('Order placed successfully!');
      navigate('/'); // Redirect to homepage
    } catch (error) {
      alert('Failed to place order.');
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
          className="mt-6 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;