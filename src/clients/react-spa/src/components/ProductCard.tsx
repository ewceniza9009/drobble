// ---- File: src/components/ProductCard.tsx ----
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatting';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`View details for ${product.name}`}
    >
      <div className="overflow-hidden">
        <img
          src={
            imageError || !product.imageUrl
              ? 'https://placehold.co/600x400/png?text=No+Image'
              : product.imageUrl
          }
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h2
          className="text-base font-semibold text-slate-800 truncate"
          title={product.name}
        >
          {product.name}
        </h2>
        <div className="flex-grow" />
        <p className="text-lg font-bold text-blue-600 mt-2">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;