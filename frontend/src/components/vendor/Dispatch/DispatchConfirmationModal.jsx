import React, { useState } from 'react';
import { X, Package, Printer, FileText, CheckSquare, Weight } from 'lucide-react';

const DispatchConfirmationModal = ({ isOpen, onClose, shipment, onConfirm }) => {
  const [weight, setWeight] = useState('');
  const [isPacked, setIsPacked] = useState(false);

  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative h-40 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
          <div className="absolute top-8 left-8 text-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-indigo-500 rounded text-[10px] font-black uppercase tracking-widest">Confirmation</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">Ready to Dispatch?</h2>
            <p className="text-slate-400 font-bold">Review and confirm parcel details for Order #{shipment.order_id}</p>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10">
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14} /> Shipping Manifest
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Tracking No.</span>
                  <span className="text-sm font-black text-slate-800 tracking-tighter">{shipment.tracking_number.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Customer</span>
                  <span className="text-sm font-black text-slate-800">{shipment.customer_name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-slate-500">Address</span>
                  <span className="text-[10px] font-black text-slate-700 text-right uppercase tracking-wider max-w-[150px] leading-relaxed">
                    {shipment.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 py-3 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all">
                  <Printer size={16} /> Print Label
               </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Weight size={14} /> Parcel Weight (kg)
              </label>
              <input 
                type="number" 
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <label className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 cursor-pointer group">
               <div className="mt-1">
                 <input 
                   type="checkbox" 
                   checked={isPacked}
                   onChange={(e) => setIsPacked(e.target.checked)}
                   className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                 />
               </div>
               <span className="text-sm font-bold text-amber-800 leading-snug">
                  I confirm that the items have been packed correctly and are ready for pickup.
               </span>
            </label>

            <button 
              disabled={!isPacked || !weight}
              onClick={() => onConfirm(weight)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
            >
              <Package size={20} />
              CONFIRM DISPATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchConfirmationModal;
