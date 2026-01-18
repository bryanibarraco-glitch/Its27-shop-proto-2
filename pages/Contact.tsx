import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-serif font-bold text-center mb-4">Get in Touch</h1>
      <p className="text-center text-gray-500 mb-12 font-light">
        Have a question or just want to say hello? We'd love to hear from you.
      </p>

      <form className="space-y-8 animate-fade-in-up" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Name</label>
          <input 
            type="text" 
            className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent" 
            placeholder="Jane Doe"
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent" 
            placeholder="jane@example.com"
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
          <textarea 
            rows={5} 
            className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
            placeholder="How can we help you?"
          ></textarea>
        </div>

        <button className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-colors">
          Send Message
        </button>
      </form>

      <div className="mt-16 text-center space-y-2 text-gray-500 font-light text-sm">
        <p>info@its27jewelry.com</p>
        <p>+506 8674 2604</p>
        <p>San José, Costa Rica</p>
      </div>
    </div>
  );
};

export default Contact;