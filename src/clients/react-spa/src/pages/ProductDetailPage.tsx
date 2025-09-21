import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Import useDispatch
import type { AppDispatch } from '../store/store';
import { addItemToCart } from '../store/cartSlice'; // Import our action
import api from '../api/axios';
import { toast } from 'react-hot-toast'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  // Add other fields as needed
}

const ProductDetailPage = () => {
    const dispatch = useDispatch<AppDispatch>(); // Setup dispatch
    const { productId } = useParams<{ productId: string }>(); // Get the ID from the URL
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
    const fetchProduct = async () => {
        try {
        const response = await api.get<Product>(`/products/${productId}`);
        setProduct(response.data);
        } catch (err) {
        setError('Failed to fetch product.');
        console.error(err);
        } finally {
        setIsLoading(false);
        }
    };

    if (productId) {
        fetchProduct();
    }
  }, [productId]);

  if (isLoading) return <p className="text-center">Loading product...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center">Product not found.</p>;

 return (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-700 mb-4">{product.description}</p>
          <p className="text-2xl font-semibold text-green-600 mb-6">${product.price.toFixed(2)}</p>

          {/* Add this button */}
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add to Cart
          </button>
        </div>
    );
};

export default ProductDetailPage;