import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  MapPin, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { adminService } from "../../services/api";

const RiderDashboard = () => {
    const [stats, setStats] = useState({
        earnings: 125.50,
        completed: 12,
        pending: 3,
        distance: "42.8 km",
        rating: 4.9
    });
    const [loading, setLoading] = useState(false);

    const statsCards = [
        { title: "Today Earnings", value: `$${stats.earnings}`, icon: <TrendingUp />, color: "bg-emerald-500", trend: "+12.5%", isPositive: true },
        { title: "Completed", value: stats.completed, icon: <CheckCircle />, color: "bg-brand-blue", trend: "+2 today", isPositive: true },
        { title: "Pending", value: stats.pending, icon: <Package />, color: "bg-brand-orange", trend: "Needs detail", isPositive: false },
        { title: "Distance", value: stats.distance, icon: <MapPin />, color: "bg-indigo-500", trend: "+5km last trip", isPositive: true },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tight font-title">
                        Rider <span className="text-brand-blue">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Welcome back! Here's your performance for today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                {i}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-600">3 Riders nearby</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(card.icon, { size: 22 })}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${card.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {card.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {card.trend}
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">{card.title}</h3>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Widgets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Activity (Map Placeholder) */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[450px]">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-title">Live Service Map</h3>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                             Rider Online
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                        {/* Placeholder for map */}
                        <div className="absolute inset-0 bg-[#f1f5f9] flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                            <MapPin size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-lg text-slate-500">Service Coverage Active</p>
                            <p className="text-sm">Leaflet Map will be initialized here.</p>
                        </div>
                    </div>
                </div>

                {/* Performance & Ratings */}
                <div className="space-y-6">
                    <div className="bg-brand-blue rounded-[32px] p-8 text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-lg font-bold mb-6 opacity-80">Rider Rating</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-5xl font-black">{stats.rating}</div>
                            <div className="flex flex-col">
                                <div className="flex text-brand-orange">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill={i <= 4 ? "#F97316" : "transparent"} strokeWidth={2} />)}
                                </div>
                                <span className="text-xs font-bold opacity-70">Top 5% Service</span>
                            </div>
                        </div>
                        <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm font-bold transition-all active:scale-95">
                            View Feedback
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black font-title">Quick Actions</h3>
                            <Clock size={18} className="text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {['Active Tasks', 'Earnings History', 'Vehicle Status'].map((action, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand-blue">{action}</span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Recent Orders Summary */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black font-title">Recent Delivery Activity</h3>
                    <button className="text-brand-blue font-bold text-sm">View All Orders</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-slate-50">
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Order ID</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Customer</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Time</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-right">Earning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: '#ORD-9281', name: 'Alaxander G.', time: '10:45 AM', earn: '$12.00' },
                                { id: '#ORD-8172', name: 'Sophia R.', time: '09:30 AM', earn: '$8.50' },
                                { id: '#ORD-7261', name: 'Markus K.', time: 'Yesterday', earn: '$15.00' },
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 px-4 text-sm font-bold text-slate-900">{row.id}</td>
                                    <td className="py-5 px-4 text-sm font-medium text-slate-600">{row.name}</td>
                                    <td className="py-5 px-4 text-sm font-medium text-slate-400">{row.time}</td>
                                    <td className="py-5 px-4 text-sm font-black text-emerald-600 text-right">{row.earn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
