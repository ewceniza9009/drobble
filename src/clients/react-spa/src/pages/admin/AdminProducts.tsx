import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/apiSlice';
import { formatCurrency } from '../../utils/formatting';
import { FaPlus, FaEdit, FaBox, FaSearch, FaFilter, FaChartLine, FaDollarSign, FaWarehouse, FaEye } from 'react-icons/fa';

const AdminProducts = () => {
  const { data, error, isLoading } = useGetProductsQuery({ page: 1, pageSize: 999 });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <FaBox className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-lg">Error loading products. Please try again.</p>
      </div>
    </div>
  );

  const products = data?.items || [];
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock || 0)), 0);
  const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FaBox className="text-3xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog and inventory</p>
            </div>
          </div>
          <Link 
            to="/admin/products/new" 
            className="mt-4 lg:mt-0 flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-medium"
          >
            <FaPlus />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-green-600">{totalProducts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaBox className="text-xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-green-600">{totalStock}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaWarehouse className="text-xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaDollarSign className="text-xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaChartLine className="text-xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaFilter className="text-gray-400" />
              <span className="text-gray-600">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaBox className="mr-2 text-gray-400" />
              All Products ({totalProducts})
            </h2>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>Newest First</option>
                <option>Name A-Z</option>
                <option>Price Low-High</option>
                <option>Stock Level</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={product.imageUrl || 'https://placehold.co/60x60/png?text=Product'} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${
                      (product.stock || 0) === 0 ? 'text-red-600' : 
                      (product.stock || 0) < 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${
                      (product.stock || 0) === 0 ? 'bg-red-100 text-red-800 ring-red-200' :
                      (product.stock || 0) < 10 ? 'bg-orange-100 text-orange-800 ring-orange-200' :
                      'bg-green-100 text-green-800 ring-green-200'
                    }`}>
                      {(product.stock || 0) === 0 ? 'Out of Stock' : 
                       (product.stock || 0) < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        to={`/products/${product.id}`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="View Product"
                      >
                        <FaEye />
                      </Link>
                      <Link 
                        to={`/admin/products/edit/${product.id}`}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 border border-blue-200 rounded-lg hover:bg-green-100 transition-all font-medium"
                        title="Edit Product"
                      >
                        <FaEdit className="text-sm" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{products.length}</span> products
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Export Products
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Update Inventory
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Bulk Edit
            </button>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">Low Stock Alert</h3>
          <p className="text-orange-700 text-sm">
            {lowStockProducts} product{lowStockProducts !== 1 ? 's' : ''} need{lowStockProducts === 1 ? 's' : ''} restocking.
          </p>
          {lowStockProducts > 0 && (
            <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
              View Low Stock Items
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;