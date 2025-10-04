// ---- File: src/clients/react-spa/src/pages/admin/AdminPromotions.tsx ----
import { Link } from 'react-router-dom';
import { useGetAdminPromotionsQuery } from '../../store/apiSlice';
import { FaPlus, FaTicketAlt, FaSync, FaCheckCircle, FaTimesCircle, FaPercentage, FaDollarSign, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatting';

// --- NEW: Status Badge component for consistency ---
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
    const config = isActive
        ? { class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <FaCheckCircle />, text: 'Active' }
        : { class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <FaTimesCircle />, text: 'Inactive' };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ring-1 ring-inset ${config.class}`}>
            {config.icon}
            {config.text}
        </span>
    );
};


const AdminPromotions = () => {
    const { data: promotions = [], error, isLoading, refetch, isFetching } = useGetAdminPromotionsQuery();
    
    if (isLoading) return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <FaTicketAlt className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Loading promotions...</p>
            </div>
          </div>
        </div>
      );
      
    if (error) return <div className="p-6 text-red-500">Error loading promotions.</div>;

    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(p => p.isActive).length;

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                            <FaTicketAlt className="text-3xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Promotion Management</h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">View and manage all discount codes and promotions</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                         <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                            <FaSync className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <Link
                            to="/admin/promotions/new"
                            className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-medium shadow"
                        >
                            <FaPlus className="mr-2" />
                            Create Promotion
                        </Link>
                    </div>
                </div>
            </div>

             {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Promotions</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{totalPromotions}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Active Promotions</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activePromotions}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Value</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Usage</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {promotions.map((promo) => (
                            <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-indigo-600 dark:text-indigo-400">{promo.code}</td>
                                <td className="px-6 py-4 text-gray-800 dark:text-slate-200">{promo.name}</td>
                                <td className="px-6 py-4 text-gray-800 dark:text-slate-200 flex items-center">
                                    {promo.discountType === 'Percentage' ? <FaPercentage className="mr-2 text-gray-400"/> : <FaDollarSign className="mr-2 text-gray-400" />}
                                    {promo.discountType === 'Percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge isActive={promo.isActive} />
                                </td>
                                <td className="px-6 py-4 text-center text-gray-800 dark:text-slate-300">{promo.timesUsed} / {promo.usageLimit}</td>
                                <td className="px-6 py-4 text-right">
                                     <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" title="Edit Promotion">
                                        <FaEdit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPromotions;