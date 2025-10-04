// ---- File: src/clients/react-spa/src/pages/admin/AdminPromotions.tsx ----
import { Link } from 'react-router-dom';
import { useGetAdminPromotionsQuery } from '../../store/apiSlice';
import { FaPlus, FaTicketAlt } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatting';

const AdminPromotions = () => {
    const { data: promotions, error, isLoading } = useGetAdminPromotionsQuery();

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

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Promotion Management</h1>
                <Link
                    to="/admin/promotions/new"
                    className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow"
                >
                    <FaPlus className="mr-2" />
                    Create Promotion
                </Link>
            </div>

            {promotions && promotions.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Usage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-mono text-sm text-indigo-600 dark:text-indigo-400">{promo.code}</td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">{promo.name}</td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
                                        {promo.discountType === 'Percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 dark:text-slate-300">{promo.timesUsed} / {promo.usageLimit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                    <FaTicketAlt className="mx-auto text-5xl text-slate-400 dark:text-slate-500 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No promotions found. Create one to get started!</p>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;