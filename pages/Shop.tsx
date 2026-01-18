import React from 'react';
import { Link } from 'react-router-dom';

const Shop: React.FC = () => {
  return (
    <div className="min-h-screen pt-12 px-4 max-w-7xl mx-auto">
      <div className="text-center py-20 bg-gray-50 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shop Collection</h1>
        <p className="text-gray-500 font-light">Find your perfect piece.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="space-y-3 group cursor-pointer">
               <Link to={`/product/${item}`} className="block aspect-[4/5] bg-gray-100 relative overflow-hidden">
                 <img 
                    src={`https://picsum.photos/400/500?random=${item + 10}`} 
                    alt="Product" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-white text-black py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        View Details
                    </button>
                 </div>
               </Link>
               <div className="text-center">
                  <Link to={`/product/${item}`} className="block text-sm font-bold uppercase tracking-wide hover:underline">Minimalist Band</Link>
                  <p className="text-gray-500 text-sm mt-1">$85.00</p>
               </div>
            </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-20 mb-12">
         <button className="border-b border-black pb-1 uppercase text-sm tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors">
            Load More Products
         </button>
      </div>
    </div>
  );
};

export default Shop;