import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, CheckCircle, ArrowLeft, Plus, X, Home, Briefcase, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService, addressService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState('address'); // address, payment

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const [formData, setFormData] = useState({
    payment_method: 'upi',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      setAddresses(res.data);
      const defaultAddr = res.data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr);
      else if (res.data.length > 0) setSelectedAddress(res.data[0]);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addressService.createAddress(newAddress);
      setAddresses([...addresses, res.data]);
      setSelectedAddress(res.data);
      setShowNewAddressForm(false);
      setShowAddressModal(false);
    } catch (err) {
      console.error("Failed to add address", err);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart?.total ? parseFloat(cart.total) : 0;
  const shipping = cart?.total_shipping ? parseFloat(cart.total_shipping) : 0;
  const tax = cart?.total_tax ? parseFloat(cart.total_tax) : 0;
  const total = cart?.grand_total ? parseFloat(cart.grand_total) : (subtotal + shipping + tax);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    setLoading(true);
    try {
      const addressString = `${selectedAddress.full_name}, ${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}. Phone: ${selectedAddress.phone}`;
      await orderService.placeOrder({
        address: addressString,
        phone: selectedAddress.phone,
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Checkout Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center gap-2`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep === 'address' ? 'bg-brand-purple text-white scale-110 shadow-lg shadow-brand-purple/20' : 'bg-brand-purple/10 text-brand-purple'}`}>
              1
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</span>
          </div>
          <div className="w-16 h-1 bg-slate-100 rounded-full">
            <div className={`h-full bg-brand-purple rounded-full transition-all duration-500 ${currentStep === 'payment' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex flex-col items-center gap-2`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep === 'payment' ? 'bg-brand-purple text-white scale-110 shadow-lg shadow-brand-purple/20' : 'bg-slate-100 text-slate-400'}`}>
              2
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment</span>
          </div>
          <div className="w-16 h-1 bg-slate-100 rounded-full" />
          <div className={`flex flex-col items-center gap-2`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-slate-100 text-slate-400`}>
              3
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Review</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => currentStep === 'payment' ? setCurrentStep('address') : navigate('/cart')}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-purple font-bold mb-10 transition-colors"
      >
        <ArrowLeft size={20} /> {currentStep === 'payment' ? 'Back to Address' : 'Back to Cart'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Checkout Content */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-10">
            {currentStep === 'address' ? (
              <motion.section
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Delivery Address</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-brand-purple/5 text-brand-purple rounded-lg text-sm font-bold hover:bg-brand-purple/10 transition-all"
                  >
                    {selectedAddress ? 'Change' : 'Select Address'}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="bg-white border-2 border-brand-purple/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <CheckCircle className="text-brand-purple" size={24} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                        <Home size={18} />
                      </div>
                      <h4 className="font-bold text-slate-900">{selectedAddress.full_name}</h4>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      {selectedAddress.street_address}, {selectedAddress.city}, <br />
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>{selectedAddress.phone}</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-brand-purple hover:bg-brand-purple/5 hover:text-brand-purple transition-all group"
                  >
                    <Plus size={48} className="group-hover:scale-110 transition-all" />
                    <span className="font-bold uppercase tracking-widest text-sm">Add New Address</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => selectedAddress && setCurrentStep('payment')}
                  disabled={!selectedAddress}
                  className="w-full mt-12 bg-brand-purple text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-brand-purple/25 active:scale-95 disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </motion.section>
            ) : (
              <motion.section
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Payment Selection</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    { id: 'upi', label: 'UPI / Card' },
                    { id: 'cod', label: 'Cash on Delivery' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: method.id })}
                      className={`flex items-center justify-center h-16 rounded-2xl border-2 font-bold transition-all ${formData.payment_method === method.id ? 'border-brand-purple bg-brand-purple/5 text-brand-purple' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-10">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-brand-purple" />
                    Review Delivery Address
                  </h4>
                  <div className="text-sm text-slate-500">
                    <p className="font-bold text-slate-700">{selectedAddress?.full_name}</p>
                    <p>{selectedAddress?.street_address}</p>
                    <p>{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-brand-purple hover:bg-brand-purple/90 disabled:bg-slate-300 text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl shadow-brand-purple/25 active:scale-95"
                >
                  {loading
                    ? "Processing..."
                    : formData.payment_method === "cod"
                      ? "Place Order"
                      : `Pay ₹${total.toFixed(2)} Now`
                  }
                </button>
              </motion.section>
            )}
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
      : "https://placehold.co/150"
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
  ₹{((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)}
</div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/10">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-black text-primary-400">₹{total.toFixed(2)}</span>
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

      {/* Address Selection Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-2xl font-bold text-slate-900">Select Address</h3>
                <button onClick={() => setShowAddressModal(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-all"><X size={20} /></button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {showNewAddressForm ? (
                  <form onSubmit={handleAddAddress} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                        <input required className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" value={newAddress.full_name} onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                        <input required className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Street Address</label>
                      <textarea required rows="3" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple resize-none" value={newAddress.street_address} onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input required placeholder="City" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                      <input required placeholder="State" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                      <input required placeholder="Pincode" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setShowNewAddressForm(false)} className="flex-1 h-14 border border-slate-200 rounded-2xl font-bold text-slate-500">Cancel</button>
                      <button type="submit" disabled={loading} className="flex-1 h-14 bg-brand-purple text-white rounded-2xl font-bold shadow-lg shadow-brand-purple/20">Save Address</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressModal(false);
                        }}
                        className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-brand-purple bg-brand-purple/5' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900">{addr.full_name}</h4>
                          {addr.is_default && <span className="text-[10px] bg-brand-purple text-white px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{addr.street_address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm font-bold text-slate-400">{addr.phone}</p>
                      </div>
                    ))}
                    <button 
                      onClick={() => setShowNewAddressForm(true)}
                      className="w-full h-20 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-3 text-slate-400 hover:text-brand-purple hover:border-brand-purple transition-all font-bold"
                    >
                      <Plus size={20} /> Add New Address
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
