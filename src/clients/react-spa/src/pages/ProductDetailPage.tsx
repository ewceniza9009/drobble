import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { AppDispatch } from '../store/store';
import { addItemToCart } from '../store/cartSlice';
import { useGetProductByIdQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/formatting';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import { FaShoppingCart, FaHeart, FaStar, FaTruck, FaShieldAlt as FaShield, FaCheck } from 'react-icons/fa';
import RelatedProducts from '../components/RelatedProducts';
import { useState } from 'react';

const ProductDetailPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, error, isLoading } = useGetProductByIdQuery(productId!, { skip: !productId });
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      const promise = dispatch(addItemToCart({ productId: product.id, quantity })).unwrap();
      toast.promise(promise, {
        loading: 'Adding to cart...',
        success: <b>Item added to cart!</b>,
        error: <b>Could not add item.</b>,
      });
    }
  };

  const productImages = [
    product?.imageUrl || 'https://placehold.co/800x600/png?text=Product+Image',
    'https://placehold.co/800x600/png?text=Alternative+View',
    'https://placehold.co/800x600/png?text=Product+Details',
    'https://placehold.co/800x600/png?text=In+Use'
  ];

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-lg">Failed to load product. Please try again.</p>
        <a href="/products" className="text-blue-600 hover:underline mt-2 inline-block">Back to Products</a>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">Product not found.</p>
        <a href="/products" className="text-blue-600 hover:underline mt-2 inline-block">Browse Products</a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Product Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {/* Header */}
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                In Stock • {product.stock} available
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span>(127 reviews)</span>
                </div>
                <span>•</span>
                <span>SKU: {product.id.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-extrabold text-blue-600 mb-2">{formatCurrency(product.price)}</p>
              <p className="text-green-600 font-medium flex items-center">
                <FaCheck className="mr-2 text-sm" />
                Free shipping on all orders
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">Max: {product.stock}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg text-lg"
              >
                <FaShoppingCart className="mr-3" />
                Add to Cart • {formatCurrency(product.price * quantity)}
              </button>
              <button className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FaHeart className="text-xl" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FaTruck className="text-green-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">Delivery in 2-3 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaShield className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">2-Year Warranty</p>
                  <p className="text-sm text-gray-600">Full protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-12">
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaStar className="mr-3 text-yellow-400" />
            Customer Reviews
          </h2>
          <p className="text-gray-600 mt-1">See what other customers are saying about this product</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReviewList productId={product.id} />
            </div>
            <div>
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mb-12">
        <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">30-Day Returns</h3>
          <p className="text-blue-700 text-sm">Not satisfied? Return it within 30 days for a full refund.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-800 mb-2">Secure Payment</h3>
          <p className="text-green-700 text-sm">Your payment information is protected with encryption.</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-800 mb-2">Customer Support</h3>
          <p className="text-purple-700 text-sm">Need help? Contact our support team 24/7.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;