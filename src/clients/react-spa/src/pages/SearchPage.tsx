import { Link, useSearchParams } from 'react-router-dom';
import { useSearchProductsQuery } from '../store/apiSlice';
import { FaSadTear } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatting';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, error, isLoading } = useSearchProductsQuery(query, {
    skip: !query,
  });

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center py-10">Searching...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 py-10">Error fetching search results.</p>;
    }
    if (!results || results.length === 0) {
      return (
        <div className="text-center bg-white p-12 rounded-xl shadow-lg border border-slate-200">
          <FaSadTear className="mx-auto text-5xl text-slate-400 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Results Found</h2>
          <p className="text-slate-500 mt-2">Sorry, we couldn't find any products matching your search for "{query}".</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map((product) => (
           <Link key={product.id} to={`/products/${product.id}`} className="group block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col border border-slate-200">
              <div className="overflow-hidden">
                 <img
                    src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Search Results for: <span className="text-blue-600">"{query}"</span>
      </h1>
      {renderContent()}
    </div>
  );
};

export default SearchPage;