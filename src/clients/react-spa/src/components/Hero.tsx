// ---- File: src/components/Hero.tsx ----
const Hero = () => {
    return (
        <div className="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 text-white text-center py-20 px-6 rounded-3xl shadow-2xl overflow-hidden mb-8 group hover:shadow-3xl transition-all duration-700 ease-out">
            {/* Enhanced Background Image with Parallax Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-20 group-hover:scale-105 transition-all duration-1000 ease-out"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')" }}
            ></div>

            {/* Sophisticated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-slate-900/20"></div>
            
            {/* Elegant Animated Background Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full mix-blend-screen filter blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-slate-400/5 rounded-full mix-blend-screen filter blur-3xl animate-float-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/3 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Refined Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight leading-tight animate-fade-in">
                    <span className="bg-gradient-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent">
                        Drobble
                    </span>
                    <br />
                    <span className="text-white font-light">Where </span>
                    <span className="font-serif italic text-amber-200">Elegance</span>
                    <span className="text-white font-light"> Meets</span>
                    <br />
                    <span className="font-serif italic text-emerald-300">Essentials</span>
                </h1>

                {/* Sophisticated Subtitle */}
                <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-300 mb-12 leading-relaxed font-light animate-fade-in-up">
                    Discover curated excellence with our hand-selected collection of premium products, 
                    designed for those who appreciate the finer details in life.
                </p>

                {/* Luxury CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
                    <a
                        href="#all-products"
                        className="group/btn relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium py-4 px-12 rounded-full shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-500 ease-out transform hover:scale-105 hover:translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 overflow-hidden"
                    >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                        
                        <span className="flex items-center gap-3 relative z-10">
                            Begin Your Journey
                            <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </a>

                    {/* Secondary CTA */}
                    <a
                        href="#featured"
                        className="group/btn2 relative border border-slate-600 text-slate-300 font-medium py-4 px-10 rounded-full hover:border-emerald-400/50 hover:text-emerald-300 transition-all duration-500 ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <span className="flex items-center gap-3">
                            View Featured
                            <svg className="w-4 h-4 group-hover/btn2:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-slate-700/50 animate-fade-in-up animation-delay-500">
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-amber-400">★</span>
                            ))}
                        </div>
                        <span>Rated Excellent</span>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-slate-700/50"></div>
                    <div className="text-slate-400 text-sm">
                        <span className="text-emerald-400 font-medium">2,000+</span> Premium Products
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-slate-700/50"></div>
                    <div className="text-slate-400 text-sm">
                        <span className="text-emerald-400 font-medium">24/7</span> Concierge Support
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-slate-500/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-slate-400/50 rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Hero;