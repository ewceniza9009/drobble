// ---- File: src/components/Hero.tsx ----
const Hero = () => {
    return (
        <div className="relative bg-gradient-to-br from-green-800 to-blue-900 text-white text-center py-8 px-4 rounded-3xl shadow-2xl overflow-hidden mb-8 group">
            {/* Background Image with a softer opacity and a blend mode */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-25 transition-opacity duration-500 ease-in-out"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2072&auto=format&fit=crop')" }}
            ></div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            
            {/* Optional: Add a subtle decorative shape/blob (using a pseudo-element or another div) */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-green-500 opacity-10 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-green-500 opacity-10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>


            <div className="relative z-10 max-w-4xl mx-auto">
                <p className="text-green-200 text-sm md:text-base font-semibold uppercase tracking-widest mb-4 animate-fade-in-down">
                    Explore What's New
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tighter leading-tight animate-fade-in">
                    <span className="text-green-400">Drobble</span>, Your Journey to <br/> <span className="text-yellow-300">Exceptional Finds</span> Starts Here
                </h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-green-100 mb-10 animate-fade-in-up">
                    Discover hand-picked products and experience unparalleled customer service.
                </p>
                <a
                    href="#all-products"
                    className="inline-block bg-white text-green-700 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 animate-bounce-once"
                >
                    Start Shopping Now
                </a>
            </div>
            {/* Added a subtle shadow and scale on hover for the entire hero section */}
        </div>
    );
};

export default Hero;