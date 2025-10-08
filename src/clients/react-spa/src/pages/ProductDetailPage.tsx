// ---- File: src/clients/react-spa/src/pages/ProductDetailPage.tsx ----
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "../store/store";
import { addItemToCart } from "../store/cartSlice";
import { useGetProductByIdQuery } from "../store/apiSlice";
import { formatCurrency } from "../utils/formatting";
import ReviewList from "../components/reviews/ReviewList";
import ReviewForm from "../components/reviews/ReviewForm";
import {
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaTruck,
  FaShieldAlt as FaShield,
  FaCheck,
  FaArrowLeft,
  FaShare,
} from "react-icons/fa";
import RelatedProducts from "../components/RelatedProducts";
import { useState, useEffect } from "react";

const ProductDetailPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { productId } = useParams<{ productId: string }>();
  const {
    data: product,
    error,
    isLoading,
  } = useGetProductByIdQuery(productId!, { skip: !productId });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setSelectedImageIndex(0);
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const promise = dispatch(
        addItemToCart({ productId: product.id, quantity })
      ).unwrap();
      toast.promise(promise, {
        loading: "Adding to cart...",
        success: <b>Item added to cart!</b>,
        error: <b>Could not add item.</b>,
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? "Added to favorites" : "Removed from favorites");
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  // Create image array with fallback
  const productImages =
    product?.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : ["https://placehold.co/800x600/png?text=Product+Image"];

  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mx-auto"></div>
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-slate-800 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 text-xl font-semibold mb-4">
            Failed to load product
          </p>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            Please check your connection and try again.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Product Not Found
          </h3>
          <p className="text-gray-600 dark:text-slate-400 text-lg mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-300 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Products
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-12 transition-all duration-300 hover:shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 aspect-square flex items-center justify-center group relative">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                    isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                  } shadow-lg hover:shadow-xl hover:scale-110`}
                >
                  <FaHeart className={isFavorite ? "fill-current" : ""} />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <FaShare />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                    selectedImageIndex === index
                      ? "border-green-500 shadow-lg"
                      : "border-gray-200 dark:border-slate-700 hover:border-green-300"
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
          <div className="flex flex-col justify-center space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                  <FaCheck className="mr-2 text-xs" />
                  In Stock • {product.stock} available
                </span>
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  SKU: {product.sku!}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 text-gray-600 dark:text-slate-400">
                <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-400 text-lg" />
                  <span className="font-bold text-gray-900 dark:text-slate-100">4.8</span>
                  <span>(127 reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-5xl font-black text-green-600 dark:text-green-400 mb-3">
                {formatCurrency(product.price)}
              </p>
              <p className="text-green-600 dark:text-green-400 font-semibold flex items-center text-lg">
                <FaCheck className="mr-3 text-base" />
                Free shipping on all orders
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-4 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="px-8 py-4 font-bold text-gray-900 dark:text-slate-100 text-xl min-w-20 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-6 py-4 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 text-xl font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-lg text-gray-500 dark:text-slate-400 font-medium">
                  Max: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 text-xl"
              >
                <FaShoppingCart className="mr-4 text-2xl" />
                Add to Cart • {formatCurrency(product.price * quantity)}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FaTruck className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                    Free Shipping
                  </p>
                  <p className="text-gray-600 dark:text-slate-400">
                    Delivery in 2-3 days
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FaShield className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                    2-Year Warranty
                  </p>
                  <p className="text-gray-600 dark:text-slate-400">
                    Full protection included
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-12">
        <div className="p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;