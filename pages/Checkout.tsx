import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Truck, CheckCircle, Gift, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

const PROVINCES = [
  'San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'sinpe'>('credit_card');
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping Logic: Free if > 5 items, else ₡2,000
  const isFreeShipping = cartCount > 5;
  const shippingCost = isFreeShipping ? 0 : 2000;
  const itemsNeededForFreeShipping = 6 - cartCount;
  
  const total = cartTotal + shippingCost;

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      phone: '',
      province: '',
      canton: '',
      district: '',
      address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
          // 1. Insert Order
          const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .insert([
                  {
                      customer_name: formData.name,
                      customer_phone: formData.phone,
                      province: formData.province,
                      canton: formData.canton,
                      district: formData.district,
                      address: formData.address,
                      total_amount: total,
                      payment_method: paymentMethod
                  }
              ])
              .select()
              .single();

          if (orderError) throw orderError;

          // 2. Insert Order Items
          if (orderData) {
              const orderItems = cartItems.map(item => ({
                  order_id: orderData.id,
                  product_id: item.id,
                  quantity: item.quantity,
                  price_at_purchase: item.price
              }));

              const { error: itemsError } = await supabase
                  .from('order_items')
                  .insert(orderItems);
              
              if (itemsError) throw itemsError;
          }

          // 3. Success & Clean up
          clearCart();
          alert(`Order #${orderData.id} placed successfully! Check your email/WhatsApp.`);
          navigate('/');

      } catch (error) {
          console.error("Error placing order:", error);
          alert("There was an error placing your order. Please try again.");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
        {/* Back link */}
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        {/* Marketing Banner */}
        {!isFreeShipping && (
             <div className="bg-gray-900 text-white p-4 mb-8 flex items-center justify-between gap-4 animate-fade-in shadow-lg">
                <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-gray-300" />
                    <p className="text-sm font-medium">
                        Add <span className="font-bold text-white underline decoration-1 underline-offset-4">{itemsNeededForFreeShipping} more item{itemsNeededForFreeShipping > 1 ? 's' : ''}</span> to unlock <span className="font-bold">FREE SHIPPING</span>!
                    </p>
                </div>
                <Link to="/shop" className="text-xs uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap">
                    Continue Shopping
                </Link>
             </div>
        )}
        
        {isFreeShipping && (
            <div className="bg-green-50 text-green-800 border border-green-100 p-4 mb-8 flex items-center gap-3 animate-fade-in">
                <Gift className="w-5 h-5" />
                <p className="text-sm font-medium">Congratulations! You've unlocked <span className="font-bold">FREE SHIPPING</span>.</p>
            </div>
        )}

        <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Shipping Section */}
                <form id="checkout-form" onSubmit={handlePlaceOrder}>
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <Truck className="w-5 h-5" />
                            <h2 className="text-xl font-serif font-bold">Shipping Information</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-4 mb-6 rounded-sm border border-gray-100 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Shipping handled securely by <span className="font-bold text-black">Correos de Costa Rica</span>.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                <input name="name" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="Juan Pérez" required />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                <input name="phone" onChange={handleInputChange} type="tel" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="8888-8888" required />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Province (Provincia)</label>
                                <select name="province" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors cursor-pointer" required>
                                    <option value="">Select Province</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Canton</label>
                                <input name="canton" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="Escazú" required />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">District (Distrito)</label>
                                <input name="district" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="San Rafael" required />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Exact Address (Dirección Exacta)</label>
                                <textarea name="address" onChange={handleInputChange} rows={3} className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors resize-none" placeholder="Frente al parque, casa blanca..." required></textarea>
                            </div>
                        </div>
                    </section>
                </form>

                {/* Payment Section */}
                <section>
                     <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <CreditCard className="w-5 h-5" />
                        <h2 className="text-xl font-serif font-bold">Payment Method</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Sinpe Movil Option */}
                        <div 
                            onClick={() => setPaymentMethod('sinpe')}
                            className={`border rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === 'sinpe' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'sinpe' ? 'border-black' : 'border-gray-300'}`}>
                                    {paymentMethod === 'sinpe' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                                <span className="font-bold flex items-center gap-2"> <Smartphone className="w-4 h-4" /> SINPE Móvil</span>
                            </div>
                            
                            {paymentMethod === 'sinpe' && (
                                <div className="ml-7 mt-3 text-sm text-gray-600 animate-fade-in">
                                    <p className="mb-2">Please make your transfer to:</p>
                                    <p className="text-xl font-bold text-black tracking-wider">6221-4479</p>
                                    <p className="mt-2 text-xs">Send proof of payment to our WhatsApp after placing your order.</p>
                                </div>
                            )}
                        </div>

                         {/* Credit Card Option */}
                         <div 
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`border rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-black' : 'border-gray-300'}`}>
                                    {paymentMethod === 'credit_card' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                                <span className="font-bold flex items-center gap-2"> <CreditCard className="w-4 h-4" /> Credit Card</span>
                            </div>

                             {paymentMethod === 'credit_card' && (
                                <div className="ml-7 mt-3 text-sm text-gray-500 animate-fade-in italic">
                                    Payment processor integration pending.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <button 
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : 'Place Order'}
                </button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 sticky top-24">
                     <h3 className="font-serif text-lg font-bold mb-4">Order Summary</h3>
                     
                     <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {cartItems.map((item, index) => (
                             <div key={`${item.id}-summary-${index}`} className="flex justify-between text-sm">
                                <span className="truncate pr-4">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                                <span className="flex-shrink-0">{ (item.price * item.quantity).toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }) }</span>
                            </div>
                        ))}
                     </div>
                     
                     <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                         <div className="flex justify-between text-gray-500">
                             <span>Subtotal</span>
                             <span>{cartTotal.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}</span>
                         </div>
                         <div className="flex justify-between text-gray-500">
                             <span>Shipping (Correos)</span>
                             <span className={isFreeShipping ? "text-green-600 font-bold" : ""}>
                                 {isFreeShipping 
                                    ? "FREE" 
                                    : shippingCost.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                             </span>
                         </div>
                         <div className="flex justify-between font-bold text-lg pt-2 text-black">
                             <span>Total</span>
                             <span>{total.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Checkout;