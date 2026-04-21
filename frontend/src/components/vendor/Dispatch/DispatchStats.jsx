import React from 'react';
import { Package, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-200 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{subtext}</span>
    </div>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{count}</h3>
    <p className="text-sm font-bold text-slate-400 mt-1">{title}</p>
  </div>
);

const DispatchStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard 
        title="New Orders" 
        count={stats.new_orders || 0} 
        icon={Package} 
        color="bg-indigo-600" 
        subtext="PENDING"
      />
      <StatCard 
        title="Packed Items" 
        count={stats.packed_orders || 0} 
        icon={CheckCircle} 
        color="bg-amber-500" 
        subtext="READY"
      />
      <StatCard 
        title="To Dispatch" 
        count={stats.ready_to_dispatch || 0} 
        icon={Clock} 
        color="bg-emerald-500" 
        subtext="URGENT"
      />
      <StatCard 
        title="Out for Delivery" 
        count={stats.out_for_delivery || 0} 
        icon={Truck} 
        color="bg-blue-600" 
        subtext="ACTIVE"
      />
      <StatCard 
        title="Delivered Today" 
        count={stats.delivered_today || 0} 
        icon={AlertCircle} 
        color="bg-rose-500" 
        subtext="COMPLETED"
      />
    </div>
  );
};

export default DispatchStats;
