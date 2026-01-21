import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Tu Carrito está Vacío</h1>
        <p className="text-gray-500 mb-8">Parece que aún no has encontrado tu pieza perfecta.</p>
        <Link to="/shop" className="bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
          Ir a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 min-h-[60vh]">
      <h1 className="text-3xl font-serif font-bold mb-12">Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
           {cartItems.map((item, index) => {
             const displayImage = item.images && item.images.length > 0 
                ? item.images[0] 
                : `https://picsum.photos/200/300?random=${item.imageId}`;

             return (
               <div key={`${item.id}-${index}`} className="flex gap-6 py-6 border-b border-gray-100 animate-fade-in-up">
                  <Link to={`/product/${item.id}`} className="w-24 h-32 bg-gray-50 flex-shrink-0 overflow-hidden">
                    <img src={displayImage} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Link to={`/product/${item.id}`} className="font-serif text-lg hover:underline">{item.name}</Link>
                          {item.quantity > 1 && (
                               <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                          )}
                        </div>
                        <p className="font-light">
                          {(item.price * item.quantity).toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                        </p>
                     </div>
                     <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-black transition-colors self-start flex items-center gap-2 text-[10px] uppercase tracking-widest"
                     >
                       <Trash2 className="w-4 h-4" /> Eliminar
                     </button>
                  </div>
               </div>
             );
           })}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-8 h-fit lg:sticky lg:top-24">
           <h3 className="font-serif text-xl mb-6">Resumen del Pedido</h3>
           <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{cartTotal.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className="text-gray-400">Calculado al finalizar</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
                <span>Total</span>
                <span>{cartTotal.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}</span>
              </div>
           </div>
           <Link to="/checkout" className="w-full bg-black text-white py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
             Finalizar Compra <ArrowRight className="w-4 h-4" />
           </Link>
           <p className="text-xs text-center text-gray-400 mt-4">
             Pago Seguro
           </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;