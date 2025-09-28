// ---- File: src/components/ProductList.tsx ----
import { useState, useCallback } from 'react';
import { useGetProductsQuery } from '../store/apiSlice';
import ProductCard from './ProductCard';

// Define TypeScript interface for the API response
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductsResponse {
  items: Product[];
  total: number;
}

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data, error, isLoading } = useGetProductsQuery<{
    data: ProductsResponse;
    error: any; // Replace with specific error type if known
    isLoading: boolean;
  }>({ page: currentPage, pageSize });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const products = data?.items || [];

  // Memoize pagination handlers
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: pageSize }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg font-medium">
          Failed to fetch products. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            aria-label="Next page"
            className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;