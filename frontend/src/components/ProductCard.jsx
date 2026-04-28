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

  const calculateDiscount = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discount_price && product.discount_price < product.price) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return null;
  };

  const discount = calculateDiscount();

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={product.primary_image || product.images?.[0]?.image || 'https://placehold.co/400'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Action Buttons Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white/80 backdrop-blur-sm z-10">
          <div className="flex gap-2">
            <button 
              onClick={() => handleAddToCart(product.id)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide shadow-md transition-all active:scale-95"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <Link 
              to={`/products/${product.id}`}
              className="w-10 h-10 bg-white text-primary-600 border border-primary-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-primary-50 transition-all"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-[15px] font-medium text-slate-600 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[22px] font-bold text-slate-800 tracking-tight">
            ₹{Math.round(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price).toLocaleString('en-IN')}
          </span>

          {discount && (
            <>
              <span className="text-sm text-slate-400 line-through">
                ₹{Math.round(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-semibold text-brand-orange">
                {discount}% off
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-brand-orange text-white px-1.5 py-0.5 rounded text-xs font-bold">
            <span>{product.rating || '4.0'}</span>
            <Star size={10} fill="currentColor" strokeWidth={1} />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {product.reviews_count || '45669'} Reviews
          </span>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;