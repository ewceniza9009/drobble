import { Link } from 'react-router-dom';
import { useGetVendorProductsQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/formatting';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';

const VendorProducts = () => {
  const { data, error, isLoading } = useGetVendorProductsQuery({});

  if (isLoading) return <div className="p-6 text-center text-gray-600 dark:text-slate-400">Loading your products...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading products.</div>;

  return (
    <div className="p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">My Products</h1>
        <Link 
          to="#" 
          className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors shadow"
        >
          <FaPlus className="mr-2" />
          Add New Product
        </Link>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map((product) => (
          <div key={product.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-200 dark:border-slate-700">
            <img 
              src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'} 
              alt={product.name} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 truncate">{product.name}</h2>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-2 flex-grow">{formatCurrency(product.price)}</p>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-end">
                <Link 
                  to="#" // Assume a '/vendor/products/edit/:id' route
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" 
                  title="Edit Product"
                >
                  <FaPencilAlt />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorProducts;