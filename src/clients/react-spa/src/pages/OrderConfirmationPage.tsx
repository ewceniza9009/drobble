// ---- File: src/clients/react-spa/src/pages/OrderConfirmationPage.tsx ----
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

const OrderConfirmationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    
    // Get Order ID from either PayPal redirect or COD redirect
    const orderIdFromUrl = searchParams.get('orderId');
    const orderIdFromStorage = localStorage.getItem('drobbleOrderId');
    const finalOrderId = orderIdFromUrl || orderIdFromStorage;

    useEffect(() => {
        const token = searchParams.get('token'); // From PayPal
        const payerId = searchParams.get('PayerID'); // From PayPal
        const isCod = !token; // If there's no token, we assume it's a COD order

        const confirmOrder = async () => {
            if (isCod) {
                // For COD, the order is already placed. Just show success.
                if (!finalOrderId) {
                    setStatus('error');
                    toast.error("Could not find order information.");
                    return;
                }
                setStatus('success');
            } else {
                // For PayPal, we need to capture the payment.
                if (!token || !payerId || !finalOrderId) {
                    toast.error("Payment information is incomplete.");
                    setStatus('error');
                    return;
                }

                try {
                    await api.post('/payments/capture-order', { gatewayOrderId: token });
                    setStatus('success');
                } catch (error) {
                    console.error("Failed to capture payment:", error);
                    toast.error("There was a problem confirming your payment.");
                    setStatus('error');
                }
            }
            // Clean up stored order ID
            localStorage.removeItem('drobbleOrderId');
        };

        confirmOrder();
    }, [navigate, searchParams, finalOrderId]);

    if (status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <FaSpinner className="animate-spin text-4xl text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Confirming Your Order</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-2">Please wait, this will only take a moment...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
             <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <FaTimesCircle className="text-6xl text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">Order Failed</h1>
                <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Unfortunately, we couldn't process your order. Please try again or contact support if the issue persists.
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-4">Thank You For Your Order!</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Your order has been placed successfully. You will receive an email confirmation shortly.
            </p>
            <Link
                to={finalOrderId ? `/orders/${finalOrderId}` : '/profile'}
                className="inline-flex items-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all shadow-md group"
            >
                View Your Order
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default OrderConfirmationPage;