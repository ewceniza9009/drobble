import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation, useCancelOrderMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatting';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle, FaUser } from 'react-icons/fa';

const AdminOrders = () => {
    const { data, error, isLoading } = useGetAdminOrdersQuery();
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

    const handleUpdateStatus = (orderId: string, newStatus: string) => {
        const promise = updateStatus({ orderId, newStatus }).unwrap();
        toast.promise(promise, {
            loading: 'Updating order status...',
            success: `Order status updated to ${newStatus}!`,
            error: 'Failed to update status.',
        });
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 my-6">Order Management</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
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
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300`}>{order.status}</span></td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    {order.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(order.id, 'Paid')}
                                                disabled={isUpdating}
                                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm disabled:bg-gray-400"
                                            >
                                                Mark as Paid
                                            </button>
                                            <button 
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={isCancelling}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm disabled:bg-gray-400"
                                            >
                                                <FaTimesCircle className="inline mr-1" /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'Paid' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order.id, 'Shipped')} 
                                            disabled={isUpdating}
                                            className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 text-sm disabled:bg-gray-400"
                                        >
                                            <FaTruck className="inline mr-1" /> Mark Shipped
                                        </button>
                                    )}
                                    {order.status === 'Shipped' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                            disabled={isUpdating}
                                            className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600 text-sm disabled:bg-gray-400"
                                        >
                                            <FaCheckCircle className="inline mr-1" /> Mark Delivered
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;