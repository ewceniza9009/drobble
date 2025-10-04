// ---- File: src/components/FeaturedProducts.tsx ----
import { useGetFeaturedProductsQuery } from "../store/apiSlice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/formatting";
import Tilt from "react-parallax-tilt";
import type { Product } from "../store/apiSlice"; 

const FeaturedProducts = () => {
  const {
    data: products = [],
    isLoading,
    error,
  } = useGetFeaturedProductsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Auto-rotate the carousel (pauses on hover)
  useEffect(() => {
    if (products.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [products.length, isHovered]);

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

  // 2. ADD THIS HELPER FUNCTION TO GET THE CORRECT IMAGE
  const getProductImage = (product: Product) => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    return "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1000&q=80";
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-16 min-h-96">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-3 border-transparent border-t-amber-500 rounded-full animate-spin animation-delay-500"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-light">
            Loading curated collection...
          </p>
        </div>
      </div>
    );

  if (error || products.length === 0) return null;

  const currentProduct = products[currentIndex];
  const visibleThumbnails = getVisibleThumbnails();

  return (
    <section
      id="featured"
      className="py-8 bg-white dark:bg-slate-900 rounded-xl relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clean Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-800" />
      <div className="absolute top-10% left-5% w-64 h-64 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10% right-5% w-80 h-80 bg-slate-100/40 dark:bg-slate-800/20 rounded-full blur-3xl animate-float animation-delay-2000" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Refined Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600"></div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-widest uppercase">
              Featured Collection
            </span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600"></div>
          </div>
          <h2 className="text-4xl font-light text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
            Premium{" "}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400">
              Essentials
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            Discover our carefully selected range of premium products, designed
            for exceptional quality and timeless elegance.
          </p>
        </div>

        {/* Elegant Carousel Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-8 transform transition-all duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Featured Product */}
            <Tilt
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.05}
              glareColor="#ffffff"
              glarePosition="all"
              glareBorderRadius="20px"
              className="xl:col-span-2 cursor-pointer group"
              scale={1.01}
            >
              <div
                onClick={() => handleProductClick(currentProduct.id)}
                className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden group-hover:border-emerald-200/50 dark:group-hover:border-emerald-500/20 transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                  <div className="flex-1 w-full">
                    <div className="relative rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700/50 shadow-lg group-hover:shadow-xl transition-all duration-500">
                      <div className="relative w-full h-72 overflow-hidden rounded-xl">
                        <img
                          src={getProductImage(currentProduct)}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                          <span className="text-white bg-emerald-600 px-6 py-3 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 font-medium text-base shadow-lg">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-3xl font-light text-slate-800 dark:text-slate-100 mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-500 tracking-tight">
                        {currentProduct.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-4 line-clamp-4">
                        {currentProduct.description ||
                          "Experience unparalleled quality and sophisticated design with our premium selection. Crafted with attention to detail and built to exceed expectations."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-4xl font-light text-emerald-600 dark:text-emerald-400 mb-1 tracking-tight">
                            {formatCurrency(currentProduct.price)}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Inclusive of all taxes
                          </span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-700/30">
                          Ready to Ship
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-amber-400 text-lg">
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          (127 reviews)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(currentProduct.id);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300 group/btn"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Explore Premium Features
                        <span className="group-hover/btn:translate-x-1 transition-transform duration-300">
                          →
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Tilt>

            <div className="xl:col-span-1">
              <div className="h-full flex flex-col space-y-6">
                <div className="text-center xl:text-left">
                  <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
                    Curated Collection
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Explore more from our premium selection
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                  {visibleThumbnails.map((product, index) => {
                    const actualIndex =
                      (currentIndex + index) % products.length;
                    const isActive = currentIndex === actualIndex;
                    return (
                      <Tilt
                        key={`${product.id}-${actualIndex}`}
                        tiltMaxAngleX={3}
                        tiltMaxAngleY={3}
                        glareEnable={true}
                        glareMaxOpacity={0.05}
                        glareColor="#ffffff"
                        className={`cursor-pointer transition-all duration-300 rounded-xl p-4 border bg-white dark:bg-slate-800 group ${
                          isActive
                            ? "border-emerald-300 dark:border-emerald-500/40 shadow-md transform scale-105"
                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md hover:scale-105"
                        }`}
                      >
                        <div onClick={() => handleProductClick(product.id)}>
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-sm group-hover:shadow transition-all duration-300">
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400 ease-out"
                                />
                              </div>
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
                              )}
                            </div>
                            <div className="flex-1 w-full space-y-1">
                              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                {product.name}
                              </h4>
                              <div className="flex flex-col items-center">
                                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Tilt>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? products.length - 1 : prev - 1
                      )
                    }
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow group"
                  >
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-lg">
                      ←
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    {products.slice(0, 4).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentIndex === index
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-600 hover:bg-emerald-300 dark:hover:bg-emerald-700"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === products.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow group"
                  >
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-lg">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
