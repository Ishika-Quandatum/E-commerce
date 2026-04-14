import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.primary_image || product.images?.[0]?.image || 'https://via.placeholder.com/400'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {product.discount_price && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{Math.round((1 - product.discount_price / product.price) * 100)}% OFF
          </div>
        )}
        
        <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button 
              onClick={() => addToCart(product.id)}
              className="flex-1 bg-white hover:bg-primary-600 hover:text-white text-slate-900 h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-lg transition-all active:scale-95"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
            <Link 
              to={`/products/${product.id}`}
              className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center shadow-lg transition-all"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 text-amber-400 mb-2">
          <Star size={14} fill="currentColor" />
          <span className="text-xs font-bold text-slate-500">{product.rating || '4.5'}</span>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mb-3">{product.category_name}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            ${product.discount_price || product.price}
          </span>
          {product.discount_price && (
            <span className="text-sm text-slate-400 line-through">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
