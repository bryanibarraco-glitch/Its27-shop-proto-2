import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 min-h-[60vh]">
      <h1 className="text-3xl font-serif font-bold mb-12">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
           {[1, 2].map(item => (
             <div key={item} className="flex gap-6 py-6 border-b border-gray-100 animate-fade-in-up">
                <Link to={`/product/${item}`} className="w-24 h-32 bg-gray-50 flex-shrink-0 overflow-hidden">
                  <img src={`https://picsum.photos/200/300?random=${item}`} alt="Item" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Link to={`/product/${item}`} className="font-serif text-lg hover:underline">Minimalist Band</Link>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Size: 7</p>
                      </div>
                      <p className="font-light">$85.00</p>
                   </div>
                   <button className="text-gray-400 hover:text-black transition-colors self-start flex items-center gap-2 text-[10px] uppercase tracking-widest">
                     <Trash2 className="w-4 h-4" /> Remove
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-8 h-fit lg:sticky lg:top-24">
           <h3 className="font-serif text-xl mb-6">Order Summary</h3>
           <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>$170.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-400">Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
                <span>Total</span>
                <span>$170.00</span>
              </div>
           </div>
           <button className="w-full bg-black text-white py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
             Checkout <ArrowRight className="w-4 h-4" />
           </button>
           <p className="text-xs text-center text-gray-400 mt-4">
             Secure checkout powered by Stripe
           </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;