import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaTimesCircle, FaShoppingCart } from 'react-icons/fa';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        toast.error("Your payment was cancelled.");
        
        // Redirect back to the cart after a short delay
        const timer = setTimeout(() => {
            navigate('/cart');
        }, 3000);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <FaTimesCircle className="text-5xl text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Payment Cancelled</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2 mb-6">
                Your payment process was not completed. You have not been charged.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mb-6">Redirecting you back to your cart...</p>
            <Link
                to="/cart"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
                <FaShoppingCart className="mr-2" />
                Return to Cart
            </Link>
        </div>
    );
};

export default PaymentCancelPage;
