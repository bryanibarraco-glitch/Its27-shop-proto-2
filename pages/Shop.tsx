import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES = ['Todo', 'Collar', 'Anillo', 'Aretes', 'Conjunto'];

const Shop: React.FC = () => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [sortOption, setSortOption] = useState('featured');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
            setDbProducts(data);
        } else {
            // Fallback if DB is empty
            setDbProducts(PRODUCTS);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setDbProducts(PRODUCTS); // Fallback on error
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];

    // 1. Search Filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'Todo') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // 3. Sorting
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [searchQuery, selectedCategory, sortOption, dbProducts]);

  return (
    <div className="min-h-screen pt-12 px-4 max-w-7xl mx-auto pb-24">
      
      {/* Header */}
      <div className="text-center py-12 bg-gray-50 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Colección</h1>
        <p className="text-gray-500 font-light">Encuentra tu pieza perfecta.</p>
      </div>

      {/* Controls Section */}
      <div className="mb-12 space-y-6">
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative group">
          <input 
            type="text" 
            placeholder="Buscar joyería..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
          {searchQuery && (
            <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
                <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filters & Sort Toolbar */}
        <div className="flex justify-between items-center border-t border-b border-gray-100 py-4">
            
            {/* Filter Toggle Button */}
            <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {selectedCategory !== 'Todo' && (
                    <span className="flex items-center justify-center w-5 h-5 bg-black text-white text-[10px] rounded-full">1</span>
                )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
                <div className="flex items-center gap-2">
                    <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none bg-transparent py-2 pl-2 pr-8 text-sm uppercase tracking-widest focus:outline-none cursor-pointer text-right"
                    >
                        <option value="featured">Ordenar: Destacados</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                        <option value="price-asc">Precio: Menor a Mayor</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterMenuOpen && (
            <div className="py-8 bg-gray-50/50 px-4 rounded-lg animate-fade-in-up">
                <div className="flex justify-between items-end mb-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Categoría</p>
                    {selectedCategory !== 'Todo' && (
                         <button 
                            onClick={() => setSelectedCategory('Todo')} 
                            className="text-xs uppercase tracking-widest text-red-500 border-b border-red-500 pb-0.5"
                         >
                            Restablecer
                         </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 text-sm uppercase tracking-widest transition-all duration-300 border ${
                                selectedCategory === category
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-sm text-gray-400 uppercase tracking-widest">Cargando Colección...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => {
                const displayImage = product.images && product.images.length > 0 
                    ? product.images[0] 
                    : `https://picsum.photos/400/500?random=${product.imageId}`;

                return (
                    <div key={product.id} className="space-y-3 group cursor-pointer">
                    <Link to={`/product/${product.id}`} className="block aspect-[4/5] bg-gray-100 relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
                        <img 
                            src={displayImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                        
                        {/* Desktop Only Button */}
                        <div className="hidden md:block absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <button className="w-full bg-white text-black py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                Ver Detalles
                            </button>
                        </div>
                    </Link>
                    <div className="text-center">
                        <Link to={`/product/${product.id}`} className="block text-sm font-bold uppercase tracking-wide hover:underline truncate px-2">
                            {product.name}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">
                        {product.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    </div>
                );
            })}
        </div>
      ) : (
          <div className="text-center py-20">
              <p className="text-xl text-gray-400 font-serif italic">No se encontraron productos.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('Todo');}}
                className="mt-4 text-sm uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600"
              >
                  Limpiar Filtros
              </button>
          </div>
      )}
      
      {!loading && filteredProducts.length > 0 && (
        <div className="flex justify-center mt-20 mb-12">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Mostrando {filteredProducts.length} productos</span>
        </div>
      )}
    </div>
  );
};

export default Shop;