import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Truck, CheckCircle, Gift, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';

const PROVINCES = [
  'San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'
];

// --- EMAILJS CONFIGURATION ---
const EMAIL_SERVICE_ID = 'service_gbzwvkp'; 
const EMAIL_TEMPLATE_ID = 'template_hszdk4s';
const EMAIL_PUBLIC_KEY = '1-44LVx0fgEwJCGMb';

// Helper: Generate a professional looking order code (e.g., ITS-9X2B-1234)
const generateOrderCode = () => {
  const prefix = "ITS"; // for Its27 Jewelry
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'sinpe_movil'>('credit_card');
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error Handling State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalOrderCode, setFinalOrderCode] = useState('');
  
  // Shipping Logic
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
      if (errorMsg) {
          setErrorMsg(null);
      }
  };

  const sendOrderEmail = async (orderCode: string) => {
      // 1. Format the Items List for Admin readability
      // Shows: [Qty] Name - Total Price
      const itemsListHtml = cartItems.map(item => 
          `[${item.quantity}] ${item.name} - ₡${(item.price * item.quantity).toLocaleString('es-CR')}`
      ).join('<br/>');

      // 2. Admin Action Note
      // This text tells YOU what to check for.
      let adminNote = 'Payment Method: Credit Card (Integration Pending)';
      if (paymentMethod === 'sinpe_movil') {
        adminNote = `ACTION REQUIRED: Customer selected SINPE. Check your bank for a transfer of ₡${total.toLocaleString('es-CR')} from ${formData.name}.`;
      }

      const templateParams = {
          order_id: orderCode,
          order_date: new Date().toLocaleString('es-CR'),
          customer_name: formData.name,
          customer_phone: formData.phone,
          shipping_address: `${formData.province}, ${formData.canton}, ${formData.district}. ${formData.address}`,
          order_items: itemsListHtml,
          total_amount: `₡${total.toLocaleString('es-CR')}`,
          payment_method: paymentMethod.toUpperCase().replace('_', ' '),
          payment_info: adminNote // Sends the Admin Note to your email
      };

      try {
          await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams, EMAIL_PUBLIC_KEY);
          console.log("Admin Alert Sent Successfully!");
      } catch (error) {
          console.error("Failed to send admin alert:", error);
      }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrorMsg(null);

      // 1. Generate the receipt number LOCALLY
      const orderCode = generateOrderCode();

      try {
          // 2. Prepare the data payload
          const orderPayload = {
              customer_name: formData.name,
              customer_phone: formData.phone,
              province: formData.province,
              canton: formData.canton,
              district: formData.district,
              address: formData.address,
              total_amount: total,
              payment_method: paymentMethod,
              status: 'pending',
              order_code: orderCode, // New field for reference
              items: cartItems       // Storing items as JSON to bypass relational insert restrictions for guests
          };

          // 3. Insert Order (WITHOUT .select())
          const { error: orderError } = await supabase
              .from('orders')
              .insert([orderPayload]);

          if (orderError) throw orderError;

          // 4. Send Email Automation (Admin Alert)
          await sendOrderEmail(orderCode);

          // 5. Success
          clearCart();
          setFinalOrderCode(orderCode);
          setShowSuccessModal(true);

      } catch (error: any) {
          console.error("Error placing order:", error);
          const msg = error.message || 'Por favor verifica tu información e intenta de nuevo.';
          alert(`Error en el Pedido: ${msg}`);
          setErrorMsg(msg);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up relative">
        {/* Back link */}
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Volver al Carrito
        </Link>

        {/* Marketing Banner */}
        {!isFreeShipping && (
             <div className="bg-gray-900 text-white p-4 mb-8 flex items-center justify-between gap-4 animate-fade-in shadow-lg">
                <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-gray-300" />
                    <p className="text-sm font-medium">
                        Agrega <span className="font-bold text-white underline decoration-1 underline-offset-4">{itemsNeededForFreeShipping} artículo{itemsNeededForFreeShipping > 1 ? 's' : ''} más</span> para tener <span className="font-bold">ENVÍO GRATIS</span>!
                    </p>
                </div>
                <Link to="/shop" className="text-xs uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap">
                    Seguir Comprando
                </Link>
             </div>
        )}
        
        {isFreeShipping && (
            <div className="bg-green-50 text-green-800 border border-green-100 p-4 mb-8 flex items-center gap-3 animate-fade-in">
                <Gift className="w-5 h-5" />
                <p className="text-sm font-medium">¡Felicidades! Tienes <span className="font-bold">ENVÍO GRATIS</span>.</p>
            </div>
        )}

        <h1 className="text-3xl font-serif font-bold mb-8">Finalizar Compra</h1>

        {/* Error Display */}
        {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 mb-8 rounded-md border border-red-100 flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Error en el Pedido</h3>
                    <p className="text-sm mt-1">{errorMsg}</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Shipping Section */}
                <form id="checkout-form" onSubmit={handlePlaceOrder}>
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <Truck className="w-5 h-5" />
                            <h2 className="text-xl font-serif font-bold">Información de Envío</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-4 mb-6 rounded-sm border border-gray-100 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Envíos seguros por <span className="font-bold text-black">Correos de Costa Rica</span>.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nombre Completo</label>
                                <input name="name" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="Juan Pérez" required />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Número de Teléfono</label>
                                <input name="phone" onChange={handleInputChange} type="tel" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="8888-8888" required />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Provincia</label>
                                <select name="province" onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors cursor-pointer" required>
                                    <option value="">Seleccionar Provincia</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Cantón</label>
                                <input name="canton" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="Escazú" required />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Distrito</label>
                                <input name="district" onChange={handleInputChange} type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors" placeholder="San Rafael" required />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Dirección Exacta</label>
                                <textarea name="address" onChange={handleInputChange} rows={3} className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors resize-none" placeholder="Frente al parque, casa blanca..." required></textarea>
                            </div>
                        </div>
                    </section>
                </form>

                {/* Payment Section */}
                <section>
                     <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <CreditCard className="w-5 h-5" />
                        <h2 className="text-xl font-serif font-bold">Método de Pago</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Sinpe Movil Option */}
                        <div 
                            onClick={() => setPaymentMethod('sinpe_movil')}
                            className={`border rounded-lg p-6 cursor-pointer transition-all ${paymentMethod === 'sinpe_movil' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'sinpe_movil' ? 'border-black' : 'border-gray-300'}`}>
                                    {paymentMethod === 'sinpe_movil' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                </div>
                                <span className="font-bold flex items-center gap-2"> <Smartphone className="w-4 h-4" /> SINPE Móvil</span>
                            </div>
                            
                            {paymentMethod === 'sinpe_movil' && (
                                <div className="ml-7 mt-3 text-sm text-gray-600 animate-fade-in">
                                    <p className="mb-2">Por favor realiza el SINPE al:</p>
                                    <p className="text-xl font-bold text-black tracking-wider">6221-4479</p>
                                    <p className="mt-2 text-xs">Envía el comprobante a nuestro WhatsApp después de realizar el pedido.</p>
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
                                <span className="font-bold flex items-center gap-2"> <CreditCard className="w-4 h-4" /> Tarjeta de Crédito</span>
                            </div>

                             {paymentMethod === 'credit_card' && (
                                <div className="ml-7 mt-3 text-sm text-gray-500 animate-fade-in italic">
                                    Procesador de pagos pendiente de integración.
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
                        <>Procesando <Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : 'Realizar Pedido'}
                </button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 sticky top-24">
                     <h3 className="font-serif text-lg font-bold mb-4">Resumen del Pedido</h3>
                     
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
                             <span>Envío (Correos)</span>
                             <span className={isFreeShipping ? "text-green-600 font-bold" : ""}>
                                 {isFreeShipping 
                                    ? "GRATIS" 
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

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center space-y-6 transform transition-all scale-100 border border-gray-100">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                            ¡Gracias por tu compra!
                        </h2>
                        <p className="text-gray-500 font-light">
                            Hemos recibido tu pedido.
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Referencia del Pedido</p>
                        <p className="font-mono font-bold text-xl text-black">{finalOrderCode}</p>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                        Se ha enviado un correo de confirmación al administrador. <br/> 
                        <span className="text-xs italic"> (El recibo del cliente se envía si está configurado)</span>
                    </p>

                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-black text-white py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Seguir Comprando
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Checkout;