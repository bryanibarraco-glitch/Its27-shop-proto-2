import React, { useState } from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12">Nuestra Historia</h1>
      
      <div className="space-y-8 text-lg font-light text-gray-600 leading-relaxed animate-fade-in-up">
        <p className="text-xl text-black">
          Fundada en 2024, <span className="font-serif font-bold">Its27 Jewelry</span> nació del deseo de eliminar lo innecesario y centrarse en lo esencial. 
        </p>
        
        <p>
          Creemos que la joyería no solo debe adornar el cuerpo, sino resonar con el alma. Nuestra filosofía se basa en el minimalismo, no como falta de detalle, sino como la cantidad perfecta del mismo. Cada curva, borde y pulido es intencional.
        </p>

        <div className="my-12 relative aspect-video bg-gray-100 overflow-hidden">
           <img 
            src="https://picsum.photos/1200/600?grayscale&blur=1" 
            alt="Jewelry Workshop" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
           />
        </div>

        <h2 className="text-2xl font-serif font-bold text-black mt-12 mb-4">El Proceso</h2>
        <p>
          Cada pieza es hecha a mano en nuestro pequeño estudio, asegurando que no haya dos artículos exactamente iguales. Utilizamos solo plata y oro de origen ético, comprometidos con la sostenibilidad tanto como con el estilo. Desde el boceto inicial hasta el pulido final, manos humanas dan forma a cada parte del viaje.
        </p>
        
        <p>
          Its27 es más que una marca; es una celebración de la elegancia atemporal para la musa moderna.
        </p>
      </div>
    </div>
  );
};

export default About;