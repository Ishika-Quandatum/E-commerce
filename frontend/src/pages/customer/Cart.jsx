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
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative"
              >
                <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={product.primary_image || "https://placehold.co/200"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow w-full text-center sm:text-left">
                  <Link to={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm font-semibold text-slate-400 mb-4">{product.category_name}</p>

                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors font-bold"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors font-bold"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                      title="Remove Item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="w-full sm:w-auto text-center sm:text-right mt-4 sm:mt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0">
                  <p className="text-sm font-semibold text-slate-500 mb-1">Subtotal</p>
                  <p className="text-2xl font-extrabold text-slate-900 flex items-center justify-center sm:justify-end gap-1">
                    <span className="text-lg text-slate-400 font-medium">$</span>
                    {parseFloat(item.subtotal).toFixed(2)}
                  </p>
                  {product.discount_price && (
                    <span className="inline-block mt-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                      Discount Applied
                    </span>
                  )}
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
                <span className="font-medium">Total Items ({cart.item_count})</span>
                <span className="font-bold">${parseFloat(cart.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Shipping</span>
                <span className="font-bold text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Tax</span>
                <span className="font-bold text-slate-400">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-slate-300">Total</span>
                <span className="text-4xl font-extrabold flex items-start">
                  <span className="text-xl text-primary-400 mt-1 mr-1">$</span>
                  {parseFloat(cart.total).toFixed(2)}
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
