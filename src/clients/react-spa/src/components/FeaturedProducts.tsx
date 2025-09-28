// ---- File: src/components/FeaturedProducts.tsx ----
import { useGetFeaturedProductsQuery } from '../store/apiSlice';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = () => {
    const { data: products = [], isLoading, error } = useGetFeaturedProductsQuery();
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    // Auto-rotate the carousel
    useEffect(() => {
        if (products.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === products.length - 1 ? 0 : prevIndex + 1
            );
        }, 15000);

        return () => clearInterval(interval);
    }, [products.length]);

    const handleProductClick = (productId: string) => {
        navigate(`/products/${productId}`);
    };

    const getVisibleThumbnails = () => {
        if (products.length <= 4) return products;
        
        // Show current and next 3 thumbnails
        const thumbnails = [];
        for (let i = 0; i < 4; i++) {
            const index = (currentIndex + i) % products.length;
            thumbnails.push(products[index]);
        }
        return thumbnails;
    };

    if (isLoading) return <div className="text-center p-4">Loading featured products...</div>;
    
    if (error || products.length === 0) return null;

    const currentProduct = products[currentIndex];
    const visibleThumbnails = getVisibleThumbnails();

    return (
        <section className="py-4 bg-gray-100 rounded-xl">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured</h2>
                </div>

                {/* Custom Carousel Layout */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Large Featured Product - Left Side */}
                        <div 
                            className="lg:col-span-2 cursor-pointer group"
                            onClick={() => handleProductClick(currentProduct.id)}
                        >
                            <div className="bg-gray-50 rounded-lg p-6 border-2 border-blue-200">
                                <div className="text-center mb-4">
                                    <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                        ⭐ Featured Product
                                    </span>
                                </div>
                                
                                {/* Custom Large Product Display */}
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    {/* Product Image with Hover Effect */}
                                    <div className="flex-1 w-full">
                                        <div className="rounded-lg overflow-hidden bg-white p-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                                            <div className="relative w-full h-64 overflow-hidden rounded-lg">
                                                <img
                                                    src={currentProduct.imageUrl || 'https://placehold.co/600x400/png?text=Product+Image'}
                                                    alt={currentProduct.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {/* Overlay on hover */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                                                    <span className="text-white bg-blue-600 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-semibold">
                                                        View Details
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {currentProduct.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {currentProduct.description || 'Premium quality product with excellent features and durability.'}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-3xl font-bold text-blue-600">
                                                ${currentProduct.price}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                In Stock
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-yellow-400 mb-4">
                                            {'★'.repeat(5)}
                                            <span className="text-gray-600 text-sm">(127 reviews)</span>
                                        </div>
                                        
                                        <button 
                                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 shadow-md transform group-hover:scale-105 transition-transform duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add to cart logic here
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Grid - Right Side */}
                        <div className="lg:col-span-1">
                            <div className="h-full flex flex-col">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left pb-3">
                                    More Products
                                </h3>
                                
                                {/* Thumbnail Grid */}
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    {visibleThumbnails.map((product, index) => {
                                        const actualIndex = (currentIndex + index) % products.length;
                                        const isActive = index === 0;
                                        
                                        return (
                                            <div
                                                key={`${product.id}-${actualIndex}`}
                                                onClick={() => handleProductClick(product.id)}
                                                className={`
                                                    cursor-pointer transition-all duration-300 rounded-lg p-3 border-2 bg-white group
                                                    ${isActive 
                                                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm hover:scale-105'
                                                    }
                                                `}
                                            >
                                                {/* Miniature Product Card */}
                                                <div className="flex flex-col items-center text-center space-y-2">
                                                    {/* Product Image with Hover Effect */}
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={product.imageUrl || 'https://placehold.co/80x80/png?text=Product'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        {/* Active state indicator */}
                                                        {isActive && (
                                                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Product Info */}
                                                    <div className="flex-1 w-full">
                                                        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-sm font-bold text-blue-600">
                                                            ${product.price}
                                                        </p>
                                                        <div className="flex items-center justify-center space-x-1 mt-1">
                                                            <span className="text-xs text-yellow-400">★</span>
                                                            <span className="text-xs text-gray-500">4.8</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Navigation Dots */}
                                {products.length > 1 && (
                                    <div className="flex justify-center space-x-3 mt-6 pt-4">
                                        {products.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentIndex(index)}
                                                className={`
                                                    w-2 h-2 rounded-full transition-all hover:scale-125
                                                    ${currentIndex === index 
                                                        ? 'bg-blue-600 w-6' 
                                                        : 'bg-gray-300 hover:bg-gray-400'
                                                    }
                                                `}
                                                aria-label={`Go to product ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Navigation Arrows for mobile */}
                                {products.length > 1 && (
                                    <div className="flex justify-center space-x-4 mt-4 lg:hidden">
                                        <button
                                            onClick={() => setCurrentIndex(currentIndex === 0 ? products.length - 1 : currentIndex - 1)}
                                            className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors shadow-sm hover:scale-110"
                                        >
                                            ←
                                        </button>
                                        <span className="flex items-center text-sm text-gray-600">
                                            {currentIndex + 1} / {products.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentIndex(currentIndex === products.length - 1 ? 0 : currentIndex + 1)}
                                            className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors shadow-sm hover:scale-110"
                                        >
                                            →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {/* {products.length > 1 && (
                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                                className="bg-blue-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                                style={{ 
                                    width: `${((currentIndex + 1) / products.length) * 100}%` 
                                }}
                            />
                        </div>
                    </div>
                )} */}
            </div>
        </section>
    );
};

export default FeaturedProducts;