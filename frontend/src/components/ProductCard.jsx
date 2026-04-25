import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      localStorage.setItem("pending_cart_product", productId);
      navigate("/login");
      return;
    }
    try {
      await addToCart(productId);
      alert("Added to cart successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
      
      <div className="relative aspect-square overflow-hidden bg-brand-soft-gray">
        <img 
          src={product.primary_image || product.images?.[0]?.image || 'https://placehold.co/400'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {product.discount_price && product.discount_price < product.price && (
          <div className="absolute top-4 left-4 bg-brand-pink text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-brand-pink/20 uppercase tracking-widest">
            {product.discount_percentage}% OFF
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <button 
              onClick={() => handleAddToCart(product.id)}
              className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-white h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-purple/20 transition-all active:scale-95"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <Link 
              to={`/products/${product.id}`}
              className="w-11 h-11 bg-brand-purple-light text-brand-purple rounded-xl flex items-center justify-center shadow-lg hover:bg-brand-purple hover:text-white transition-all"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="flex items-center gap-1 text-brand-orange mb-3">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-black">{product.rating || '4.5'}</span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-black text-brand-navy group-hover:text-brand-purple transition-colors line-clamp-1">{product.name}</h3>
        </Link>

        <p className="text-[10px] font-black text-brand-text-gray uppercase tracking-widest mt-1">{product.category_name}</p>

        <div className="flex items-baseline gap-2 mt-4">
          <span className="font-black text-brand-purple text-xl tracking-tighter">
            ₹{(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price).toLocaleString()}
          </span>

          {product.discount_price && product.discount_price < product.price && (
            <span className="line-through text-slate-300 text-sm font-bold">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;