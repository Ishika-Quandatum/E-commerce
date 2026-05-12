import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const calculateDiscount = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discount_price && product.discount_price < product.price) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return null;
  };

  const discount = calculateDiscount();

  return (
    <div 
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={product.primary_image || product.images?.[0]?.image || 'https://placehold.co/400'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-[15px] font-medium text-slate-600 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
          {product.name}
        </h3>

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

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-brand-orange text-white px-1.5 py-0.5 rounded text-xs font-bold">
              <span>{parseFloat(product.rating || 0).toFixed(1)}</span>
              <Star size={10} fill="currentColor" strokeWidth={1} />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {product.reviews_count || 0} Reviews
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;