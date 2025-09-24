// ---- File: src/clients/react-spa/src/pages/SearchPage.tsx ----
import { Link, useSearchParams } from 'react-router-dom';
import { useSearchProductsQuery } from '../store/apiSlice';
import { FaSadTear } from 'react-icons/fa';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, error, isLoading } = useSearchProductsQuery(query, {
    skip: !query, // Don't run the query if the search term is empty
  });

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">Searching...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">Error fetching search results.</p>;
    }
    if (!results || results.length === 0) {
      return (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <FaSadTear className="mx-auto text-5xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Results Found</h2>
            <p className="text-gray-500 mt-2">Sorry, we couldn't find any products matching your search.</p>
        </div>
      );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="group">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <img
                        src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col flex-grow">
                        <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
                        <p className="text-xl font-bold text-green-600 mt-4">${product.price.toFixed(2)}</p>
                    </div>
                    </div>
                </Link>
            ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-blue-600">"{query}"</span>
      </h1>
      {renderContent()}
    </div>
  );
};

export default SearchPage;