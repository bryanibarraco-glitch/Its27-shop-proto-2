import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

// Mock Data
const PRODUCTS = [
  { id: 1, name: 'Minimalist Silver Band', category: 'Ring', price: 85.00, imageId: 101 },
  { id: 2, name: 'Eclipse Pearl Necklace', category: 'Necklace', price: 145.00, imageId: 102 },
  { id: 3, name: 'Geometric Gold Studs', category: 'Earrings', price: 55.00, imageId: 103 },
  { id: 4, name: 'Obsidian Signet Ring', category: 'Ring', price: 120.00, imageId: 104 },
  { id: 5, name: 'Midnight Bridal Set', category: 'Set', price: 450.00, imageId: 105 },
  { id: 6, name: 'Nova Drop Earrings', category: 'Earrings', price: 95.00, imageId: 106 },
  { id: 7, name: 'Horizon Chain', category: 'Necklace', price: 110.00, imageId: 107 },
  { id: 8, name: 'Classic Gold Band', category: 'Ring', price: 210.00, imageId: 108 },
  { id: 9, name: 'Starlight Pendant', category: 'Necklace', price: 135.00, imageId: 109 },
  { id: 10, name: 'Onyx Studs', category: 'Earrings', price: 65.00, imageId: 110 },
  { id: 11, name: 'Duo Tone Set', category: 'Set', price: 280.00, imageId: 111 },
  { id: 12, name: 'Wave Ring', category: 'Ring', price: 75.00, imageId: 112 },
];

const CATEGORIES = ['All', 'Necklace', 'Ring', 'Earrings', 'Set'];

const Shop: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // 1. Search Filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // 3. Sorting
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [searchQuery, selectedCategory, sortOption]);

  return (
    <div className="min-h-screen pt-12 px-4 max-w-7xl mx-auto pb-24">
      
      {/* Header */}
      <div className="text-center py-12 bg-gray-50 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shop Collection</h1>
        <p className="text-gray-500 font-light">Find your perfect piece.</p>
      </div>

      {/* Controls Section */}
      <div className="mb-12 space-y-6">
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative group">
          <input 
            type="text" 
            placeholder="Search for jewelry..." 
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
                <span>Filters</span>
                {selectedCategory !== 'All' && (
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
                        <option value="featured">Sort By: Featured</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="price-asc">Price: Low to High</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterMenuOpen && (
            <div className="py-8 bg-gray-50/50 px-4 rounded-lg animate-fade-in-up">
                <div className="flex justify-between items-end mb-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Category</p>
                    {selectedCategory !== 'All' && (
                         <button 
                            onClick={() => setSelectedCategory('All')} 
                            className="text-xs uppercase tracking-widest text-red-500 border-b border-red-500 pb-0.5"
                         >
                            Reset
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
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
                <div key={product.id} className="space-y-3 group cursor-pointer">
                <Link to={`/product/${product.id}`} className="block aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    <img 
                        src={`https://picsum.photos/400/500?random=${product.imageId}`} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="w-full bg-white text-black py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                            View Details
                        </button>
                    </div>
                </Link>
                <div className="text-center">
                    <Link to={`/product/${product.id}`} className="block text-sm font-bold uppercase tracking-wide hover:underline truncate px-2">
                        {product.name}
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">${product.price.toFixed(2)}</p>
                </div>
                </div>
            ))}
        </div>
      ) : (
          <div className="text-center py-20">
              <p className="text-xl text-gray-400 font-serif italic">No products found matching your selection.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                className="mt-4 text-sm uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600"
              >
                  Clear Filters
              </button>
          </div>
      )}
      
      {filteredProducts.length > 0 && (
        <div className="flex justify-center mt-20 mb-12">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Showing {filteredProducts.length} products</span>
        </div>
      )}
    </div>
  );
};

export default Shop;