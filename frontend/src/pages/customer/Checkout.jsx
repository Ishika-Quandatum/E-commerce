import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/api';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    payment_method: 'UPI',
    card_name: '',
    card_number: ''
  });

  const subtotal = cart?.total ? parseFloat(cart.total) : 0;
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.placeOrder({
        address: formData.address,
        phone: formData.phone,
        payment_method: formData.payment_method,
        total_price: total
      });
      setSuccess(true);
      await fetchCart();
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      console.error("Order failed", err);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Order Placed Successfully!</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">Thank you for your purchase. Your order has been received and is being processed. Redirecting to your profile...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold mb-10 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Checkout Form */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-10">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Shipping Info */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Shipping Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address</label>
                  <textarea
                    required
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:ring-2 ring-primary-500/20 outline-none transition-all"
                    placeholder="Enter your full street address, city, state, zip"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input
                    required
                    type="tel"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 h-14 focus:ring-2 ring-primary-500/20 outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Payment Selection</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['UPI / Card', 'Cash on Delivery'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: method })}
                    className={`flex items-center justify-center h-16 rounded-2xl border-2 font-bold transition-all ${formData.payment_method === method ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </section>

            <button
  disabled={loading}
  type="submit"
  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-primary-500/25 active:scale-95"
>
  {loading
    ? "Processing..."
    : formData.payment_method === "Cash on Delivery"
      ? "Place Order"
      : `Pay $${total.toFixed(2)} Now`
  }
</button>
          </form>
        </div>

        {/* Order Preview */}
        <aside>
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl sticky top-24">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar mb-8">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                    <img
  src={
    item.product?.primary_image
      ? item.product.primary_image
      : "https://via.placeholder.com/150"
  }
  alt={item.product?.name}
  className="w-full h-full object-cover"
/>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-sm">
  ${((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)}
</div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/10">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-black text-primary-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
              <div className="w-10 h-10 flex items-center justify-center bg-primary-400/20 text-primary-400 rounded-lg">
                <Truck size={20} />
              </div>
              <div className="text-xs">
                <p className="font-bold">Next-Day Delivery</p>
                <p className="text-slate-400">Order in next 3h 45m</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
