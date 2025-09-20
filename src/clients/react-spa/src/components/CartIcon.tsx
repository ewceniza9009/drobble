import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; 
import type { RootState } from '../store/store';

const CartIcon = () => {
  const items = useSelector((state: RootState) => state.cart.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link to="/cart"> {/* Wrap with Link */}
      <div className="relative">
        <span>Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;