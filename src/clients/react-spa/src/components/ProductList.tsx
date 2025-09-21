import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/apiSlice';

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data, error, isLoading } = useGetProductsQuery({ page: currentPage, pageSize });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const products = data?.items || [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading) return <p className="text-center">Loading products...</p>;
  if (error) return <p className="text-center text-red-500">Failed to fetch products.</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <img
                src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{product.description.substring(0, 100)}...</p>
                <p className="text-xl font-bold text-green-600 mt-4">${product.price.toFixed(2)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center mt-8 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;