import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart } from 'lucide-react';
import { productService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProductDetail(id);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product", err);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : [{ image: 'https://placehold.co/800' }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <motion.div
            layoutId={`image-${id}`}
            className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={images[activeImage].image}
                className="w-full h-full object-contain p-8"
              />
            </AnimatePresence>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-600 p-1' : 'border-transparent hover:border-slate-300'}`}
              >
                <img src={img.image} className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest mb-2">
              <span>{product.category_name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>In Stock: {product.stock}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-bold border border-amber-100">
                <Star size={16} fill="currentColor" />
                <span>{product.rating || '4.8'}</span>
              </div>
              <span className="text-slate-400 text-sm">128+ Reviews</span>
            </div>

            <div className="flex items-center gap-6 mb-8 pt-4 border-t border-slate-50">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Selling Price</span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">
                      ₹{(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price).toLocaleString()}
                    </span>
                    {product.discount_price && product.discount_price < product.price && (
                      <div className="flex flex-col">
                        <span className="text-xl text-slate-300 line-through font-bold">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm font-black text-emerald-500 uppercase tracking-tighter">{product.discount_percentage}% DIRECT SAVINGS</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 mt-auto">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">Quantity</span>
              <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => addToCart(product.id, quantity)}
                className="flex-grow bg-primary-600 hover:bg-primary-700 text-white h-16 rounded-[1.25rem] flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-primary-500/25 active:scale-95"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button className="w-16 h-16 bg-white border border-slate-200 rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95">
                <Heart size={24} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Fast Delivery</h4>
                  <p className="text-[10px] text-slate-500">2-4 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">2 Year Warranty</h4>
                  <p className="text-[10px] text-slate-500">Certified secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Easy Returns</h4>
                  <p className="text-[10px] text-slate-500">30 days money back</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
