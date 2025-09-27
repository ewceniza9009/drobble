import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetProductByIdQuery, useCreateAdminProductMutation, useUpdateAdminProductMutation } from '../../store/apiSlice';
import { FaSave } from 'react-icons/fa';

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

  // API hooks
  const { data: productData, isLoading: isLoadingProduct } = useGetProductByIdQuery(productId!, { skip: !isEditing });
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();

  // Populate form if we are editing
  useEffect(() => {
    if (productData) {
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setStock(productData.stock || 0);
      setCategoryId(productData.categoryId || '6745f5a2f372d8a156391d18');
      setImageUrl(productData.imageUrl);
    }
    // Initialize placeholder for new products if product data hasn't loaded yet
    if (!isEditing && !productData) {
      setCategoryId('6745f5a2f372d8a156391d18');
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
      imageUrl: String(imageUrl)
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

  if (isLoadingProduct) return <div>Loading product details...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Create New Product'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" rows={4}></textarea>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
            <Link to="/admin/products" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                Cancel
            </Link>
            <button type="submit" disabled={isCreating || isUpdating} className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                <FaSave className="mr-2" />
                {isCreating || isUpdating ? 'Saving...' : 'Save Product'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEdit;