import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, LogOut, Save, X, Image as ImageIcon, Upload, Loader2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../data/products';

const Admin: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard State
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Ring',
    price: 0,
    imageId: 101,
    images: [],
    description: ''
  });

  // 1. Check Auth on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProducts();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProducts();
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Products
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
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
  };

  // 4. CRUD Functions
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData({
          ...product,
          images: product.images || [] // Ensure array exists
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        category: 'Ring',
        price: 0,
        imageId: Math.floor(Math.random() * 100) + 100, 
        images: [],
        description: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert("Error deleting product");
      console.error(error);
    } else {
      fetchProducts();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        "imageId": formData.imageId,
        description: formData.description,
        images: formData.images
    };

    if (isEditing && formData.id) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', formData.id);

      if (error) alert("Error updating product: " + error.message);
      else {
        fetchProducts();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) alert("Error creating product: " + error.message);
      else {
        fetchProducts();
        setIsModalOpen(false);
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
            // Sanitize filename to prevent errors with spaces/special chars
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `${Date.now()}-${cleanName}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                alert(`Upload failed for ${file.name}. Reason: ${uploadError.message}`);
                continue;
            }

            const { data } = supabase.storage.from('products').getPublicUrl(filePath);
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
        // Clear input to allow re-uploading same file if needed
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
              // Swap with previous
              [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
          } else if (direction === 'right' && index < newImages.length - 1) {
              // Swap with next
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
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Logged in as {session.user.email}</p>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm uppercase tracking-wider"
            >
                <LogOut className="w-4 h-4" /> Log Out
            </button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <Package className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
            </div>
             <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <LayoutDashboard className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Management Status</p>
                    <p className="text-xl font-bold text-green-600">Active</p>
                </div>
            </div>
        </div>

        {/* Products Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif">Inventory</h2>
                <button 
                    onClick={() => handleOpenModal()}
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
                            <th className="p-4">Price (CRC)</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => {
                             // Display Logic: Use first image in array, or fallback to picsum
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
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full text-red-600 transition-colors"
                                            >
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
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-bold font-serif">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* Left Column: Image Management */}
                          <div className="space-y-4">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 flex justify-between items-center">
                                    <span>Product Gallery</span>
                                    {uploading && <span className="text-black flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading...</span>}
                                </label>
                                
                                {/* Upload Button */}
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center group-hover:border-black transition-colors flex flex-col items-center gap-2">
                                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                        <span className="text-sm text-gray-500">Drag & Drop or Click to Upload</span>
                                    </div>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {formData.images?.map((url, index) => (
                                        <div key={index} className="relative group bg-gray-100 aspect-square rounded-lg overflow-hidden border border-gray-200">
                                            <img src={url} className="w-full h-full object-cover" alt="Preview" />
                                            
                                            {/* Top Left Badge (Main) */}
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider font-bold shadow-md z-10">
                                                    Main
                                                </div>
                                            )}

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                <div className="flex items-center gap-2 w-full justify-center">
                                                    {index > 0 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => moveImage(index, 'left')}
                                                            className="p-1 bg-white rounded-full hover:bg-gray-200 text-black"
                                                            title="Move Left"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    {index > 0 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setMainImage(index)}
                                                            className="bg-white text-black px-2 py-1 rounded-full text-xs font-bold hover:bg-gray-200 flex items-center gap-1"
                                                        >
                                                            <Star className="w-3 h-3" /> Main
                                                        </button>
                                                    )}

                                                    {index < (formData.images?.length || 0) - 1 && (
                                                         <button 
                                                            type="button"
                                                            onClick={() => moveImage(index, 'right')}
                                                            className="p-1 bg-white rounded-full hover:bg-gray-200 text-black"
                                                            title="Move Right"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 flex items-center justify-center gap-1 mt-2"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {(!formData.images || formData.images.length === 0) && (
                                        <div className="col-span-2 text-center py-4 text-xs text-gray-400 italic bg-gray-50 rounded-lg">
                                            No images uploaded yet. Showing placeholder in store.
                                        </div>
                                    )}
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
                                    className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
                                    required 
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
                                    >
                                        {['Necklace', 'Ring', 'Earrings', 'Set'].map(c => (
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
                                        className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
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
                                    className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black resize-none"
                                  ></textarea>
                              </div>

                              <div className="bg-gray-50 p-4 rounded text-xs text-gray-500">
                                  <p className="flex items-center gap-2 mb-1"><ImageIcon className="w-3 h-3"/> Legacy Support</p>
                                  <p>Internal ID: {formData.imageId} (Used if no images uploaded)</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={uploading}
                            className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
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