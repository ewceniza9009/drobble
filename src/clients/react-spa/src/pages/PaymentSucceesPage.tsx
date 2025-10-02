import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const capturePayment = async () => {
            const token = searchParams.get('token'); // PayPal provides the order ID in the 'token' query param
            const payerId = searchParams.get('PayerID');

            // Retrieve the Drobble orderId we stored before redirecting
            const drobbleOrderId = localStorage.getItem('drobbleOrderId');
            if (drobbleOrderId) {
                setOrderId(drobbleOrderId);
                localStorage.removeItem('drobbleOrderId'); // Clean up immediately
            }

            if (!token || !payerId) {
                toast.error("Payment information is missing.");
                setStatus('error');
                return;
            }

            try {
                // Tell our backend to capture the payment using the token from PayPal
                await api.post('/payments/capture-order', { gatewayOrderId: token });
                setStatus('success');
            } catch (error) {
                console.error("Failed to capture payment:", error);
                toast.error("There was a problem confirming your payment. Please contact support.");
                setStatus('error');
            }
        };

        capturePayment();
    }, [navigate, searchParams]);

    if (status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <FaSpinner className="animate-spin text-4xl text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Processing Your Payment</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-2">Please wait, we're confirming your transaction...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
             <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <FaTimesCircle className="text-6xl text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">Payment Failed</h1>
                <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Unfortunately, we couldn't process your payment. Please try again or contact support if the issue persists.
                </p>
                <Link
                    to="/cart"
                    className="inline-flex items-center bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-md"
                >
                    Return to Cart
                </Link>
            </div>
        );
    }

    // Success state
    return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <FaCheckCircle className="text-6xl text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Thank you for your purchase. Your order has been confirmed and you will receive an email with the details shortly.
            </p>
            <Link
                to={orderId ? `/orders/${orderId}` : '/profile'}
                className="inline-flex items-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all shadow-md group"
            >
                View Your Order
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default PaymentSuccessPage;

