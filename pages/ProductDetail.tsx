import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, ShieldCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { supabase } from '../lib/supabaseClient';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
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

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const phoneNumber = "50686742604";
    const message = `Hola, estoy interesado en el producto: ${product.name} (₡${product.price}). ¿Está disponible?`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

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
        <h1 className="text-2xl font-serif mb-4">Producto no encontrado</h1>
        <Link to="/" className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:opacity-50">
          Volver al Catálogo
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
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
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
             
             <div className="mb-6">
                <p className="text-2xl font-light">
                  {product.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })}
                </p>
             </div>
           </div>
           
           <p className="text-gray-600 leading-relaxed font-light text-lg">
             {product.description || "Elaborada a mano con precisión, esta pieza encarna la esencia de Its27. Hecha de plata esterlina 100% reciclada, presenta una textura única que atrapa la luz maravillosamente. Perfecta para el uso diario o ocasiones especiales."}
           </p>

           <div className="pt-6">
                <button 
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-[#25D366] text-white py-4 uppercase tracking-[0.2em] hover:bg-[#20bd5a] active:scale-[0.99] transition-all flex items-center justify-center gap-3 font-bold"
                >
                    <MessageCircle className="w-5 h-5" /> Ordenar por WhatsApp
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Serás redirigido a WhatsApp para completar tu orden.
                </p>
           </div>
           
           <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Truck className="w-5 h-5 text-black" />
                  <span>Envíos a todo el país</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>Garantía de Por Vida</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;