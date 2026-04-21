import React, { useState } from 'react';
import { X, Package, Printer, FileText, CheckSquare, Weight, Info } from 'lucide-react';
import clsx from 'clsx';

const DispatchConfirmationModal = ({ isOpen, onClose, shipment, onConfirm }) => {
  const [weight, setWeight] = useState('');
  const [isPacked, setIsPacked] = useState(false);

  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="relative h-44 bg-slate-900 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 to-brand-orange/20" />
          <div className="absolute top-10 left-10 text-white z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-brand-blue rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-brand-blue/30">
                <CheckSquare size={10} /> Final Manifest Verification
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight font-title">Confirm <span className="text-brand-orange">Dispatch</span></h2>
            <p className="text-slate-400 font-bold mt-1">Reviewing logistics data for Parcel #{shipment.tracking_number?.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all z-10 group backdrop-blur-md">
            <X size={24} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white">
          <div className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-brand-blue/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} className="text-brand-blue" /> Parcel Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Order ID</span>
                  <span className="text-sm font-black text-slate-900 tracking-tighter">#{shipment.order_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Customer</span>
                  <span className="text-sm font-black text-slate-900 font-title">{shipment.customer_name}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Shipping Address</p>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed truncate-2">
                    {shipment.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-brand-blue/5 rounded-3xl border border-brand-blue/10 flex items-start gap-4">
                <Info size={20} className="text-brand-blue shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-brand-blue/70 leading-relaxed">
                    Verify all items are secured and the shipping label is clearly visible on the main packaging.
                </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Weight size={14} className="text-brand-orange" /> Actual Weight (KG)
              </label>
              <div className="relative group">
                  <input 
                    type="number" 
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter parcel weight..."
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] text-xl font-black text-slate-900 placeholder:text-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-200 text-sm group-focus-within:text-brand-blue transition-colors">KG</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
                <label className={clsx(
                    "flex items-start gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer select-none",
                    isPacked ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                )}>
                   <div className="mt-0.5">
                     <input 
                       type="checkbox" 
                       checked={isPacked}
                       onChange={(e) => setIsPacked(e.target.checked)}
                       className="w-5 h-5 rounded-lg border-slate-300 text-brand-blue focus:ring-brand-blue transition-all" 
                     />
                   </div>
                   <span className={clsx(
                       "text-[11px] font-bold leading-relaxed uppercase tracking-tighter",
                       isPacked ? "text-emerald-700" : "text-slate-500"
                   )}>
                      I confirm the parcel is packed and ready for active delivery assignment.
                   </span>
                </label>

                <button 
                  disabled={!isPacked || !weight}
                  onClick={() => onConfirm(weight)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-base shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Package size={20} className="relative z-10" />
                  <span className="relative z-10 uppercase tracking-widest font-black">Finalize & Dispatch</span>
                </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
             <button 
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-blue transition-colors"
                onClick={() => alert("Manifest labels are generated automatically on dispatch.")}
            >
                <Printer size={16} /> Print Labels Preview
            </button>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Fulfillment Protocol v4.2</p>
        </div>
      </div>
    </div>
  );
};

export default DispatchConfirmationModal;
