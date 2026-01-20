import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Edit3, X, Save, Upload, Loader2, Check } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { supabase } from '../lib/supabaseClient';

// Default Content Fallback
const DEFAULT_HERO = {
  title: "Timeless Elegance",
  subtitle: "New Collection 2024",
  description: "Discover the beauty of handcrafted simplicity. Designed for the modern muse.",
  buttonText: "Shop Collection",
  imageUrl: "https://picsum.photos/1920/1080?grayscale&blur=2"
};

const Home: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content State
  const [heroConfig, setHeroConfig] = useState(DEFAULT_HERO);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  
  // Display Data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // For selection in modal

  // 1. Check Auth & Load Settings
  useEffect(() => {
    checkUser();
    fetchSiteSettings();
  }, []);

  // 2. Fetch curated products whenever IDs change
  useEffect(() => {
    fetchFeaturedProducts();
  }, [featuredIds]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const fetchSiteSettings = async () => {
    try {
      // Fetch Config
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'home_config')
        .single();

      if (settings && settings.content) {
        setHeroConfig({ ...DEFAULT_HERO, ...settings.content.hero });
        setFeaturedIds(settings.content.featuredIds || []);
      } else {
        // Init with defaults if no DB row exists yet
        setFeaturedIds([1, 2, 3]); 
      }

      // Fetch All Products (for the admin selector)
      const { data: products } = await supabase.from('products').select('*');
      if (products) setAllProducts(products);

    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    if (featuredIds.length === 0) {
        // Fallback to static if empty
        setFeaturedProducts(PRODUCTS.slice(0, 3)); 
        return;
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', featuredIds);
    
    if (data) {
        // Sort them in the order of the IDs array (to maintain user preference)
        const sorted = featuredIds.map(id => data.find(p => p.id === id)).filter(Boolean) as Product[];
        setFeaturedProducts(sorted);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const payload = {
        hero: heroConfig,
        featuredIds: featuredIds
    };

    const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'home_config', content: payload });

    setSaving(false);
    if (error) {
        alert("Failed to save changes: " + error.message);
    } else {
        setIsEditModalOpen(false);
        fetchFeaturedProducts();
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;

    setSaving(true);
    const { error } = await supabase.storage.from('products').upload(fileName, file);
    
    if (error) {
        alert("Upload failed: " + error.message);
        setSaving(false);
        return;
    }

    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    if (data) {
        setHeroConfig({ ...heroConfig, imageUrl: data.publicUrl });
    }
    setSaving(false);
  };

  const toggleFeaturedProduct = (id: number) => {
      setFeaturedIds(prev => {
          if (prev.includes(id)) {
              return prev.filter(pid => pid !== id);
          } else {
              if (prev.length >= 3) {
                  // Optional: replace the first one or just stop? Let's stop.
                  alert("You can only select 3 featured products. Deselect one first.");
                  return prev;
              }
              return [...prev, id];
          }
      });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      
      {/* Admin Edit Trigger */}
      {isAdmin && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform uppercase tracking-widest text-xs font-bold"
          >
              <Edit3 className="w-4 h-4" /> Customize Home
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
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:scale-105 duration-300"
            >
              {heroConfig.buttonText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Preview Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h3 className="text-3xl font-serif font-bold mb-4">Curated Favorites</h3>
             <div className="w-16 h-0.5 bg-black mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
                [1,2,3].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                        <div className="bg-gray-200 aspect-[3/4] w-full"></div>
                        <div className="h-4 bg-gray-200 w-3/4 mx-auto"></div>
                    </div>
                ))
            ) : (
                featuredProducts.map((product) => {
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
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button className="w-full bg-white text-black py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Quick View
                                    </button>
                                </div>
                                </div>
                            </Link>
                            <div className="text-center space-y-1">
                            <h4 className="text-lg font-serif">{product.name}</h4>
                            <p className="text-gray-500 font-light">
                                {product.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                            </p>
                            </div>
                        </div>
                    );
                })
            )}
            
            {featuredProducts.length === 0 && (
                <div className="col-span-3 text-center text-gray-400 py-10">
                    No curated products selected.
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
              <h4 className="text-lg font-bold uppercase tracking-wide">Premium Quality</h4>
              <p className="text-gray-500 font-light">Ethically sourced materials and expert craftsmanship in every piece.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-xl italic">27</span>
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Unique Design</h4>
              <p className="text-gray-500 font-light">Distinctive styles that stand out from the crowd, made for you.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                 <ArrowRight className="w-6 h-6 -rotate-45" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide">Lifetime Warranty</h4>
              <p className="text-gray-500 font-light">We stand behind our jewelry forever. Experience worry-free luxury.</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4">
         <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
            <h2 className="text-3xl font-serif font-bold tracking-widest">ITS27</h2>
            <nav className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </nav>
            <p className="text-xs text-gray-600 pt-8">© 2024 Its27 Jewelry. All rights reserved.</p>
         </div>
      </footer>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex justify-end">
              <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-fade-in flex flex-col">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-serif font-bold">Customize Home</h2>
                      <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-6 space-y-8">
                      
                      {/* Section: Hero */}
                      <div className="space-y-4">
                          <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b pb-2">Hero Section</h3>
                          
                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Main Title</label>
                              <textarea 
                                rows={2}
                                value={heroConfig.title} 
                                onChange={(e) => setHeroConfig({...heroConfig, title: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>

                           <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Subtitle</label>
                              <input 
                                type="text"
                                value={heroConfig.subtitle} 
                                onChange={(e) => setHeroConfig({...heroConfig, subtitle: e.target.value})}
                                className="w-full border border-gray-300 p-2 text-sm rounded-sm focus:border-black outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Background Image</label>
                              <div className="relative h-32 bg-gray-100 rounded-sm overflow-hidden group mb-2">
                                  <img src={heroConfig.imageUrl} className="w-full h-full object-cover" alt="Hero" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <p className="text-white text-xs font-bold uppercase">Change Image</p>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleHeroImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                              </div>
                              <p className="text-[10px] text-gray-400">Recommended: 1920x1080px (Landscape)</p>
                          </div>
                      </div>

                      {/* Section: Featured */}
                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Curated Favorites</h3>
                            <span className="text-xs font-bold">{featuredIds.length} / 3 Selected</span>
                          </div>

                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              {allProducts.map(p => {
                                  const isSelected = featuredIds.includes(p.id);
                                  return (
                                      <div 
                                        key={p.id} 
                                        onClick={() => toggleFeaturedProduct(p.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                                      >
                                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-black border-black text-white' : 'border-gray-300'}`}>
                                              {isSelected && <Check className="w-3 h-3" />}
                                          </div>
                                          <div className="w-10 h-10 bg-gray-200 rounded-sm overflow-hidden flex-shrink-0">
                                              <img src={p.images?.[0] || `https://picsum.photos/100?random=${p.imageId}`} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">{p.name}</p>
                                              <p className="text-xs text-gray-500">₡{p.price}</p>
                                          </div>
                                      </div>
                                  );
                              })}
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
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;