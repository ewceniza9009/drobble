import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import type { RootState } from '../store/store';

const CartIcon = () => {
  const items = useSelector((state: RootState) => state.cart.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link to="/cart" className="relative  dark:text-slate-300 text-gray-600 hover:text-green-500" title="View Cart">
      <FaShoppingCart size="1.4em" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;