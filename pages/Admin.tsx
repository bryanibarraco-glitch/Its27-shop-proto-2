import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit2, LogOut, Save, X, Image as ImageIcon, Upload, Loader2, Star, ChevronLeft, ChevronRight, ShoppingBag, Eye, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../data/products';

// Interface for Order Data
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  products?: Product; // Joined data
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_email?: string; // ADDED: Optional email field
  customer_phone: string;
  province: string;
  canton: string;
  district: string;
  address: string;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  order_items?: OrderItem[];
}

const Admin: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Ring',
    price: 0,
    imageId: 101,
    images: [],
    description: ''
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
          fetchOrders();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          fetchProducts();
          fetchOrders();
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

  const fetchOrders = async () => {
    // Note: This requires Foreign Keys to be set up in Supabase:
    // order_items.order_id -> orders.id
    // order_items.product_id -> products.id
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                quantity,
                price_at_purchase,
                products ( name, images )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching orders:', error);
    else setOrders((data as any) || []);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
      const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      
      if (error) {
          alert("Failed to update status");
      } else {
          fetchOrders();
          if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
          }
      }
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
    setOrders([]);
  };

  // 4. Product CRUD
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setFormData({
          ...product,
          images: product.images || []
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

  const handleSaveProduct = async (e: React.FormEvent) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    <ShoppingBag className="w-6 h-6 text-black" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                </div>
            </div>
             <div className="bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Pending Orders</p>
                    <p className="text-2xl font-bold text-orange-500">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
             <button 
                onClick={() => setActiveTab('products')}
                className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
             >
                 Products
             </button>
             <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
             >
                 Orders
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

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold font-serif">Recent Orders</h2>
                        <button onClick={fetchOrders} className="text-xs uppercase tracking-widest hover:underline">Refresh</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const date = new Date(order.created_at).toLocaleDateString('es-CR');
                                    let statusColor = "bg-gray-100 text-gray-600";
                                    if(order.status === 'shipped') statusColor = "bg-blue-100 text-blue-800";
                                    if(order.status === 'delivered') statusColor = "bg-green-100 text-green-800";
                                    if(order.status === 'cancelled') statusColor = "bg-red-100 text-red-800";
                                    if(order.status === 'pending') statusColor = "bg-yellow-100 text-yellow-800";

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-mono text-sm">#{order.id}</td>
                                            <td className="p-4 text-sm text-gray-500">{date}</td>
                                            <td className="p-4 font-medium">{order.customer_name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs uppercase tracking-wide font-bold ${statusColor}`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-bold">₡{order.total_amount.toLocaleString('es-CR')}</td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="flex items-center gap-1 text-xs uppercase tracking-widest bg-black text-white px-3 py-1.5 ml-auto hover:bg-gray-800"
                                                >
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">No orders found.</td>
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
              <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-bold font-serif">{isEditing ? 'Edit Product' : 'New Product'}</h2>
                      <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
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
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center group-hover:border-black transition-colors flex flex-col items-center gap-2">
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
                          </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                          <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors">Cancel</button>
                          <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                              <Save className="w-4 h-4" /> Save Product
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* 2. ORDER DETAILS MODAL */}
      {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <div>
                        <h2 className="text-xl font-bold font-serif">Order #{selectedOrder.id}</h2>
                        <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-8 flex-1">
                      
                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                          <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Customer</p>
                              <p className="font-bold">{selectedOrder.customer_name}</p>
                              {selectedOrder.customer_email && <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>}
                              <p className="text-sm">{selectedOrder.customer_phone}</p>
                          </div>
                          <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Shipping Address</p>
                              <p className="text-sm leading-relaxed">
                                  {selectedOrder.address}<br/>
                                  {selectedOrder.district}, {selectedOrder.canton}<br/>
                                  {selectedOrder.province}
                              </p>
                          </div>
                          <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Payment</p>
                              <p className="text-sm font-medium uppercase">{selectedOrder.payment_method.replace('_', ' ')}</p>
                          </div>
                          <div>
                              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total</p>
                              <p className="text-lg font-bold">₡{selectedOrder.total_amount.toLocaleString('es-CR')}</p>
                          </div>
                      </div>

                      {/* Items List */}
                      <div>
                          <h3 className="text-sm uppercase tracking-widest font-bold border-b border-gray-200 pb-2 mb-4">Items Purchased</h3>
                          <div className="space-y-4">
                              {selectedOrder.order_items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                          <img 
                                            src={item.products?.images?.[0] || `https://picsum.photos/100/100?random=${item.product_id}`} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                          />
                                      </div>
                                      <div className="flex-1">
                                          <p className="font-medium text-sm">{item.products?.name || `Product #${item.product_id}`}</p>
                                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="text-sm font-medium">
                                          ₡{(item.price_at_purchase * item.quantity).toLocaleString('es-CR')}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Footer / Actions */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 uppercase tracking-widest">Current Status:</span>
                          <span className="font-bold uppercase">{selectedOrder.status}</span>
                      </div>
                      
                      <div className="flex gap-2">
                          {selectedOrder.status === 'pending' && (
                              <button 
                                onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                                className="bg-blue-600 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-blue-700 rounded-sm flex items-center gap-2"
                              >
                                  <Truck className="w-4 h-4" /> Mark as Shipped
                              </button>
                          )}
                           {selectedOrder.status === 'shipped' && (
                              <button 
                                onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                                className="bg-green-600 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-green-700 rounded-sm flex items-center gap-2"
                              >
                                  <CheckCircle className="w-4 h-4" /> Mark Delivered
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Admin;