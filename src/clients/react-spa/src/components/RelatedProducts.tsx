// ---- File: src/components/RelatedProducts.tsx ----
import { useGetProductsByCategoryQuery } from '../store/apiSlice';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
    categoryId: string;
    currentProductId: string;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
    const { data: products, isLoading, error } = useGetProductsByCategoryQuery({
        categoryId,
        excludeId: currentProductId,
        limit: 4,
    });

    if (isLoading || error || !products || products.length === 0) {
        return null; // Don't render anything if there's an error or no related products
    }

    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;