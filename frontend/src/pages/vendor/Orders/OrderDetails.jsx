import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../../services/api";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Box,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrderDetail(id);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      if (newStatus === 'Dispatch Queue') {
          await adminService.initializeDispatch(id);
          alert("Order sent to Dispatch Queue!");
      } else {
          await adminService.updateOrderStatus(id, newStatus);
      }
      fetchOrder();
    } catch (err) {
      console.error("Failed to update status", err);
      alert(err.response?.data?.error || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-brand-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
        <div className="max-w-xl mx-auto py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <Box size={48} className="mx-auto text-slate-100" />
            <h3 className="text-xl font-black text-slate-400">Order not found.</h3>
            <button onClick={() => navigate('/vendor/orders')} className="text-brand-blue font-black uppercase text-xs tracking-widest hover:underline">Return to Registry</button>
        </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Dispatch Queue': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Packed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Cancelled': return 'bg-slate-100 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const steps = [
      { id: 'Pending', label: 'Received' },
      { id: 'Processing', label: 'Processing' },
      { id: 'Packed', label: 'Packed' },
      { id: 'Dispatch Queue', label: 'Dispatch Queue' },
      { id: 'Shipped', label: 'In Transit' },
      { id: 'Delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* Action Bar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
            <button
                onClick={() => navigate('/vendor/orders')}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
                <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title">
                        Order <span className="text-brand-blue">#{order.id}</span>
                    </h1>
                    <span className={clsx(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        getStatusStyle(order.status)
                    )}>
                        {order.status || 'Pending'}
                    </span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-400">
                    Transmission Timestamp: {new Date(order.created_at).toLocaleString()}
                </p>
            </div>
        </div>

        {/* Dynamic Multi-Step Actions */}
        <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-3">
             {order.status === 'Pending' && (
                 <button 
                    onClick={() => handleStatusUpdate('Processing')}
                    disabled={updating}
                    className="flex items-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
                 >
                    {updating ? <Zap size={16} className="animate-spin" /> : <Zap size={16} />} 
                    Commence Processing
                 </button>
             )}

             {order.status === 'Processing' && (
                 <button 
                    onClick={() => handleStatusUpdate('Packed')}
                    disabled={updating}
                    className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                 >
                    {updating ? <CheckCircle2 size={16} className="animate-spin" /> : <Box size={16} />} 
                    Finalize Packing
                 </button>
             )}

             {order.status === 'Packed' && (
                 <button 
                    onClick={() => handleStatusUpdate('Dispatch Queue')}
                    disabled={updating}
                    className="flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all"
                 >
                    {updating ? <Zap size={16} className="animate-spin" /> : <Truck size={16} />} 
                    Send to Dispatch Queue
                 </button>
             )}

             {['Dispatch Queue', 'Shipped', 'Delivered'].includes(order.status) && (
                 <button 
                    onClick={() => navigate('/vendor/dispatch')}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:scale-105 transition-all"
                 >
                    <Truck size={16} /> Track Fulfillment
                 </button>
             )}
        </div>
      </div>

      {/* Fulfillment Progress Tracker */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-4">
               {steps.map((step, idx) => (
                   <div key={step.id} className="flex flex-col items-center text-center gap-3">
                       <div className={clsx(
                           "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                           idx <= currentStepIndex ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30" : "bg-slate-50 text-slate-300 border border-slate-100"
                       )}>
                           {idx < currentStepIndex ? <CheckCircle2 size={20} /> : <div className="text-xs font-black uppercase">{idx + 1}</div>}
                       </div>
                       <div className="space-y-1">
                           <p className={clsx(
                               "text-[10px] font-black uppercase tracking-widest",
                               idx <= currentStepIndex ? "text-slate-900" : "text-slate-300"
                           )}>{step.label}</p>
                           {idx === currentStepIndex && <div className="h-1 w-4 bg-brand-blue mx-auto rounded-full" />}
                       </div>
                   </div>
               ))}
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Content: Registry & Analytics */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Order Manifest (Items) */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-title">Fulfillment <span className="text-brand-blue">Manifest</span></h3>
              <div className="px-4 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {order.items?.length || 0} Line Items
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-8 group flex items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 bg-white rounded-3xl p-2 flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {item.product?.primary_image ? (
                        <img src={item.product.primary_image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Package className="text-slate-200" size={32} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-brand-blue transition-colors">
                          {item.product?.name || `Fulfillment Unit #${idx + 1}`}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                      <p className="text-xs font-bold text-brand-orange mt-2">Unit Price: ₹{item.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 tracking-tighter">₹{item.price * item.quantity}</div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Commission Inclusive</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-slate-900 text-white">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Settlement Total</p>
                    <h4 className="text-sm font-bold opacity-80">Inclusive of all logistics taxes</h4>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-white tracking-tighter">₹{order.total_price}</span>
                    <div className="flex items-center justify-end gap-2 text-brand-orange mt-1">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Protected</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registry: Operational Sidebar */}
        <div className="space-y-10">
          {/* Dispatch Target Card */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-brand-blue" /> Dispatch Target
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Address</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                  {order.address || "Registry entry missing address data."}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Gateway Email</p>
                          <p className="text-xs font-bold text-slate-900 truncate">{order.user?.email}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Phone size={18} />
                      </div>
                      <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Verified Contact</p>
                          <p className="text-xs font-bold text-slate-900">{order.phone || "+91-XXXXXXXXXX"}</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Logistics Intelligence Preview */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 opacity-80">
                   <Truck size={18} className="text-brand-orange" /> Fulfillment Log
               </h3>
               <div className="space-y-6">
                   <div className="flex items-start gap-4">
                       <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shadow-[0_0_15px_rgba(29,78,216,0.5)]" />
                       <div>
                           <p className="text-[10px] font-black uppercase tracking-tighter opacity-50">Received At</p>
                           <p className="text-xs font-bold">{new Date(order.created_at).toLocaleTimeString()}</p>
                       </div>
                   </div>
                   <div className="flex items-start gap-4">
                       <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5" />
                       <div>
                           <p className="text-[10px] font-black uppercase tracking-tighter opacity-50">Estimated Payout</p>
                           <p className="text-xs font-bold text-emerald-400">₹{order.total_price} (Pending Delivery)</p>
                       </div>
                   </div>
               </div>
               <button 
                onClick={() => navigate('/vendor/dispatch')}
                className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
               >
                   Open Tracking Terminal <ArrowRight size={14} />
               </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
