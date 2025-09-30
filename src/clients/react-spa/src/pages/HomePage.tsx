// ---- File: src/pages/HomePage.tsx ----
import ProductList from '../components/ProductList';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  return (
    <>
        <Hero />
        <FeaturedProducts />
        <section id="all-products">
            <ProductList />
        </section>
    </>
  );
};

export default HomePage;