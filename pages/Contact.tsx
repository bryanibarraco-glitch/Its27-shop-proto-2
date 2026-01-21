import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (submitStatus === 'error') setSubmitStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message,
          created_at: new Date().toISOString(),
          status: 'unread' // Optional: if you want to track read status later
        }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Hubo un error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-serif font-bold text-center mb-4">Contáctanos</h1>
      <p className="text-center text-gray-500 mb-12 font-light">
        ¿Tienes una pregunta o simplemente quieres saludar? Nos encantaría saber de ti.
      </p>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-8 text-center animate-fade-in space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
             <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-green-800">¡Mensaje Enviado!</h3>
          <p className="text-gray-600">Gracias por contactarnos. Te responderemos lo antes posible.</p>
          <button 
            onClick={() => setSubmitStatus('idle')}
            className="text-sm uppercase tracking-widest underline hover:text-green-800 mt-4"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form className="space-y-8 animate-fade-in-up" onSubmit={handleSubmit}>
          
          {submitStatus === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 flex-shrink-0" />
               <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent" 
              placeholder="Ana Rodríguez"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Correo Electrónico</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent" 
              placeholder="ana@ejemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Mensaje</label>
            <textarea 
              name="message"
              rows={5} 
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
              placeholder="¿Cómo podemos ayudarte?"
            ></textarea>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>Enviando <Loader2 className="w-4 h-4 animate-spin"/></>
            ) : 'Enviar Mensaje'}
          </button>
        </form>
      )}

      <div className="mt-16 text-center space-y-2 text-gray-500 font-light text-sm">
        <p>info@its27jewelry.com</p>
        <p>+506 8674 2604</p>
        <p>San José, Costa Rica</p>
      </div>
    </div>
  );
};

export default Contact;