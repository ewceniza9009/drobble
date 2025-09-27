import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { AppDispatch } from '../store/store';
import { addItemToCart } from '../store/cartSlice';
import { useGetProductByIdQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/formatting';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import { FaShoppingCart } from 'react-icons/fa';

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

  if (isLoading) return <p className="text-center py-10">Loading product...</p>;
  if (error) return <p className="text-center text-red-500 py-10">Failed to fetch product.</p>;
  if (!product) return <p className="text-center py-10">Product not found.</p>;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden">
            <img
              src={product.imageUrl || 'https://placehold.co/600x400/png?text=No+Image'}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3">{product.name}</h1>
            <p className="text-slate-600 mb-5 leading-relaxed">{product.description}</p>
            <p className="text-4xl font-extrabold text-blue-600 mb-6">{formatCurrency(product.price)}</p>
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-md text-lg"
            >
              <FaShoppingCart className="mr-3" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 border-b border-slate-200 pb-4 text-slate-800">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <ReviewList productId={product.id} />
            </div>
            <div>
                <ReviewForm productId={product.id} />
            </div>
          </div>
      </div>
    </>
  );
};

export default ProductDetailPage;