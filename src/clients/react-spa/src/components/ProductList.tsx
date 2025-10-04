// ---- File: src/components/ProductList.tsx ----

import { useState, useCallback, useEffect } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/apiSlice';
import ProductCard from './ProductCard';
import type { Product } from '../store/apiSlice';
import { FaFilter, FaSort, FaExclamationTriangle } from 'react-icons/fa';

// Skeleton loader for a better loading experience
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="w-full aspect-square bg-gray-200 dark:bg-slate-700" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3" />
      </div>
    </div>
  </div>
);

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string>('newest');
  const pageSize = 8;

  const { data, error, isLoading, isFetching } = useGetProductsQuery({
    page: currentPage,
    pageSize,
    categoryId: selectedCategory,
    sortBy: sortBy,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const products = data?.items || [];

  // Reset page to 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
        <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-300 text-lg font-medium">
          Failed to fetch products. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8" id="all-products">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Our Collection
        </h2>
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-500 dark:text-slate-400" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              disabled={isLoadingCategories}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              aria-label="Filter by category"
            >
              <option value="">{isLoadingCategories ? "Loading..." : "All Categories"}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Sort By Filter */}
          <div className="flex items-center gap-2">
            <FaSort className="text-slate-500 dark:text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              aria-label="Sort by"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: pageSize }).map((_, index) => <SkeletonCard key={index} />)
        ) : products.length > 0 ? (
          products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-600 dark:text-slate-400 text-lg">No products found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isFetching}
            aria-label="Previous page"
            className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0 || isFetching}
            aria-label="Next page"
            className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;