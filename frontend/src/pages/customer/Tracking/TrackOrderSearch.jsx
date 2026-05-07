import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRight, Truck, CheckCircle2, Timer, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const TrackOrderSearch = () => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter a valid Order ID');
      return;
    }
    setError('');
    // Redirect to the detail tracking page
    navigate(`/tracking/${orderId}`);
  };

  const steps = [
    { icon: <Package size={24} />, title: "Order Placed", desc: "We've received your order" },
    { icon: <Timer size={24} />, title: "Processing", desc: "Your order is being prepared" },
    { icon: <Truck size={24} />, title: "In Transit", desc: "Your package is on its way" },
    { icon: <CheckCircle2 size={24} />, title: "Delivered", desc: "Order reached its destination" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-brand-navy pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-purple/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 text-brand-purple font-black uppercase tracking-[0.3em] text-[10px] mb-4">
             <MapPin size={14} /> Real-time Logistics
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
            Track Your <span className="text-brand-purple">Order</span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Enter your order tracking number to see the current status of your delivery and live GPS location of your package.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        {/* Search Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-12 mb-12"
        >
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-purple transition-colors">
                <Search size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g., ORD-12345)"
                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-none rounded-[2rem] text-lg font-bold text-slate-900 focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all placeholder:text-slate-300"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            
            {error && <p className="text-rose-500 text-sm font-bold ml-6">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-brand-navy text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-brand-purple transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
            >
              Track Order <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-50">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 font-black">?</div>
                   <p className="text-xs font-bold uppercase tracking-widest">Where can I find my order ID?</p>
                </div>
                <p className="text-[10px] font-medium max-w-xs text-center md:text-right">
                  Your order ID was sent to your registered email address and is also available in your profile under "My Orders".
                </p>
             </div>
          </div>
        </motion.div>

        {/* Informational Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {steps.map((step, idx) => (
             <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-brand-purple group-hover:text-white transition-all duration-500">
                   {step.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{step.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderSearch;
