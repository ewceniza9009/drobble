// ---- File: src/clients/react-spa/src/pages/admin/AdminPromotionCreate.tsx ----
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCreateAdminPromotionMutation } from '../../store/apiSlice';
import { FaSave, FaArrowLeft, FaTicketAlt, FaInfoCircle, FaPercentage, FaDollarSign, FaHashtag } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatting';

const AdminPromotionCreate = () => {
    const navigate = useNavigate();
    const [createPromotion, { isLoading }] = useCreateAdminPromotionMutation();

    // --- State remains the same ---
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'Percentage' | 'FixedAmount'>('Percentage');
    const [value, setValue] = useState(0);
    const [usageLimit, setUsageLimit] = useState(1);
    const [isActive, setIsActive] = useState(true);

    // --- Logic remains the same ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPromotion({
                name,
                code,
                description,
                promotionType: 'Code',
                discountType,
                value,
                usageLimit,
                isActive,
                startDate: new Date().toISOString(),
                rules: {
                    minPurchaseAmount: 0,
                    applicableCategoryIds: [],
                    applicableProductIds: [],
                    exclusiveUserIds: []
                }
            }).unwrap();
            toast.success('Promotion created successfully!');
            navigate('/admin/promotions');
        } catch (err) {
            toast.error('Failed to create promotion. Check the code is unique.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                            <FaTicketAlt className="text-3xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                                Create New Promotion
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">
                                Add a new discount code or promotion to your store
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/promotions"
                        className="mt-4 lg:mt-0 flex items-center space-x-2 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 font-medium"
                    >
                        <FaArrowLeft />
                        <span>Back to Promotions</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-8">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                                        <FaInfoCircle className="mr-2 text-green-500" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Promotion Name</label>
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" placeholder="e.g., Summer Sale 2025" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
                                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" placeholder="A brief description for internal reference" />
                                        </div>
                                    </div>
                                </div>

                                {/* Discount Details */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                                        <FaPercentage className="mr-2 text-green-500" />
                                        Discount Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Promo Code</label>
                                            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" placeholder="e.g., SUMMER25" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Discount Type</label>
                                            <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                                <option value="Percentage">Percentage</option>
                                                <option value="FixedAmount">Fixed Amount</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Value</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    {discountType === 'Percentage' ? <FaPercentage className="h-5 w-5 text-gray-400" /> : <FaDollarSign className="h-5 w-5 text-gray-400" />}
                                                </div>
                                                <input type="number" step="0.01" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full p-3 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Usage Limits */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                                        <FaHashtag className="mr-2 text-green-500" />
                                        Usage Limits
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Total Usage Limit</label>
                                            <input type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" required />
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center space-x-3 p-3">
                                                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Activate Promotion</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                                <Link to="/admin/promotions" className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-center">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium">
                                    <FaSave />
                                    <span>{isLoading ? 'Saving...' : 'Save Promotion'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Code:</span>
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{code || '...'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Discount:</span>
                                    <span className="font-medium text-gray-800 dark:text-slate-200">
                                        {discountType === 'Percentage' ? `${value}%` : formatCurrency(value)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Usage Limit:</span>
                                    <span className="font-medium text-gray-800 dark:text-slate-200">{usageLimit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Tips for Promotions</h3>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                <li>• Keep promo codes short and memorable.</li>
                                <li>• Set clear start and end dates for seasonal sales.</li>
                                <li>• Use usage limits to create urgency.</li>
                                <li>• Test fixed amount vs. percentage discounts to see what works best.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPromotionCreate;