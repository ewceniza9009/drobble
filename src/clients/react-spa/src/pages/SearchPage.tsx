import { Link, useSearchParams } from "react-router-dom";
import { useSearchProductsQuery } from "../store/apiSlice";
import {
  FaSadTear,
  FaSearch,
  FaShoppingBag,
  FaStar,
  FaTruck,
} from "react-icons/fa";
import { formatCurrency } from "../utils/formatting";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const {
    data: results,
    error,
    isLoading,
  } = useSearchProductsQuery(query, {
    skip: !query,
  });

  // Mock related searches - in real app, this would come from API
  const relatedSearches = [
    "kitchen accessories",
    "cooking tools",
    "home essentials",
    "kitchenware",
    "cookware",
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-slate-800 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <FaSearch className="mx-auto text-4xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Search Error</h2>
          <p className="text-red-600 mb-4">
            We encountered an issue while searching. Please try again.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
                Search Results for:{" "}
                <span className="text-green-600 dark:text-green-400">"{query}"</span>
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                We searched high and low but couldn't find what you're looking
                for.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm">
              <FaSearch className="text-2xl text-gray-400" />
            </div>
          </div>
        </div>

        {/* No Results Content */}
        <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
          <FaSadTear className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">
            No Results Found
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find any products matching{" "}
            <strong>"{query}"</strong>. Try checking your spelling or using more
            general terms.
          </p>

          {/* Related Searches */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-4">
              Try These Related Searches:
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {relatedSearches.map((search, index) => (
                <Link
                  key={index}
                  to={`/search?q=${encodeURIComponent(search)}`}
                  className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {search}
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FaShoppingBag className="mr-2" />
              Browse All Products
            </Link>
            <Link
              to="/"
              className="inline-flex items-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
              Search Results for:{" "}
              <span className="text-green-600 dark:text-green-400">"{query}"</span>
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Found{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {results.length}
              </span>
              {results.length === 1 ? " product" : " products"} matching your
              search
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600">
              <span className="text-sm text-gray-600 dark:text-slate-300">Results: </span>
              <span className="font-semibold text-gray-800 dark:text-slate-100">
                {results.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {results.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden block"
          >
            {/* Product Image */}
            <div className="block relative overflow-hidden">
              <div className="relative aspect-square bg-gray-100 dark:bg-slate-700">
                <img
                  src={
                    product.imageUrl ||
                    "https://placehold.co/600x600/png?text=Product+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm ${
                        star <= 4
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 dark:text-slate-400">(24)</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <FaTruck className="mr-1" />
                  <span>Free Ship</span>
                </div>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;