import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, Search } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  cartCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, cartCount = 0 }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Hamburger Menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 stroke-black" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="flex flex-col items-center group">
              <span className="text-2xl font-serif font-bold tracking-widest text-black group-hover:opacity-80 transition-opacity">
                ITS27
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-gray-500">
                Jewelry
              </span>
            </Link>
          </div>

          {/* Right: Cart & Search */}
          <div className="flex items-center space-x-2">
             <button className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5 stroke-black" />
            </button>
            <Link to="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
              <ShoppingBag className="w-6 h-6 stroke-black" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;