import { useGetVendorProductsQuery } from '../../store/apiSlice';

const VendorProducts = () => {
  const { data, error, isLoading } = useGetVendorProductsQuery({});

  if (isLoading) return <div className="text-center">Loading your products...</div>;
  if (error) return <div className="text-center text-red-500">Error loading products.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Products</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add New Product
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.imageUrl || 'https://placehold.co/600x400'} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
            <h2 className="text-lg font-semibold truncate">{product.name}</h2>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            {/* Add Edit/Delete buttons here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorProducts;