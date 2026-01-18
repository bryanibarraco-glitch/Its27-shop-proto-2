import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12">Our Story</h1>
      
      <div className="space-y-8 text-lg font-light text-gray-600 leading-relaxed animate-fade-in-up">
        <p className="text-xl text-black">
          Founded in 2024, <span className="font-serif font-bold">Its27 Jewelry</span> was born from a desire to strip away the unnecessary and focus on the essential. 
        </p>
        
        <p>
          We believe that jewelry shouldn't just adorn the body, but resonate with the soul. Our philosophy is rooted in minimalism—not as a lack of detail, but as the perfect amount of it. Each curve, edge, and polish is intentional.
        </p>

        <div className="my-12 relative aspect-video bg-gray-100 overflow-hidden">
           <img 
            src="https://picsum.photos/1200/600?grayscale&blur=1" 
            alt="Jewelry Workshop" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
           />
        </div>

        <h2 className="text-2xl font-serif font-bold text-black mt-12 mb-4">The Process</h2>
        <p>
          Every piece is handcrafted in our small studio, ensuring that no two items are exactly alike. We use only ethically sourced silver and gold, committed to sustainability as much as style. From the initial sketch to the final polish, human hands shape every part of the journey.
        </p>
        
        <p>
          Its27 is more than a brand; it is a celebration of timeless elegance for the modern muse.
        </p>
      </div>
    </div>
  );
};

export default About;