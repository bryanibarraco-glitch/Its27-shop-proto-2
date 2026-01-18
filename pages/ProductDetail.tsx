import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Product Image Gallery */}
        <div className="space-y-4">
            <div className="bg-gray-50 aspect-[3/4] overflow-hidden relative">
                <img 
                    src={`https://picsum.photos/800/1000?random=${id}`} 
                    alt="Product Detail" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <img src={`https://picsum.photos/400/400?random=${Number(id)+100}`} className="aspect-square object-cover bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity" alt="Detail 1" />
                 <img src={`https://picsum.photos/400/400?random=${Number(id)+200}`} className="aspect-square object-cover bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity" alt="Detail 2" />
            </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center space-y-8 sticky top-24 self-start">
           <div>
             <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Minimalist Band No. {id}</h1>
             
             <div className="flex items-center gap-4 mb-6">
                <p className="text-2xl font-light">$85.00</p>
                <div className="flex items-center gap-0.5 text-black">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-gray-400 text-xs ml-2">(24 reviews)</span>
                </div>
             </div>
           </div>
           
           <p className="text-gray-600 leading-relaxed font-light text-lg">
             Handcrafted with precision, this piece embodies the essence of Its27. Made from 100% recycled sterling silver, it features a unique texture that catches the light beautifully. Perfect for everyday wear or special occasions.
           </p>

           <div className="pt-6 space-y-4">
                <button className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center justify-center gap-3">
                    Add to Cart <ArrowRight className="w-4 h-4" />
                </button>
           </div>
           
           <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Truck className="w-5 h-5 text-black" />
                  <span>Free shipping over $150</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>Lifetime Warranty</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;