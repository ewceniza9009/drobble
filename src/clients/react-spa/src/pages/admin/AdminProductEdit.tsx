// ---- File: src/pages/admin/AdminProductEdit.tsx ----

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetProductByIdQuery, useCreateAdminProductMutation, useUpdateAdminProductMutation } from '../../store/apiSlice';

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
    
    // Ensure price and stock are positive for validation
    if (price <= 0 || stock < 0) {
        toast.error("Price must be positive and Stock cannot be negative.");
        return;
    }
    
    // FIX 1: Create the explicit payload body, ensuring correct JSON types.
    // All properties sent to the C# [FromBody] must be explicitly cast 
    // to match the expected primitive type (string/number).
    const productBody = { 
      name: String(name), 
      description: String(description), 
      price: +price, // Ensure numerical JSON type
      stock: +stock, // Ensure numerical JSON type
      categoryId: String(categoryId), 
      imageUrl: String(imageUrl) 
    };

    try {
      if (isEditing) {
        
        // FIX 2: Create the final update payload including the ID for the RTK argument.
        // The C# controller will correctly use the route ID, but the payload 
        // MUST contain the ID property to pass model validation.
        const updatePayload = {
            id: String(productId), // <-- ID IS ADDED HERE AS STRING
            ...productBody
        };
        
        console.log("PUT Payload:", updatePayload); 
        
         await updateProduct({ id: String(productId), ...productBody }).unwrap();
        toast.success('Product updated successfully! 🎉');
      } else {
        await createProduct(productBody).unwrap(); // Use productBody for creation
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err: any) {
      // Improved error logging for backend validation details
      const errorDetail = err?.data?.detail || err?.data?.title || 'Validation failed due to body structure.';
      toast.error(`Error: ${errorDetail}`);
      console.error("Backend Error Response (Body conflict likely):", err);
    }
  };

  if (isLoadingProduct) return <div>Loading product details...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Create New Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Render categoryId hidden field only when editing, to confirm its value */}
        {isEditing && (
            <input type="hidden" value={categoryId} />
        )}
        
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" rows={4}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        
        <button type="submit" disabled={isCreating || isUpdating} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
          {isCreating || isUpdating ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductEdit;