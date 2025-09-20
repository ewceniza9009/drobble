import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

// This type matches the PaginatedResult<T> from our backend
interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8; // We can set the number of products per page

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Update the API call to include pagination parameters
        const response = await api.get<PaginatedProductsResponse>(
          `/products?page=${currentPage}&pageSize=${pageSize}`
        );
        setProducts(response.data.items || []);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Re-run this effect whenever the currentPage changes

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      {isLoading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}> {/* Add Link wrapper */}
              <div className="border rounded-lg p-4 shadow-lg bg-white h-full hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                <p className="text-gray-700 mb-4 h-24 overflow-hidden">{product.description}</p>
                <p className="text-lg font-semibold text-green-600">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-8 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
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