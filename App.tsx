import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WhatsAppBubble from './components/WhatsAppBubble';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { NavLink } from './types';
import { CartProvider } from './context/CartContext';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigationLinks: NavLink[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Colección', path: '/shop' },
    { label: 'Nosotros', path: '/about' },
    { label: 'Contacto', path: '/contact' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar automatically when route changes
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on route change
    closeSidebar();
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Navigation Layer */}
      <Navbar onMenuClick={toggleSidebar} />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        links={navigationLinks} 
      />

      <WhatsAppBubble />

      {/* Main Content Layer */}
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};

export default App;