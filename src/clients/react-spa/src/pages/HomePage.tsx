// ---- File: src/pages/HomePage.tsx ----
import { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <section id="all-products">
        <ProductList />
      </section>

      {/* Luxury Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 rounded-2xl shadow-2xl shadow-slate-500/20 hover:shadow-emerald-500/30 transition-all duration-500 ease-out transform hover:scale-110 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 group"
          aria-label="Scroll to top"
        >
          {/* Main Content */}
          <div className="flex items-center justify-center relative">
            <svg 
              className={`w-7 h-7 transition-all duration-500 ${
                isHovered 
                  ? 'transform -translate-y-1 text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
          
          {/* Background Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
          
          {/* Progress Indicator (Optional) */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%` }}
            ></div>
          </div>

          {/* Tooltip */}
          <div className={`absolute -top-12 right-1/2 translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            Back to top
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>
        </button>
      )}
    </>
  );
};

export default HomePage;