import { Link } from 'react-router-dom';
import { useGetVendorProductsQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/formatting';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';

const VendorProducts = () => {
  const { data, error, isLoading } = useGetVendorProductsQuery({});

  if (isLoading) return <div className="text-center">Loading your products...</div>;
  if (error) return <div className="text-center text-red-500">Error loading products.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        {/* We can assume a '/vendor/products/new' route would exist */}
        <Link 
          to="#" 
          className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow"
        >
          <FaPlus className="mr-2" />
          Add New Product
        </Link>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <img 
              src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'} 
              alt={product.name} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
              <p className="text-xl font-bold text-green-600 mt-2 flex-grow">{formatCurrency(product.price)}</p>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Link 
                  to="#" // Assume a '/vendor/products/edit/:id' route
                  className="text-indigo-600 hover:text-indigo-800" 
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