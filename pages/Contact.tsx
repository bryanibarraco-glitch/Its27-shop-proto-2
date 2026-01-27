import React from 'react';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  const phoneNumber = "50686742604";
  const message = "Hola, tengo una consulta sobre Its27 Jewelry.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in-up">
      <h1 className="text-4xl font-serif font-bold mb-6">Contáctanos</h1>
      
      <p className="text-gray-500 mb-12 font-light text-lg leading-relaxed">
        Para brindarte una atención más rápida y personalizada, <br className="hidden md:block" />
        atendemos todas las consultas directamente por WhatsApp.
      </p>

      <div className="flex justify-center mb-16">
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 uppercase tracking-[0.2em] text-sm hover:bg-[#20bd5a] transition-all duration-300 shadow-xl hover:-translate-y-1 rounded-sm font-bold"
        >
          <MessageCircle className="w-5 h-5" />
          Chat en WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-16">
        <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110 duration-300">
                <Mail className="w-5 h-5 text-black" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Correo Electrónico</p>
            <a href="mailto:its27jewelry@gmail.com" className="text-lg hover:text-gray-600 transition-colors border-b border-transparent hover:border-black pb-0.5">
              its27jewelry@gmail.com
            </a>
        </div>

        <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110 duration-300">
                <MapPin className="w-5 h-5 text-black" />
            </div>
             <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Ubicación</p>
            <p className="text-lg">San José, Costa Rica</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;