import { useGetFeaturedProductsQuery } from '../store/apiSlice';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatting';
import Tilt from 'react-parallax-tilt';

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
        }, 10000);

        return () => clearInterval(interval);
    }, [products.length]);

    const handleProductClick = (productId: string) => {
        navigate(`/products/${productId}`);
    };

    const getVisibleThumbnails = () => {
        if (products.length <= 4) return products;
        
        const thumbnails = [];
        for (let i = 0; i < 4; i++) {
            const index = (currentIndex + i) % products.length;
            thumbnails.push(products[index]);
        }
        return thumbnails;
    };

    if (isLoading) return <div className="text-center p-4 animate-pulse">Loading featured products...</div>;
    
    if (error || products.length === 0) return null;

    const currentProduct = products[currentIndex];
    const visibleThumbnails = getVisibleThumbnails();

    return (
        <section className="py-8 bg-gray-100 rounded-xl relative overflow-hidden">
            {/* Subtle Parallax Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 transform -skew-y-3 origin-top-left animate-subtle-parallax" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-3 animate-slide-in">
                        Featured
                    </h2>
                </div>

                {/* Custom Carousel Layout */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Large Featured Product - Left Side */}
                        <Tilt
                            tiltMaxAngleX={15}
                            tiltMaxAngleY={15}
                            glareEnable={true}
                            glareMaxOpacity={0.2}
                            className="lg:col-span-2 cursor-pointer group"
                        >
                            <div 
                                onClick={() => handleProductClick(currentProduct.id)}
                                className="bg-gray-50 rounded-xl p-12 border-2 border-blue-200 relative overflow-hidden"
                                key={`featured-${currentProduct.id}`}
                            >
                                <div className="text-center mb-6">
                                    <span className="inline-block bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-4 animate-bounce-in">
                                        ⭐ Featured Product
                                    </span>
                                </div>
                                
                                {/* Custom Large Product Display */}
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Product Image with Enhanced Hover Effect */}
                                    <div className="flex-1 w-full">
                                        <div className="rounded-xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                            <div className="relative w-full h-72 overflow-hidden rounded-xl">
                                                <img
                                                    src={currentProduct.imageUrl || 'https://placehold.co/600x400/png?text=Product+Image'}
                                                    alt={currentProduct.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out animate-fade-in"
                                                />
                                                {/* Enhanced Overlay on hover */}
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500 flex items-center justify-center">
                                                    <span className="text-white bg-green-600 px-6 py-3 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 font-semibold text-lg">
                                                        View Details
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Product Info with Animation */}
                                    <div className="flex-1 animate-slide-up">
                                        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                                            {currentProduct.name}
                                        </h3>
                                        <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                                            {currentProduct.description || 'Premium quality product with excellent features and durability.'}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-4xl font-bold text-green-600 animate-pulse-price">
                                                {formatCurrency(currentProduct.price)}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold animate-bounce-in">
                                                In Stock
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 text-yellow-400 mb-4">
                                            {'★'.repeat(5)}
                                            <span className="text-gray-600 text-sm">(127 reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tilt>

                        {/* Thumbnail Grid - Right Side */}
                        <div className="lg:col-span-1">
                            <div className="h-full flex flex-col">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center lg:text-left pb-4 animate-slide-in">
                                    More Products
                                </h3>
                                
                                {/* Thumbnail Grid with Enhanced Effects */}
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    {visibleThumbnails.map((product, index) => {
                                        const actualIndex = (currentIndex + index) % products.length;
                                        const isActive = index === 0;
                                        
                                        return (
                                            <Tilt
                                                key={`${product.id}-${actualIndex}`}
                                                tiltMaxAngleX={10}
                                                tiltMaxAngleY={10}
                                                glareEnable={true}
                                                glareMaxOpacity={0.15}
                                                className={`
                                                    cursor-pointer transition-all duration-500 rounded-xl p-4 border-2 bg-white group
                                                    ${isActive 
                                                        ? 'border-blue-200 bg-green-50 shadow-lg transform scale-105' 
                                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105'
                                                    }
                                                `}
                                            >
                                                <div onClick={() => handleProductClick(product.id)}>
                                                    {/* Miniature Product Card */}
                                                    <div className="flex flex-col items-center text-center space-y-3">
                                                        {/* Product Image with Hover Effect */}
                                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={product.imageUrl || 'https://placehold.co/80x80/png?text=Product'}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400 ease-out"
                                                            />
                                                            {/* Active state indicator */}
                                                            {isActive && (
                                                                <div className="absolute top-0 right-0 w-4 h-4 bg-green-600 rounded-full transform translate-x-1.5 -translate-y-1.5 animate-pulse"></div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Product Info */}
                                                        <div className="flex-1 w-full">
                                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight group-hover:text-green-600 transition-colors duration-300">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-base font-bold text-green-600">
                                                                {formatCurrency(product.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tilt>
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
                                                    w-3 h-3 rounded-full transition-all duration-300 hover:scale-150
                                                    ${currentIndex === index 
                                                        ? 'bg-green-600 w-8 transform scale-110' 
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
                                    <div className="flex justify-center space-x-6 mt-6 lg:hidden">
                                        <button
                                            onClick={() => setCurrentIndex(currentIndex === 0 ? products.length - 1 : currentIndex - 1)}
                                            className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300 shadow-md hover:scale-110 transform"
                                        >
                                            ←
                                        </button>
                                        <span className="flex items-center text-sm text-gray-600 font-medium">
                                            {currentIndex + 1} / {products.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentIndex(currentIndex === products.length - 1 ? 0 : currentIndex + 1)}
                                            className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300 shadow-md hover:scale-110 transform"
                                        >
                                            →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar with Animation */}
                {products.length > 1 && (
                    <div className="mt-8 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-green-600 h-1.5 rounded-full transition-all duration-[10000ms] ease-linear animate-progress"
                                style={{ 
                                    width: `${((currentIndex + 1) / products.length) * 100}%` 
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;