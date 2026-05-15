import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, MapPin, CheckCircle, ArrowLeft, Plus, X, Home, Briefcase, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService, addressService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '../../context/PlatformContext';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { settings } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const directItem = location.state?.directCheckoutItem;
  const itemsToRender = directItem ? [directItem] : (cart?.items || []);
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
    alternative_phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  const [formData, setFormData] = useState({
    payment_method: 'upi',
    upiId: '',
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const getAvailablePaymentMethods = () => {
    if (!settings || !itemsToRender) return [];

    const methods = [];
    
    // Check if ALL products allow a specific method
    const allAllowRazorpay = itemsToRender.every(item => item.product.allow_razorpay !== false);
    const allAllowPaypal = itemsToRender.every(item => item.product.allow_paypal !== false);
    const allAllowCOD = itemsToRender.every(item => item.product.allow_cod !== false);
    const allAllowWallet = itemsToRender.every(item => item.product.allow_wallet !== false);

    if (settings.payment_razorpay && allAllowRazorpay) {
      methods.push({ 
        id: 'upi', 
        label: 'UPI Payment', 
        description: 'Pay using Google Pay, PhonePe, or Paytm',
        icon: <div className="flex -space-x-1">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600 border border-white">G</div>
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[8px] font-black text-purple-600 border border-white">P</div>
          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[8px] font-black text-sky-600 border border-white">Py</div>
        </div>
      });
      methods.push({ 
        id: 'card', 
        label: 'Credit / Debit Card', 
        description: 'All major cards supported',
        icon: <CreditCard size={18} className="text-blue-500" />
      });
    }

    if (settings.payment_paypal && allAllowPaypal) {
      methods.push({ 
        id: 'paypal', 
        label: 'PayPal', 
        description: 'Secure international payments',
        icon: <CreditCard size={18} className="text-blue-600" />
      });
    }

    if (settings.payment_cod && allAllowCOD) {
      methods.push({ 
        id: 'cod', 
        label: 'Cash on Delivery', 
        description: 'Pay in cash or QR during delivery',
        icon: <Truck size={18} className="text-emerald-500" />
      });
    }

    if (settings.payment_wallet && allAllowWallet) {
      methods.push({ 
        id: 'wallet', 
        label: 'Wallet Payment', 
        description: 'Pay using your account balance',
        icon: <Briefcase size={18} className="text-amber-500" />
      });
    }

    return methods;
  };

  const availableMethods = getAvailablePaymentMethods();

  useEffect(() => {
    if (availableMethods.length > 0 && !availableMethods.find(m => m.id === formData.payment_method)) {
      setFormData(prev => ({ ...prev, payment_method: availableMethods[0].id }));
    }
  }, [availableMethods]);

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

  const subtotal = itemsToRender.reduce((acc, item) => acc + (parseFloat(item.product.discount_price || item.product.price) * item.quantity), 0) || 0;
  const shipping = itemsToRender.reduce((acc, item) => acc + (parseFloat(item.product.shipping_charge || 0) * item.quantity), 0) || 0;
  const tax = itemsToRender.reduce((acc, item) => {
    const price = parseFloat(item.product.discount_price || item.product.price);
    const taxRate = parseFloat(item.product.tax || 0);
    return acc + (price * item.quantity * (taxRate / 100));
  }, 0) || 0;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    setLoading(true);
    try {
      const addressString = `${selectedAddress.full_name}, ${selectedAddress.street_address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}. Phone: ${selectedAddress.phone}${selectedAddress.alternative_phone ? ` (Alt: ${selectedAddress.alternative_phone})` : ''}`;
      
      const payload = {
        address: addressString,
        phone: selectedAddress.phone,
        alternative_phone: selectedAddress.alternative_phone,
        payment_method: formData.payment_method,
        total_price: total
      };

      if (directItem) {
        payload.product_id = directItem.product.id;
        payload.quantity = directItem.quantity;
        payload.size = directItem.size;
      }

      await orderService.placeOrder(payload);
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
                      {selectedAddress.alternative_phone && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{selectedAddress.alternative_phone}</span>
                        </>
                      )}
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
                  <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Select Payment Method</h3>
                </div>

                <div className="space-y-4 mb-10">
                  {availableMethods.length > 0 ? availableMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => setFormData({ ...formData, payment_method: method.id })}
                      className={`group cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                        formData.payment_method === method.id 
                          ? 'border-brand-purple bg-brand-purple/5 shadow-md shadow-brand-purple/5' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.payment_method === method.id ? 'border-brand-purple' : 'border-slate-200'
                          }`}>
                            {formData.payment_method === method.id && (
                              <div className="w-3 h-3 rounded-full bg-brand-purple animate-in zoom-in duration-300" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold transition-colors ${formData.payment_method === method.id ? 'text-brand-purple' : 'text-slate-800'}`}>
                              {method.label}
                            </h4>
                            <p className="text-xs text-slate-500">{method.description}</p>
                          </div>
                        </div>
                        {method.icon}
                      </div>

                      {/* Conditional Form Rendering inside the selection card */}
                      <AnimatePresence mode="wait">
                        {formData.payment_method === method.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 20 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-brand-purple/10">
                              {method.id === 'upi' && (
                                <div className="space-y-4">
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Enter UPI ID (VPA)</label>
                                  <div className="relative">
                                    <input 
                                      type="text"
                                      placeholder="username@bank"
                                      className="w-full h-14 pl-4 pr-12 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-purple font-medium"
                                      value={formData.upiId}
                                      onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                      <CheckCircle size={20} className={formData.upiId.includes('@') ? 'text-emerald-500' : ''} />
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-slate-400">Example: 9876543210@paytm, name@okhdfcbank</p>
                                </div>
                              )}

                              {method.id === 'card' && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Holder Name</label>
                                    <input 
                                      type="text"
                                      placeholder="John Doe"
                                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-purple font-medium"
                                      value={formData.cardHolder}
                                      onChange={(e) => setFormData({...formData, cardHolder: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                                    <input 
                                      type="text"
                                      placeholder="0000 0000 0000 0000"
                                      maxLength="19"
                                      className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-purple font-medium"
                                      value={formData.cardNumber}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                        setFormData({...formData, cardNumber: val});
                                      }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
                                      <input 
                                        type="text"
                                        placeholder="MM / YY"
                                        maxLength="5"
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-purple font-medium text-center"
                                        value={formData.expiryDate}
                                        onChange={(e) => {
                                          let val = e.target.value.replace(/\D/g, '');
                                          if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                                          setFormData({...formData, expiryDate: val});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVV</label>
                                      <input 
                                        type="password"
                                        placeholder="***"
                                        maxLength="3"
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-purple font-medium text-center"
                                        value={formData.cvv}
                                        onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                                {method.id === 'cod' && (
                                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    <p className="text-sm font-medium text-emerald-800">You can pay using Cash, UPI, or Cards at the time of delivery.</p>
                                  </div>
                                )}

                                {method.id === 'wallet' && (
                                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                    <CheckCircle size={18} className="text-amber-500" />
                                    <p className="text-sm font-medium text-amber-800">Payment will be deducted from your account balance.</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )) : (
                      <div className="p-8 bg-rose-50 border-2 border-dashed border-rose-100 rounded-[2rem] text-center">
                        <p className="text-rose-600 font-bold">No compatible payment methods available for the items in your cart.</p>
                        <p className="text-rose-400 text-xs mt-1">Please contact support or check platform availability.</p>
                      </div>
                    )}
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
                  disabled={loading || (formData.payment_method === 'upi' && !formData.upiId.includes('@')) || (formData.payment_method === 'card' && formData.cardNumber.length < 16)}
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
              {itemsToRender.map((item) => (
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
                    {item.size && (
                      <p className="text-[10px] text-primary-400 font-bold uppercase mt-0.5">Size: {item.size}</p>
                    )}
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
                <span>Tax {cart?.items?.length === 1 && `(${parseFloat(cart.items[0].product.tax || 0)}%)`}</span>
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
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alternative Phone (Optional)</label>
                      <input className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-purple" placeholder="Backup number for delivery" value={newAddress.alternative_phone} onChange={(e) => setNewAddress({...newAddress, alternative_phone: e.target.value})} />
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
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                          <span>{addr.phone}</span>
                          {addr.alternative_phone && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{addr.alternative_phone}</span>
                            </>
                          )}
                        </div>
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
