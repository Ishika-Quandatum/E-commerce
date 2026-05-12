import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our shop to find something you'll love!
        </p>
        <Link
          to="/products"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary-500/30"
        >
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  const handleUpdateQuantity = (itemId, currentVal, change) => {
    const newVal = currentVal + change;
    if (newVal < 1) return;
    updateQuantity(itemId, newVal);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Shopping Cart</h1>
      <p className="text-slate-500 mb-10">Review your items and proceed to checkout.</p>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="flex-grow space-y-6">
          {cart.items.map((item) => {
            const product = item.product;
            const price = product.discount_price || product.price;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-28 h-28 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img
                      src={product.primary_image || "https://placehold.co/200"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow w-full text-center sm:text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                         <span className="bg-primary-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Mall</span>
                         <Link to={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">{product.name}</h3>
                         </Link>
                      </div>
                     
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                       <p className="text-lg font-black text-slate-900">₹{price}</p>
                       {product.discount_price && (
                         <p className="text-xs text-slate-400 line-through">₹{product.price}</p>
                       )}
                       {product.discount_percentage && (
                         <p className="text-xs font-bold text-orange-500">{product.discount_percentage}% Off</p>
                       )}
                    </div>

                    <p className="text-[11px] font-bold text-emerald-600 mb-3 flex items-center justify-center sm:justify-start gap-1">
                       All issue easy returns
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mb-4">
                      {item.size && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Size:</span>
                          <span className="text-[11px] font-black text-slate-700 uppercase">{item.size}</span>
                        </div>
                      )}
                      <div className="w-px h-3 bg-slate-200 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qty:</span>
                        <span className="text-[11px] font-black text-slate-700 uppercase">{item.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-6">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                      
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          className="px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-700">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          className="px-3 py-1 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal Desktop */}
                  <div className="hidden sm:block text-right pl-6 border-l border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                    <p className="text-xl font-black text-slate-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>

                {/* Sold By Footer */}
                <div className="mt-2 pt-3 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5">
                     <span className="text-[11px] text-slate-400 font-medium">Sold by:</span>
                     <span className="text-[11px] text-slate-900 font-bold hover:text-primary-600 cursor-pointer transition-colors">
                       {product.vendor_name || 'QuanStore Official'}
                     </span>
                   </div>
                   <div className="sm:hidden text-right">
                     <p className="text-sm font-black text-slate-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 lg:p-10 sticky top-24 shadow-2xl">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Subtotal ({cart.items.length} items)</span>
                <span className="font-bold">₹{parseFloat(cart.items.reduce((acc, i) => acc + (parseFloat(i.product.discount_price || i.product.price) * i.quantity), 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Shipping</span>
                <span className={`font-bold ${cart.items.reduce((acc, i) => acc + (parseFloat(i.product.shipping_charge || 0) * i.quantity), 0) > 0 ? 'text-slate-300' : 'text-green-400'}`}>
                  {cart.items.reduce((acc, i) => acc + (parseFloat(i.product.shipping_charge || 0) * i.quantity), 0) > 0 
                    ? `₹${parseFloat(cart.items.reduce((acc, i) => acc + (parseFloat(i.product.shipping_charge || 0) * i.quantity), 0)).toFixed(2)}` 
                    : 'Free'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Tax {cart?.items?.length === 1 && `(${parseFloat(cart.items[0].product.tax || 0)}%)`}</span>
                <span className="font-bold text-slate-300">₹{parseFloat(cart.items.reduce((acc, i) => {
                    const price = parseFloat(i.product.discount_price || i.product.price);
                    const taxRate = parseFloat(i.product.tax || 0);
                    return acc + (price * i.quantity * (taxRate / 100));
                }, 0)).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-slate-300">Grand Total</span>
                <span className="text-4xl font-extrabold flex items-start">
                  <span className="text-xl text-primary-400 mt-1 mr-1">₹</span>
                  {(
                    cart.items.reduce((acc, i) => acc + (parseFloat(i.product.discount_price || i.product.price) * i.quantity), 0) +
                    cart.items.reduce((acc, i) => acc + (parseFloat(i.product.shipping_charge || 0) * i.quantity), 0) +
                    cart.items.reduce((acc, i) => {
                        const price = parseFloat(i.product.discount_price || i.product.price);
                        const taxRate = parseFloat(i.product.tax || 0);
                        return acc + (price * i.quantity * (taxRate / 100));
                    }, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-600/30 text-lg"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
            <p className="text-center text-slate-400 text-sm mt-6 flex justify-center items-center gap-1">
              Guaranteed Safe & Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
