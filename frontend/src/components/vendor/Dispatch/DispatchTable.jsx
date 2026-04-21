import React from 'react';
import { Search, Filter, MoreVertical, Truck, Printer, UserPlus, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const DispatchTable = ({ 
  shipments, 
  onAssignRider, 
  onDispatch, 
  onUpdateStatus,
  onPrintLabel
}) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Packed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Ready for Dispatch': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-colors uppercase tracking-widest">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rider</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shipments.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <span className="font-black text-slate-900 tracking-tighter text-lg">#{s.order_id}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-700 text-sm">{s.product_summary}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-900 text-sm">{s.customer_name}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{s.address}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={clsx(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    getStatusStyle(s.status)
                  )}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {s.rider ? (
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase">{s.rider.user.username.slice(0,2)}</div>
                       <span className="font-bold text-slate-700 text-sm">{s.rider.user.username}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Unassigned</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    {s.status === 'Pending' && (
                      <button 
                        onClick={() => onUpdateStatus(s.id, 'Packed')}
                        className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                        title="Mark as Packed"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    
                    {s.status === 'Packed' && (
                      <button 
                         onClick={() => onUpdateStatus(s.id, 'Ready for Dispatch')}
                         className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                         title="Ready for Dispatch"
                      >
                        <Truck size={18} />
                      </button>
                    )}

                    {s.status === 'Ready for Dispatch' && (
                      <button 
                         onClick={() => onAssignRider(s.id)}
                         className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                         title="Assign Rider"
                      >
                        <UserPlus size={18} />
                      </button>
                    )}

                    {s.status === 'Assigned' && (
                      <button 
                         onClick={() => onDispatch(s)}
                         className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
                      >
                         Confirm Dispatch
                      </button>
                    )}

                    {s.label_printed && (
                       <button 
                          onClick={() => onPrintLabel(s)}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors"
                          title="Print Label"
                       >
                         <Printer size={18} />
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchTable;
