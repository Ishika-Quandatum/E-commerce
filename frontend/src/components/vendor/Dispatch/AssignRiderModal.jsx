import React from 'react';
import { X, Star, MapPin, UserCheck } from 'lucide-react';

const AssignRiderModal = ({ isOpen, onClose, riders, onAssign }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Assign Delivery Partner</h2>
            <p className="text-sm font-bold text-slate-400">Choose a rider for this delivery</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
          {riders.map((rider) => (
            <div 
              key={rider.id} 
              className="p-4 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group flex items-center gap-4 cursor-pointer"
              onClick={() => onAssign(rider.id)}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
                🏍️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 text-lg">{rider.user.username}</h4>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-black">
                     <Star size={14} fill="currentColor" /> 4.9
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                    <MapPin size={12} /> 2.4 KM away
                  </div>
                  <div className="text-[11px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-lg">
                    Active
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-2">Vehicle: {rider.vehicle_number}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <UserCheck size={20} />
              </div>
            </div>
          ))}

          {riders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 font-bold italic">No active riders available at this time.</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-3 text-sm font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
           >
             Cancel
           </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRiderModal;
