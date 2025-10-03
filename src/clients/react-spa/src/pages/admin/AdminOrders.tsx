// ---- Modify file: src/clients/react-spa/src/pages/admin/AdminOrders.tsx ----
import { useGetAdminOrdersQuery, useShipOrderMutation, useCancelOrderMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatting';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle, FaUser, FaCreditCard, FaMoneyBillWave, FaSync } from 'react-icons/fa';
import { useState } from 'react';
import Modal from '../../components/Modal';

interface Order {
    id: string;
    username: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
}

const AdminOrders = () => {
    // ** THE FIX IS HERE (Step 1) **: Destructure the refetch function and isFetching state.
    const { data, error, isLoading, refetch, isFetching } = useGetAdminOrdersQuery();
    const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');

    const getPaymentIcon = (paymentMethod: string) => {
        if (paymentMethod === 'CashOnDelivery') {
            return <FaMoneyBillWave className="mr-2 text-green-500"/>;
        }
        return <FaCreditCard className="mr-2 text-blue-500"/>;
    };

    const handleOpenShipModal = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setTrackingNumber('');
    };

    const handleConfirmShipment = () => {
        if (!selectedOrder) return;
        if (!trackingNumber || trackingNumber.trim() === '') {
            toast.error('Please enter a tracking number.');
            return;
        }

        const promise = shipOrder({ orderId: selectedOrder.id, trackingNumber }).unwrap();
        toast.promise(promise, {
            loading: 'Marking order as shipped...',
            success: 'Order has been marked as shipped!',
            error: 'Failed to ship order.',
        });
        
        handleCloseModal();
    };

    const handleCancelOrder = (orderId: string) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            const promise = cancelOrder(orderId).unwrap();
            toast.promise(promise, {
                loading: 'Cancelling order...',
                success: 'Order has been cancelled.',
                error: 'Failed to cancel order.',
            });
        }
    };
    
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-pulse">
                        <FaShoppingBag className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-slate-400">Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><p className="text-red-500">Error loading orders.</p></div>;

    const orders = data?.items || [];

    return (
        <div className="max-w-7xl mx-4 px-4 pb-6 dark:border-slate-700 border rounded-xl">
            {/* ** THE FIX IS HERE (Step 2) **: Added a header with a Refresh button */}
            <div className="flex justify-between items-center my-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Order Management</h1>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                    <FaSync className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-sm text-gray-800 dark:text-slate-300">{order.id.substring(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-gray-800 dark:text-slate-200">
                                        <FaUser className="text-gray-400 dark:text-slate-500 mr-2" />
                                        {order.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-800 dark:text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-800 dark:text-slate-300">
                                        {getPaymentIcon(order.paymentMethod)}
                                        {order.paymentMethod === 'CashOnDelivery' ? 'COD' : order.paymentMethod}
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300`}>{order.status}</span></td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</td>
                                
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {(order.status === 'Paid' || (order.status === 'Pending' && order.paymentMethod === 'CashOnDelivery')) && (
                                            <button
                                                onClick={() => handleOpenShipModal(order)}
                                                disabled={isShipping}
                                                className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 text-sm disabled:bg-gray-400 flex items-center"
                                            >
                                                <FaTruck className="inline mr-1" /> Ship
                                            </button>
                                        )}
                                        {order.status !== 'Shipped' && order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                             <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={isCancelling}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm disabled:bg-gray-400 flex items-center"
                                            >
                                                <FaTimesCircle className="inline mr-1" /> Cancel
                                            </button>
                                        )}
                                        {order.status === 'Shipped' && (
                                            <button className="bg-cyan-500 text-white px-3 py-1 rounded-md text-sm disabled:bg-gray-400 flex items-center" disabled>
                                                <FaCheckCircle className="inline mr-1" /> Shipped
                                            </button>
                                        )}
                                        {order.status === 'Cancelled' && (
                                            <button className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm" disabled>
                                                Cancelled
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={`Ship Order #${selectedOrder?.id.substring(0, 8)}...`}
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Tracking Number
                        </label>
                        <input
                            type="text"
                            id="trackingNumber"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter the tracking number from the courier"
                            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmShipment}
                            disabled={isShipping}
                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {isShipping ? 'Shipping...' : 'Confirm Shipment'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrders;