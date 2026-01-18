import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-60">
           <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Luxury Jewelry Background" 
            className="w-full h-full object-cover"
           />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <h2 className="text-white text-sm md:text-base uppercase tracking-[0.4em] font-light">
            New Collection 2024
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif font-bold tracking-tight">
            Timeless <br className="hidden md:block"/> Elegance
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Discover the beauty of handcrafted simplicity. Designed for the modern muse.
          </p>
          
          <div className="pt-8">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:scale-105 duration-300"
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Preview Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h3 className="text-3xl font-serif font-bold mb-4">Curated Favorites</h3>
             <div className="w-16 h-0.5 bg-black mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100">
                  <img 
                    src={`https://picsum.photos/600/800?random=${item}`} 
                    alt="Jewelry Item" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-serif">Silver Moon Pendant</h4>
                  <p className="text-gray-500 font-light">$129.00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Brand Values */}
      <section className="bg-offwhite py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Premium Quality</h4>
              <p className="text-gray-500 font-light">Ethically sourced materials and expert craftsmanship in every piece.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl italic">27</span>
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Unique Design</h4>
              <p className="text-gray-500 font-light">Distinctive styles that stand out from the crowd, made for you.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                 <ArrowRight className="w-6 h-6 -rotate-45" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Lifetime Warranty</h4>
              <p className="text-gray-500 font-light">We stand behind our jewelry forever. Experience worry-free luxury.</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4">
         <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
            <h2 className="text-3xl font-serif font-bold tracking-widest">ITS27</h2>
            <nav className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
              <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            </nav>
            <p className="text-xs text-gray-600 pt-8">© 2024 Its27 Jewelry. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
};

export default Home;