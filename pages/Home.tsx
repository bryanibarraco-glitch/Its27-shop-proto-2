import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Edit3, X, Save, Upload, Loader2, Check, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { supabase } from '../lib/supabaseClient';

// Default Content Fallback
const DEFAULT_HERO = {
  title: "Elegancia Atemporal",
  subtitle: "Nueva Colección 2024",
  description: "Descubre la belleza de la simplicidad artesanal. Diseñado para la musa moderna.",
  buttonText: "Ver Catálogo",
  imageUrl: "https://picsum.photos/1920/1080?grayscale&blur=2"
};

const DEFAULT_CATEGORIES = ['Anillo', 'Collar', 'Aretes', 'Conjunto'];

const Home: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content State
  const [heroConfig, setHeroConfig] = useState(DEFAULT_HERO);
  const [logoUrl, setLogoUrl] = useState('');
  
  // Product Data
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [sortOption, setSortOption] = useState('featured');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // 1. Check Auth & Load Settings
  useEffect(() => {
    checkUser();
    fetchSiteSettings();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const fetchSiteSettings = async () => {
    try {
      // Fetch Home Config
      const { data: homeSettings } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'home_config')
        .single();

      if (homeSettings && homeSettings.content) {
        setHeroConfig({ ...DEFAULT_HERO, ...homeSettings.content.hero });
      }

      // Fetch Global Config (Logo)
      const { data: globalSettings } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'global_config')
        .single();
      
      if (globalSettings && globalSettings.content && globalSettings.content.logoUrl) {
          setLogoUrl(globalSettings.content.logoUrl);
      }

      // Fetch Categories
      const { data: catSettings } = await supabase
        .from('site_settings')
        .select('content')
        .eq('key', 'categories_list')
        .single();

      if (catSettings?.content?.list) {
          setCategories(catSettings.content.list);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
          setDbProducts(data);
      } else {
          setDbProducts(PRODUCTS);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setDbProducts(PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

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
    if (sortOption === 'featured') {
      // Sort by is_featured desc (true first), then by ID (or random if needed, but ID is stable)
      result.sort((a, b) => {
        if (a.is_featured === b.is_featured) return 0;
        return a.is_featured ? -1 : 1;
      });
    } else if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [searchQuery, selectedCategory, sortOption, dbProducts]);

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // 1. Save Home Config
    const homePayload = {
        hero: heroConfig,
    };
    const { error: homeError } = await supabase
        .from('site_settings')
        .upsert({ key: 'home_config', content: homePayload });

    // 2. Save Global Config
    const globalPayload = {
        logoUrl: logoUrl
    };
    const { error: globalError } = await supabase
        .from('site_settings')
        .upsert({ key: 'global_config', content: globalPayload });

    setSaving(false);
    if (homeError || globalError) {
        alert("Failed to save changes. Please try again.");
    } else {
        setIsEditModalOpen(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await uploadFile(file, (url) => setHeroConfig({ ...heroConfig, imageUrl: url }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await uploadFile(file, (url) => setLogoUrl(url));
  };

  const uploadFile = async (file: File, onSuccess: (url: string) => void) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `asset-${Date.now()}.${fileExt}`;
    setSaving(true);

    const { error } = await supabase.storage.from('products').upload(fileName, file);
    if (error) {
        alert("Upload failed: " + error.message);
        setSaving(false);
        return;
    }

    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    if (data) {
        onSuccess(data.publicUrl);
    }
    setSaving(false);
  };

  const scrollToCatalog = () => {
      const catalogSection = document.getElementById('catalog');
      if(catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
  };

  // Combine fixed 'Todo' with dynamic categories
  const displayCategories = ['Todo', ...categories];

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* Admin Edit Trigger */}
      {isAdmin && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform uppercase tracking-widest text-xs font-bold"
          >
              <Edit3 className="w-4 h-4" /> Personalizar Sitio
          </button>
      )}

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-60">
           <img 
            src={heroConfig.imageUrl} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
           />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <h2 className="text-white text-sm md:text-base uppercase tracking-[0.4em] font-light">
            {heroConfig.subtitle}
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif font-bold tracking-tight whitespace-pre-line">
            {heroConfig.title}
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            {heroConfig.description}
          </p>
          
          <div className="pt-8">
            <button 
              onClick={scrollToCatalog}
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:scale-105 duration-300"
            >
              {heroConfig.buttonText} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section id="catalog" className="py-24 px-4 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
             <h3 className="text-4xl font-serif font-bold mb-4">Catálogo Completo</h3>
             <div className="w-16 h-0.5 bg-black mx-auto"></div>
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
                            {displayCategories.map(category => (
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
                [1,2,3,4].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                        <div className="bg-gray-200 aspect-[3/4] w-full"></div>
                        <div className="h-4 bg-gray-200 w-3/4 mx-auto"></div>
                    </div>
                ))
            ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                    const displayImage = product.images && product.images.length > 0 
                        ? product.images[0] 
                        : `https://picsum.photos/600/800?random=${product.imageId}`;

                    return (
                        <div key={product.id} className="group cursor-pointer">
                            <Link to={`/product/${product.id}`}>
                                <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-gray-100">
                                <img 
                                    src={displayImage} 
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {product.is_featured && (
                                    <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 uppercase tracking-widest font-bold z-10">
                                        Destacado
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Ver Detalles
                                    </button>
                                </div>
                                </div>
                            </Link>
                            <div className="text-center space-y-1">
                            <h4 className="text-sm md:text-base font-serif font-bold">{product.name}</h4>
                            <p className="text-gray-500 font-light text-sm">
                                {product.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                            </p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="col-span-full text-center py-20">
                    <p className="text-xl text-gray-400 font-serif italic">No se encontraron productos.</p>
                    <button 
                        onClick={() => {setSearchQuery(''); setSelectedCategory('Todo');}}
                        className="mt-4 text-sm uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Brand Values */}
      <section className="bg-offwhite py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Calidad Premium</h4>
              <p className="text-gray-500 font-light">Materiales de origen ético y artesanía experta en cada pieza.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl italic">27</span>
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Diseño Único</h4>
              <p className="text-gray-500 font-light">Estilos distintivos que destacan entre la multitud, hechos para ti.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                 <ArrowRight className="w-6 h-6 -rotate-45" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Garantía de Por Vida</h4>
              <p className="text-gray-500 font-light">Respaldamos nuestra joyería para siempre. Experimenta el lujo sin preocupaciones.</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4">
         <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
            <h2 className="text-3xl font-serif font-bold tracking-widest">ITS27</h2>
            <nav className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-white transition-colors">Catálogo</Link>
              <Link to="/about" className="hover:text-white transition-colors">Nosotros</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contacto</Link>
            </nav>
            <p className="text-xs text-gray-600 pt-8">© 2024 Its27 Jewelry. Todos los derechos reservados.</p>
         </div>
      </footer>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex justify-end">
              <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-fade-in flex flex-col">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-serif font-bold">Personalizar Sitio</h2>
                      <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-6 space-y-8">
                      
                      {/* Section: Global Settings */}
                      <div className="space-y-4">
                          <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b pb-2">Configuración Global</h3>
                          
                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Logo</label>
                              <div className="flex items-center gap-4">
                                  {/* UPDATED: Wider container for rectangular logos */}
                                  <div className="w-64 h-24 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center border border-gray-200 relative group">
                                      {logoUrl ? (
                                          <img src={logoUrl} className="max-w-full max-h-full object-contain p-2" alt="Logo" />
                                      ) : (
                                          <span className="text-xs text-gray-400">Sin Logo</span>
                                      )}
                                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                           <p className="text-white text-[10px] font-bold uppercase">Subir</p>
                                      </div>
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                      />
                                  </div>
                                  {logoUrl && (
                                      <button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-700 underline">Eliminar</button>
                                  )}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Recomendado: PNG Transparente.</p>
                          </div>
                      </div>

                      {/* Section: Hero */}
                      <div className="space-y-4">
                          <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b pb-2">Sección Hero</h3>
                          
                           <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Texto Superior</label>
                              <input 
                                type="text"
                                value={heroConfig.subtitle} 
                                onChange={(e) => setHeroConfig({...heroConfig, subtitle: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Título</label>
                              <textarea 
                                rows={2}
                                value={heroConfig.title} 
                                onChange={(e) => setHeroConfig({...heroConfig, title: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Texto Inferior</label>
                              <textarea 
                                rows={3}
                                value={heroConfig.description} 
                                onChange={(e) => setHeroConfig({...heroConfig, description: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Texto del Botón</label>
                              <input 
                                type="text"
                                value={heroConfig.buttonText} 
                                onChange={(e) => setHeroConfig({...heroConfig, buttonText: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Imagen de Fondo</label>
                              <div className="relative h-32 bg-gray-100 rounded-sm overflow-hidden group mb-2">
                                  <img src={heroConfig.imageUrl} className="w-full h-full object-cover" alt="Hero" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <p className="text-white text-xs font-bold uppercase">Cambiar Imagen</p>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleHeroImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                              </div>
                              <p className="text-[10px] text-gray-400">Recomendado: 1920x1080px (Landscape)</p>
                          </div>
                      </div>

                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                      <button 
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full bg-black text-white py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Guardar Cambios
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;