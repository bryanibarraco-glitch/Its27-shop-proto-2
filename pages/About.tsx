import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12 tracking-widest">IT'S 27</h1>
      
      <div className="space-y-8 text-lg font-light text-gray-600 leading-relaxed animate-fade-in-up text-center md:text-justify">
        <p className="text-xl text-black font-medium">
          Te damos la bienvenida a It's 27, un espacio seguro donde la creatividad y la elegancia convergen para dar vida a piezas únicas y atemporales.
        </p>
        
        <p>
          Nuestro compromiso es ofrecerte más que simples accesorios; queremos proporcionarte la oportunidad de expresar tu estilo y personalidad a través de nuestras piezas.
        </p>

        <p>
          Cada joya es una obra de arte que habla por sí misma, lista para ser descubierta y llevada con confianza en cualquier ocasión especial.
        </p>
        
        <p>
          Desde elegantes collares hasta brillantes anillos, cada artículo ha sido cuidadosamente seleccionado para reflejar tu diversidad.
        </p>

        <p>
          Descubre la joya que resonará contigo y se convertirá en un reflejo de tu historia personal.
        </p>

        <p className="text-black font-bold pt-8 text-center font-serif text-2xl">
          ¡Estamos aquí para ayudarte a encontrar tu próximo tesoro!
        </p>
      </div>
    </div>
  );
};

export default About;