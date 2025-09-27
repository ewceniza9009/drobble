import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/formatting';

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

  if (isLoading) return <p className="text-center py-10">Loading products...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Failed to fetch products.</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="group block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col border border-slate-200">
              <div className="overflow-hidden">
                 <img
                    src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-base font-semibold text-slate-800 truncate">{product.name}</h2>
                <div className="flex-grow" />
                <p className="text-lg font-bold text-blue-600 mt-2">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center mt-10 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;