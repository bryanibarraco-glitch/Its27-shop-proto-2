import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setProduct(data);
        if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0]);
        } else {
            setActiveImage(`https://picsum.photos/800/1000?random=${data.imageId}`);
        }
      } catch (err) {
        console.error("Failed to fetch product, using fallback", err);
        // Fallback to static data
        const staticProd = PRODUCTS.find(p => p.id === Number(id));
        setProduct(staticProd);
        if (staticProd) setActiveImage(`https://picsum.photos/800/1000?random=${staticProd.imageId}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-serif mb-4">Product not found</h1>
        <Link to="/shop" className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-50">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Determine images array
  const hasMultipleImages = product.images && product.images.length > 0;
  const images = hasMultipleImages 
    ? product.images 
    : [
        `https://picsum.photos/800/1000?random=${product.imageId}`,
        `https://picsum.photos/400/400?random=${product.imageId + 100}`,
        `https://picsum.photos/400/400?random=${product.imageId + 200}`
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Collection
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Product Image Gallery */}
        <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gray-50 aspect-[3/4] overflow-hidden relative">
                <img 
                    src={activeImage} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-300" 
                />
            </div>
            
            {/* Thumbnails */}
            {images && images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setActiveImage(img!)}
                            className={`aspect-square overflow-hidden cursor-pointer border-2 transition-all ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt={`Detail ${idx + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center space-y-8 sticky top-24 self-start">
           <div>
             <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">{product.name}</h1>
             
             <div className="flex items-center gap-4 mb-6">
                <p className="text-2xl font-light">
                  {product.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center gap-0.5 text-black">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-gray-400 text-xs ml-2">(24 reviews)</span>
                </div>
             </div>
           </div>
           
           <p className="text-gray-600 leading-relaxed font-light text-lg">
             {product.description || "Handcrafted with precision, this piece embodies the essence of Its27. Made from 100% recycled sterling silver, it features a unique texture that catches the light beautifully. Perfect for everyday wear or special occasions."}
           </p>

           <div className="pt-6 space-y-4">
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                >
                    Add to Cart <ArrowRight className="w-4 h-4" />
                </button>
           </div>
           
           <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Truck className="w-5 h-5 text-black" />
                  <span>Free shipping on orders over 5 items</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>Lifetime Warranty</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;