import React from 'react';
import { X, Star, MapPin, UserCheck, Search, Zap } from 'lucide-react';
import clsx from 'clsx';

const AssignRiderModal = ({ isOpen, onClose, riders, onAssign }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-title">Select <span className="text-brand-blue">Delivery Partner</span></h2>
            <p className="text-sm font-bold text-slate-400 mt-1">Assign an active rider to fulfill this shipment.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all relative z-10 group">
            <X size={24} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>
        </div>

        <div className="bg-slate-50/50 p-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text" 
                    placeholder="Search available riders..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                />
            </div>
        </div>

        <div className="p-6 max-h-[450px] overflow-y-auto space-y-4 custom-scrollbar">
          {riders.map((rider) => (
            <div 
              key={rider.id} 
              className="p-5 rounded-[2.5rem] bg-white border border-slate-100 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group flex items-center gap-6 cursor-pointer"
              onClick={() => onAssign(rider.id)}
            >
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-brand-blue transition-colors">
                <span className="text-2xl group-hover:scale-125 transition-transform">🏍️</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black text-slate-900 text-lg group-hover:text-brand-blue transition-colors truncate">{rider.user.username}</h4>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                     <Star size={12} fill="currentColor" /> 4.9
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">
                    <MapPin size={12} className="text-brand-blue" /> 
                    Nearby
                  </div>
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
                </div>
                
                <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                    <Zap size={10} className="text-brand-orange" />
                    VEHICLE: <span className="text-slate-600">{rider.vehicle_number || "LOGI-7721"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2.5xl bg-slate-50 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-inner">
                <UserCheck size={24} />
              </div>
            </div>
          ))}

          {riders.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <UserCheck size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">No active partners found nearby</p>
                <p className="text-[10px] text-slate-300 font-medium mt-1 uppercase">Try refreshing the rider queue</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between">
           <button 
             onClick={onClose}
             className="px-8 py-3 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
           >
             Cancel
           </button>
           <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                Refresh Riders
           </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRiderModal;
