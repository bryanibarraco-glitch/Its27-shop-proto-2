import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, LogOut, Save, X, Image as ImageIcon } from 'lucide-react';
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
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Ring',
    price: 0,
    imageId: 101,
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
      setFormData(product);
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        category: 'Ring',
        price: 0,
        imageId: Math.floor(Math.random() * 100) + 100, // Random default image ID
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
    
    if (isEditing && formData.id) {
      // Update
      const { error } = await supabase
        .from('products')
        .update({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            "imageId": formData.imageId, // Quote strictly for camelCase column
            description: formData.description
        })
        .eq('id', formData.id);

      if (error) alert("Error updating product: " + error.message);
      else {
        fetchProducts();
        setIsModalOpen(false);
      }
    } else {
      // Create
      const { error } = await supabase
        .from('products')
        .insert([{
            name: formData.name,
            category: formData.category,
            price: formData.price,
            "imageId": formData.imageId,
            description: formData.description
        }]);

      if (error) alert("Error creating product: " + error.message);
      else {
        fetchProducts();
        setIsModalOpen(false);
      }
    }
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
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="w-12 h-12 bg-gray-100 overflow-hidden rounded-sm">
                                        <img src={`https://picsum.photos/100/100?random=${product.imageId}`} alt="" className="w-full h-full object-cover" />
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                      <h2 className="text-xl font-bold font-serif">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Product Name</label>
                              <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
                                required 
                              />
                          </div>

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
                          
                          <div className="md:col-span-2">
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Image ID (Picsum)
                              </label>
                              <div className="flex gap-4">
                                  <input 
                                    type="number" 
                                    value={formData.imageId}
                                    onChange={e => setFormData({...formData, imageId: Number(e.target.value)})}
                                    className="flex-1 border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
                                    required 
                                  />
                                  <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                                      {formData.imageId && <img src={`https://picsum.photos/200/200?random=${formData.imageId}`} className="w-full h-full object-cover" />}
                                  </div>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Using Picsum random IDs for demo. In production, use Supabase Storage buckets.</p>
                          </div>

                          <div className="md:col-span-2">
                              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Description</label>
                              <textarea 
                                rows={4}
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full border border-gray-300 p-3 rounded-sm focus:outline-none focus:border-black"
                              ></textarea>
                          </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
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