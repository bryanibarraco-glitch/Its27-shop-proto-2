import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { NavLink } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, links }) => {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-serif font-bold tracking-wider">MENÚ</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={onClose}
                      className={`block px-8 py-4 text-2xl font-light tracking-wide transition-colors ${
                        isActive 
                          ? 'bg-black text-white' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-8 border-t border-gray-100">
            <p className="text-sm text-gray-400 uppercase tracking-widest text-center">
              Colección Joyería Its27
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;