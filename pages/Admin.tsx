import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, LogOut, Save, X, Upload, Loader2, Star, ChevronLeft, ChevronRight, MessageSquare, Mail } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../data/products';

interface ContactMessage {
  id: number;
  created_at: string;
  name: string;
  email: string;
  message: string;
  status?: string;
}

const Admin: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'products' | 'messages'>('products');
  
  // Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Anillo',
    price: 0,
    imageId: 101,
    images: [],
    description: '',
    is_featured: false
  });
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 1. Check Auth on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          fetchProducts();
          fetchMessages();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          fetchProducts();
          fetchMessages();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data || []);
  };

  const deleteMessage = async (id: number) => {
      if(!confirm("Are you sure you want to delete this message?")) return;
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if(error) alert("Error deleting message");
      else fetchMessages();
  };

  // 3. Auth Functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProducts([]);
    setMessages([]);
  };

  // 4. Product CRUD
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setFormData({
          ...product,
          images: product.images || [],
          is_featured: product.is_featured || false
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        category: 'Anillo',
        price: 0,
        imageId: Math.floor(Math.random() * 100) + 100, 
        images: [],
        description: '',
        is_featured: false
      });
      setIsEditing(false);
    }
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("Error deleting product");
    } else {
      fetchProducts();
    }
  };

  const toggleFeatured = async (product: Product) => {
      const newVal = !product.is_featured;
      // Optimistic update
      setProducts(products.map(p => p.id === product.id ? { ...p, is_featured: newVal } : p));
      
      const { error } = await supabase.from('products').update({ is_featured: newVal }).eq('id', product.id);
      if (error) {
          console.error("Error updating featured status:", error);
          // Revert on error
          fetchProducts();
      }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        "imageId": formData.imageId,
        description: formData.description,
        images: formData.images,
        is_featured: formData.is_featured
    };

    if (isEditing && formData.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', formData.id);
      if (error) alert("Error updating product: " + error.message);
      else {
        fetchProducts();
        setIsProductModalOpen(false);
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) alert("Error creating product: " + error.message);
      else {
        fetchProducts();
        setIsProductModalOpen(false);
      }
    }
  };

  // 5. Image Handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files) as File[];
    const newUrls: string[] = [];

    try {
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `${Date.now()}-${cleanName}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                continue;
            }

            const { data } = supabase.storage.from('products').getPublicUrl(fileName);
            if (data) newUrls.push(data.publicUrl);
        }

        if (newUrls.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...newUrls]
            }));
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    } finally {
        setUploading(false);
        e.target.value = ''; 
    }
  };

  const removeImage = (indexToRemove: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, index) => index !== indexToRemove)
      }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
      setFormData(prev => {
          if (!prev.images) return prev;
          const newImages = [...prev.images];
          if (direction === 'left' && index > 0) {
              [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
          } else if (direction === 'right' && index < newImages.length - 1) {
              [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
          }
          return { ...prev, images: newImages };
      });
  };

  const setMainImage = (index: number) => {
      setFormData(prev => {
          if (!prev.images) return prev;
          const newImages = [...prev.images];
          const [selectedImage] = newImages.splice(index, 1);
          newImages.unshift(selectedImage);
          return { ...prev, images: newImages };
      });
  };

  // --- RENDER: LOADING ---
  if (loading && !session) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  }

  // --- RENDER: LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Admin Access</h1>
            <p className="text-gray-500 text-sm">Please log in to manage your store.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                required 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                required 
              />
            </div>
            
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                {authError}
              </div>
            )}

            <button className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Logged in as {session.user.email}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm uppercase tracking-wider self-start md:self-auto"
            >
                <LogOut className="w-4 h-4" /> Log Out
            </button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <Package className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
            </div>
            <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Messages</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-6 border-b border-gray-200">
             <button 
                onClick={() => setActiveTab('products')}
                className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
             >
                 Products
             </button>
             <button 
                onClick={() => setActiveTab('messages')}
                className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors flex items-center gap-2 ${activeTab === 'messages' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
             >
                 Messages {messages.length > 0 && <span className="bg-gray-100 text-black px-1.5 rounded-full text-[10px]">{messages.length}</span>}
             </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
            
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold font-serif">Inventory</h2>
                        <button 
                            onClick={() => handleOpenProductModal()}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4 text-center">Featured</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => {
                                    const displayImage = product.images && product.images.length > 0 
                                        ? product.images[0] 
                                        : `https://picsum.photos/100/100?random=${product.imageId}`;

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="w-12 h-12 bg-gray-100 overflow-hidden rounded-sm relative">
                                                    <img src={displayImage} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{product.name}</td>
                                            <td className="p-4 text-sm text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs uppercase tracking-wide">{product.category}</span>
                                            </td>
                                            <td className="p-4 text-sm">₡{product.price.toLocaleString('es-CR')}</td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => toggleFeatured(product)}
                                                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${product.is_featured ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                                                    title={product.is_featured ? "Remove from Featured" : "Add to Featured"}
                                                >
                                                    <Star className={`w-5 h-5 ${product.is_featured ? 'fill-current' : ''}`} />
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenProductModal(product)} className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-gray-100 rounded-full text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
                <>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold font-serif">Inquiries</h2>
                        <button onClick={fetchMessages} className="text-xs uppercase tracking-widest hover:underline">Refresh</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4 w-1/3">Message</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {messages.map((msg) => {
                                    const date = new Date(msg.created_at).toLocaleDateString('es-CR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    
                                    return (
                                        <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors align-top">
                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{date}</td>
                                            <td className="p-4 font-medium">{msg.name}</td>
                                            <td className="p-4 text-sm text-blue-600">
                                              <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:underline">
                                                <Mail className="w-3 h-3" /> {msg.email}
                                              </a>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{msg.message}</td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500 italic">No messages found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. PRODUCT MODAL */}
      {isProductModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-gray-50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-gray-50 z-10">
                      <h2 className="text-xl font-bold font-serif text-black">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                      <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-black">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                      {/* ... (Existing Product Form Code) ... */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* Left Column: Image Management */}
                          <div className="space-y-4">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 flex justify-between items-center">
                                    <span>Product Gallery</span>
                                    {uploading && <span className="text-black flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading...</span>}
                                </label>
                                
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center group-hover:border-black transition-colors flex flex-col items-center gap-2">
                                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                        <span className="text-sm text-gray-500">Drag & Drop or Click to Upload</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {formData.images?.map((url, index) => (
                                        <div key={index} className="relative group bg-gray-100 aspect-square rounded-lg overflow-hidden border border-gray-200">
                                            <img src={url} className="w-full h-full object-cover" alt="Preview" />
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider font-bold shadow-md z-10">
                                                    Main
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                <div className="flex items-center gap-2 w-full justify-center">
                                                    {index > 0 && (
                                                        <button type="button" onClick={() => moveImage(index, 'left')} className="p-1 bg-white rounded-full hover:bg-gray-200 text-black">
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {index > 0 && (
                                                        <button type="button" onClick={() => setMainImage(index)} className="bg-white text-black px-2 py-1 rounded-full text-xs font-bold hover:bg-gray-200 flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> Main
                                                        </button>
                                                    )}
                                                    {index < (formData.images?.length || 0) - 1 && (
                                                         <button type="button" onClick={() => moveImage(index, 'right')} className="p-1 bg-white rounded-full hover:bg-gray-200 text-black">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => removeImage(index)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 flex items-center justify-center gap-1 mt-2">
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                          </div>

                          {/* Right Column: Details */}
                          <div className="space-y-6">
                              <div>
                                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Product Name</label>
                                  <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white text-black border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black transition-colors"
                                    required 
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-white text-black border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black transition-colors"
                                    >
                                        {['Anillo', 'Collar', 'Aretes', 'Conjunto'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Price (CRC)</label>
                                    <input 
                                        type="number" 
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full bg-white text-black border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black transition-colors"
                                        required 
                                    />
                                </div>
                              </div>
                              
                              <div>
                                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Description</label>
                                  <textarea 
                                    rows={6}
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-white text-black border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black resize-none transition-colors"
                                  ></textarea>
                              </div>

                              {/* Featured Toggle in Edit Form */}
                              <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                                  <button 
                                      type="button"
                                      onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_featured ? 'bg-black' : 'bg-gray-200'}`}
                                  >
                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                                  <span className="text-sm font-medium">Mark as Featured Product</span>
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                          <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors text-black">Cancel</button>
                          <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                              <Save className="w-4 h-4" /> Save Product
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;