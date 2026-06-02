import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { riderService } from "../../services/api";

const RiderDashboard = () => {
    const [stats, setStats] = useState({
        earnings: 0,
        new_tasks: 0,
        assigned_orders: 0,
        completed: 0,
        return_pickups: 0,
        rating: 5.0,
        online_riders_count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await riderService.getRiderDashboardStats();
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching rider dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statsCards = [
        { title: "New Tasks", value: stats.new_tasks || 0, icon: <Clock />, color: "bg-indigo-500", trend: "New Queue", isPositive: true },
        { title: "Assigned Orders", value: stats.assigned_orders || 0, icon: <Package />, color: "bg-brand-orange", trend: "Active Tasks", isPositive: false },
        { title: "Completed Orders", value: stats.completed || 0, icon: <CheckCircle />, color: "bg-emerald-500", trend: "Today", isPositive: true },
        { title: "Return Pickups", value: stats.return_pickups || 0, icon: <TrendingUp />, color: "bg-brand-blue", trend: "Active", isPositive: true },
    ];

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse p-6 md:p-10">
                <div className="h-12 bg-slate-100 rounded-2xl w-1/3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white h-40 rounded-[24px] border border-slate-100 shadow-sm" />
                    ))}
                </div>
                <div className="h-64 bg-white rounded-[32px] border border-slate-100 shadow-sm" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tight font-title">
                        Rider <span className="text-brand-purple font-black">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Welcome back! Here's your performance for today.</p>
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
        </div>
    );
};

export default RiderDashboard;
