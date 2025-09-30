import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatting";
import { useState } from "react";
import {
  FaShoppingCart,
  FaHeart,
  FaEye,
  FaStar,
  FaTruck,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../store/cartSlice";
import type { AppDispatch, RootState } from "../store/store";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    const promise = dispatch(
      addItemToCart({ productId: product.id, quantity: 1 })
    ).unwrap();
    toast.promise(promise, {
      loading: "Adding to cart...",
      success: <b>Added to cart!</b>,
      error: <b>Failed to add item</b>,
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast.success(
      !isWishlisted ? "Added to wishlist!" : "Removed from wishlist"
    );
  };

  const averageRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 24;
  const isOutOfStock = (product.stock || 0) === 0;

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {product.isNew && (
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            NEW
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            FEATURED
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleAddToWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg transition-all duration-300 ${
          isWishlisted
            ? "bg-red-500 text-white"
            : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <FaHeart className={`text-sm ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-slate-700">
        <Link to={`/products/${product.id}`} className="block absolute inset-0">
          <img
            src={
              imageError || !product.imageUrl
                ? "https://placehold.co/600x600/png?text=Product+Image"
                : product.imageUrl
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>

        {/* Overlay Actions */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center space-x-2 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !token}
            className="bg-white text-gray-900 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <FaShoppingCart />
          </button>
          <Link
            to={`/products/${product.id}`}
            className="bg-white text-gray-900 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-900 hover:text-white delay-75"
            aria-label="View product details"
            onClick={(e) => e.stopPropagation()} // Prevent outer Link click
          >
            <FaEye />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-sm ${
                    star <= Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-slate-400 ml-1">({reviewCount})</span>
          </div>
          {!isOutOfStock && (
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <FaTruck className="mr-1" />
              <span>Free Shipping</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2 hover:text-green-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(product.price)}
            </span>
            {product.stock && product.stock > 0 && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {product.stock} in stock
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !token}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm font-medium shadow-md"
          >
            <FaShoppingCart />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Quick View on Mobile */}
      <div className="lg:hidden border-t border-gray-100 dark:border-slate-700">
        <Link
          to={`/products/${product.id}`}
          className="block text-center py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          Quick View
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;