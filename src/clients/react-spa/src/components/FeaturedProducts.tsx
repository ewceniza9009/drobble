// ---- File: src/components/FeaturedProducts.tsx ----
import { useGetFeaturedProductsQuery } from '../store/apiSlice';
import ProductCard from './ProductCard';
// 1. Import the Slider component
import Slider from 'react-slick';
// NOTE: Make sure you've installed react-slick and slick-carousel,
// and imported their CSS in your main application file!

const FeaturedProducts = () => {
    const { data: products = [], isLoading, error } = useGetFeaturedProductsQuery();

    // 2. Define the carousel settings
    const settings = {
        dots: true, // Show navigation dots
        infinite: true, // Loop the carousel
        speed: 500,
        slidesToShow: 4, // Default to 4 slides on large screens
        slidesToScroll: 1,
        autoplay: true, // Optional: auto-advance slides
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3, // Show 3 slides on medium screens
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2, // Show 2 slides on smaller screens
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1, // Show 1 slide on extra small screens
                }
            }
        ]
    };

    if (isLoading) return <div className="text-center p-4">Loading featured products...</div>;
    
    // Only show the section if we have products and no error
    if (error || products.length === 0) return null;

    return (
        <section className="py-12 bg-gray-200 rounded-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 3. Replace the grid with the Slider component */}
                {/* NOTE: You might need to add global styles to adjust slick-carousel's navigation arrows/dots */}
                <div className="carousel-container px-4"> 
                    <Slider {...settings}>
                        {products.map((product) => (
                            // The ProductCard is placed directly inside the map.
                            // slick-carousel handles the wrapping for the slides.
                            <div key={product.id} className="px-2"> {/* Added padding for spacing between slides */}
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>

            </div>
        </section>
    );
};

export default FeaturedProducts;