// ---- File: src/clients/react-spa/src/pages/admin/AdminProductEdit.tsx ----
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
} from "../../store/apiSlice";
import {
  FaSave,
  FaArrowLeft,
  FaImage,
  FaTag,
  FaBox,
  FaDollarSign,
  FaWarehouse,
  FaLayerGroup,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { formatCurrency } from "../../utils/formatting";

const AdminProductEdit = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  // API hooks
  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError,
  } = useGetProductByIdQuery(productId!, { skip: !isEditing });
  const [createProduct, { isLoading: isCreating }] =
    useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateAdminProductMutation();
  const isLoading = isLoadingProduct || isCreating || isUpdating;

  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Populate form if we are editing
  useEffect(() => {
    if (isEditing && productData) {
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setStock(productData.stock || 0);
      setCategoryId(productData.categoryId || "");
      setIsFeatured(productData.isFeatured || false);
      setSku(productData.sku || "");
      setWeight(productData.weight || 0);
      setImageUrls(
        productData.imageUrls && productData.imageUrls.length > 0
          ? productData.imageUrls
          : [""]
      );
    } else if (!isEditing) {
      setCategoryId("");
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
    }
  }, [productData, isEditing]);

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const addImageUrlInput = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrlInput = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    } else {
      setImageUrls([""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
        toast.error("Please select a category.");
        return;
    }

    if (price <= 0 || stock < 0) {
      toast.error("Price must be positive and Stock cannot be negative.");
      return;
    }

    const productBody = {
      name,
      description,
      price: +price,
      stock: +stock,
      categoryId,
      sku,
      weight: +weight,
      isFeatured,
      imageUrls: imageUrls.map((url) => url.trim()).filter((url) => url !== ""),
    };

    try {
      if (isEditing) {
        await updateProduct({ id: String(productId), ...productBody }).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await createProduct(productBody).unwrap();
        toast.success("Product created successfully!");
      }
      navigate("/admin/products");
    } catch (err: any) {
      toast.error(`Error: ${err?.data?.title || "An unknown error occurred."}`);
      console.error("Backend Error:", err);
    }
  };

  if (isLoadingProduct && isEditing)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <FaBox className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-slate-400">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">
        Error loading product data.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
              <FaBox className="text-3xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                {isEditing ? "Edit Product" : "Create New Product"}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                {isEditing
                  ? `Editing: ${productData?.name}`
                  : "Add a new product to your catalog"}
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="mt-4 lg:mt-0 flex items-center space-x-2 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 font-medium"
          >
            <FaArrowLeft />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                    <FaTag className="mr-2 text-green-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                    <FaWarehouse className="mr-2 text-green-500" />
                    Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                        <FaDollarSign className="mr-1" />
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center">
                        <FaBox className="mr-1" />
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                    <FaImage className="mr-2 text-purple-500" />
                    Media & Images
                  </h3>
                  <div className="space-y-4">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
                      >
                        <img
                          src={
                            url ||
                            "https://placehold.co/100x100/png?text=Preview"
                          }
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md bg-slate-100 dark:bg-slate-700"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/100x100/png?text=Invalid";
                          }}
                        />
                        <input
                          type="text"
                          value={url}
                          onChange={(e) =>
                            handleImageUrlChange(index, e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                          placeholder={`Image URL #${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageUrlInput(index)}
                          className="p-3 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageUrlInput}
                      className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                    >
                      <FaPlus /> Add Another Image
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-200 mb-4 flex items-center">
                    <FaLayerGroup className="mr-2 text-green-500" />
                    Organization & Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                        placeholder="Product SKU"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            disabled={isLoadingCategories}
                        >
                            <option value="">{isLoadingCategories ? 'Loading...' : 'Select a Category'}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Feature this product
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
                <Link
                  to="/admin/products"
                  className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <FaSave />
                  <span>
                    {isLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Product"
                      : "Create Product"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    Price:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-slate-200">
                    {formatCurrency(price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    Stock:
                  </span>
                  <span
                    className={`font-medium ${
                      stock <= 0
                        ? "text-red-600 dark:text-red-400"
                        : stock < 10
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {stock} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    Featured:
                  </span>
                  <span
                    className={`font-medium ${
                      isFeatured
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-slate-400"
                    }`}
                  >
                    {isFeatured ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li>• Use high-quality images for better conversion.</li>
                <li>• Set realistic stock levels to avoid overselling.</li>
                <li>• Feature popular products on the homepage.</li>
                <li>• Use descriptive SKUs for inventory management.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;
