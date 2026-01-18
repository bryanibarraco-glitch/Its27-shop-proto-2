import React from 'react';

const Shop: React.FC = () => {
  return (
    <div className="min-h-screen pt-12 px-4 max-w-7xl mx-auto">
      <div className="text-center py-20 bg-gray-50 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shop Collection</h1>
        <p className="text-gray-500">Find your perfect piece.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="space-y-3">
               <div className="aspect-square bg-gray-100 relative group overflow-hidden">
                 <img 
                    src={`https://picsum.photos/400/400?random=${item + 10}`} 
                    alt="Product" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
               </div>
               <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide">Minimalist Band</h3>
                  <p className="text-gray-500 text-sm">$85.00</p>
               </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;