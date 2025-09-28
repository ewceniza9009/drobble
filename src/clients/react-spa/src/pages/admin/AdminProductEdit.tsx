import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetProductByIdQuery, useCreateAdminProductMutation, useUpdateAdminProductMutation } from '../../store/apiSlice';
import { FaSave, FaArrowLeft, FaImage, FaTag, FaBox, FaDollarSign, FaWarehouse, FaFileAlt, FaLayerGroup } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatting';

const AdminProductEdit = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  // API hooks
  const { data: productData, isLoading: isLoadingProduct } = useGetProductByIdQuery(productId!, { skip: !isEditing });
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();

  const isLoading = isLoadingProduct || isCreating || isUpdating;

  // Populate form if we are editing
  useEffect(() => {
    if (productData) {
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setStock(productData.stock || 0);
      setCategoryId(productData.categoryId || '6745f5a2f372d8a156391d18');
      setImageUrl(productData.imageUrl);
      setIsFeatured(productData.isFeatured || false);
    }
    // Initialize placeholder for new products if product data hasn't loaded yet
    if (!isEditing && !productData) {
      setCategoryId('6745f5a2f372d8a156391d18');
      setSku(`SKU-${Date.now()}`);
    }
  }, [productData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (price <= 0 || stock < 0) {
      toast.error("Price must be positive and Stock cannot be negative.");
      return;
    }

    const productBody = {
      name: String(name),
      description: String(description),
      price: +price,
      stock: +stock,
      categoryId: String(categoryId),
      imageUrl: String(imageUrl),
      sku: String(sku),
      weight: +weight,
      isFeatured: Boolean(isFeatured)
    };

    try {
      if (isEditing) {
        await updateProduct({ id: String(productId), ...productBody }).unwrap();
        toast.success('Product updated successfully! 🎉');
      } else {
        await createProduct(productBody).unwrap();
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err: any) {
      const errorDetail = err?.data?.detail || err?.data?.title || 'Validation failed due to body structure.';
      toast.error(`Error: ${errorDetail}`);
      console.error("Backend Error Response (Body conflict likely):", err);
    }
  };

  if (isLoadingProduct && isEditing) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <FaBox className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FaBox className="text-3xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditing ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update product information and details' : 'Add a new product to your catalog'}
              </p>
            </div>
          </div>
          <Link 
            to="/admin/products" 
            className="mt-4 lg:mt-0 flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            <FaArrowLeft />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaFileAlt className="mr-2 text-gray-400" />
                Product Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaTag className="mr-2 text-green-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="Enter product name"
                        required 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        rows={4}
                        placeholder="Enter product description"
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaDollarSign className="mr-1 text-green-500" />
                        Price
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FaWarehouse className="mr-1 text-orange-500" />
                        Stock Quantity
                      </label>
                      <input 
                        type="number" 
                        value={stock} 
                        onChange={(e) => setStock(Number(e.target.value))} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Media & Images */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaImage className="mr-2 text-purple-500" />
                    Media & Images
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {imageUrl && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                        <img 
                          src={imageUrl} 
                          alt="Product preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaLayerGroup className="mr-2 text-green-500" />
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input 
                        type="text" 
                        value={sku} 
                        onChange={(e) => setSku(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="Product SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value))} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="6745f5a2f372d8a156391d18">Kitchenware</option>
                        <option value="6745f5a2f372d8a156391d19">Home Decor</option>
                        <option value="6745f5a2f372d8a156391d20">Electronics</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          checked={isFeatured} 
                          onChange={(e) => setIsFeatured(e.target.checked)} 
                          className="w-4 h-4 text-green-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Feature this product</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <Link 
                  to="/admin/products" 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-center"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <FaSave />
                  <span>{isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Product Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isEditing ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isEditing ? 'Existing Product' : 'New Product'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${
                    stock === 0 ? 'text-red-600' : stock < 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {stock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className={`font-medium ${isFeatured ? 'text-green-600' : 'text-gray-600'}`}>
                    {isFeatured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Use high-quality images for better conversion</li>
                <li>• Set realistic stock levels to avoid overselling</li>
                <li>• Feature popular products on the homepage</li>
                <li>• Use descriptive SKUs for inventory management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;