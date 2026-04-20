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
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.primary_image || product.images?.[0]?.image || 'https://placehold.co/400'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {product.discount_price && product.discount_price < product.price && (
          <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/30 uppercase tracking-tighter">
            {product.discount_percentage}% OFF
          </div>
        )}

        {/* Buttons */}
        <div className="absolute bottom-4 left-0 right-0 px-4 transition-transform">
          <div className="flex gap-2">
            
            <button 
              onClick={() => handleAddToCart(product.id)}
              className="flex-1 bg-white hover:bg-blue-600 hover:text-white h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-lg"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>

            <Link 
              to={`/products/${product.id}`}
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg"
            >
              <Eye size={18} />
            </Link>

          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-yellow-400 mb-2">
          <Star size={14} fill="currentColor" />
          <span className="text-xs">{product.rating || '4.5'}</span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold">{product.name}</h3>
        </Link>

        <p className="text-sm text-gray-500">{product.category_name}</p>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-black text-slate-900 text-lg">
            ₹{(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price).toLocaleString()}
          </span>

          {product.discount_price && product.discount_price < product.price && (
            <span className="line-through text-slate-300 text-xs font-bold">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;