// ---- File: src/clients/react-spa/src/pages/admin/AdminCategoryEdit.tsx ----

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    useGetCategoriesQuery, 
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation 
} from '../../store/apiSlice';
import { FaSave, FaArrowLeft, FaTags, FaSpinner, FaInfoCircle } from 'react-icons/fa';

const AdminCategoryEdit = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(categoryId);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [parentId, setParentId] = useState<string | undefined>();

    // API Hooks
    const { data: categoryData, isLoading: isLoadingCategory } = useGetCategoryByIdQuery(categoryId!, { skip: !isEditing });
    const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const isLoadingMutation = isCreating || isUpdating;

    useEffect(() => {
        if (isEditing && categoryData) {
            setName(categoryData.name);
            setDescription(categoryData.description || '');
            setSlug(categoryData.slug);
            setParentId(categoryData.parentId);
        }
    }, [isEditing, categoryData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const categoryBody = { name, description, slug, parentId: parentId || undefined };

        try {
            if (isEditing) {
                await updateCategory({ id: categoryId!, ...categoryBody }).unwrap();
                toast.success('Category updated successfully!');
            } else {
                await createCategory(categoryBody).unwrap();
                toast.success('Category created successfully!');
            }
            navigate('/admin/categories');
        } catch (err) {
            toast.error('Operation failed. Please try again.');
        }
    };

    const potentialParents = categories.filter(cat => cat.id !== categoryId);
    const parentCategoryName = parentId ? categories.find(c => c.id === parentId)?.name : 'None';

    if (isLoadingCategory) {
        return (
            <div className="flex justify-center items-center p-12">
                <FaSpinner className="animate-spin text-4xl text-green-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                            <FaTags className="text-3xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                                {isEditing ? "Edit Category" : "Create New Category"}
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">
                                {isEditing ? `Editing: ${categoryData?.name}` : "Add a new category to your catalog"}
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/categories"
                        className="mt-4 lg:mt-0 flex items-center space-x-2 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 font-medium"
                    >
                        <FaArrowLeft />
                        <span>Back to Categories</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-8">
                                {/* Category Details Section */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                                        <FaInfoCircle className="mr-2 text-green-500" />
                                        Category Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Name</label>
                                                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                            </div>
                                            <div>
                                                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Slug</label>
                                                <input id="slug" type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="mt-1 w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
                                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Parent Category</label>
                                            <select id="parentId" value={parentId || ''} onChange={e => setParentId(e.target.value || undefined)} disabled={isLoadingCategories} className="mt-1 w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">{isLoadingCategories ? 'Loading...' : 'None'}</option>
                                                {potentialParents.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Form Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                                <Link to="/admin/categories" className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-center">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={isLoadingMutation} className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium">
                                    <FaSave />
                                    <span>{isLoadingMutation ? 'Saving...' : 'Save Category'}</span>
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
                                    <span className="text-gray-600 dark:text-slate-400">Name:</span>
                                    <span className="font-medium text-gray-800 dark:text-slate-200">{name || '...'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Slug:</span>
                                    <span className="font-mono text-gray-800 dark:text-slate-200">/{slug || '...'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Parent:</span>
                                    <span className="font-medium text-gray-800 dark:text-slate-200">{parentCategoryName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Tips</h3>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400 list-disc list-inside">
                                <li>Use clear and concise names for categories.</li>
                                <li>Slugs are used for URLs and should be unique and descriptive.</li>
                                <li>You can create sub-categories by assigning a parent.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategoryEdit;