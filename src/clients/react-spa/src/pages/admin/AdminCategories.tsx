// ---- File: src/clients/react-spa/src/pages/admin/AdminCategories.tsx ----

import { Link } from 'react-router-dom';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTags, FaExclamationTriangle, FaSitemap } from 'react-icons/fa';

const AdminCategories = () => {
  const { data: categories = [], error, isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This may affect products in this category.`)) {
      try {
        await deleteCategory(id).unwrap();
        toast.success(`Category "${name}" deleted successfully.`);
      } catch (err) {
        toast.error('Failed to delete category.');
      }
    }
  };
  
  const getParentName = (parentId?: string) => {
    if (!parentId) return <span className="text-gray-400 dark:text-slate-500">None</span>;
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : <span className="text-red-500">Invalid Parent</span>;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <FaTags className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading Categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
        Error loading categories.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
                <FaTags className="text-3xl text-green-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Category Management</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">Organize your products by adding, editing, or removing categories.</p>
            </div>
          </div>
          <Link
            to="/admin/categories/new"
            className="mt-4 sm:mt-0 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all font-medium shadow"
          >
            <FaPlus className="mr-2" />
            Create Category
          </Link>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Parent Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-slate-100">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400 font-mono text-sm">/{category.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        {category.parentId && <FaSitemap className="text-gray-400" />}
                        {getParentName(category.parentId)}
                      </div>
                    </td>
                    {/* --- THIS IS THE FIX --- */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/categories/edit/${category.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                          title="Edit Category"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={isDeleting}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-50 transition-colors"
                          title="Delete Category"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-slate-400">
                    No categories found. Click "Create Category" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;