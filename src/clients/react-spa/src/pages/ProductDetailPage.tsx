// ---- File: src/pages/ProductDetailPage.tsx ----
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { AppDispatch } from '../store/store';
import { addItemToCart } from '../store/cartSlice';
import { useGetProductByIdQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/formatting';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';

const ProductDetailPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, error, isLoading } = useGetProductByIdQuery(productId!, { skip: !productId });

  const handleAddToCart = () => {
    if (product) {
      const promise = dispatch(addItemToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.promise(promise, {
        loading: 'Adding to cart...',
        success: <b>Item added to cart!</b>,
        error: <b>Could not add item.</b>,
      });
    }
  };

  if (isLoading) return <p className="text-center">Loading product...</p>;
  if (error) return <p className="text-center text-red-500">Failed to fetch product.</p>;
  if (!product) return <p className="text-center">Product not found.</p>;

  return (
    <>
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg text-gray-700 mb-4">{product.description}</p>
            <p className="text-2xl font-semibold text-green-600 mb-6">{formatCurrency(product.price)}</p>
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW REVIEWS SECTION --- */}
      <div className="mt-12 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4">Reviews</h2>
          <ReviewList productId={product.id} />
          <ReviewForm productId={product.id} />
      </div>
    </>
  );
};

export default ProductDetailPage;