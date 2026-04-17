import React, { useState, useEffect } from "react";
import { Users, Store, Package, ShoppingBag, TrendingUp, DollarSign, Activity, Clock } from "lucide-react";
import { adminService } from "../../../services/api";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    total_vendors: 0,
    total_products: 0,
    total_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { name: "Total Revenue", value: `₹${metrics.total_revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Live Total" },
    { name: "Active Vendors", value: metrics.total_vendors.toString(), icon: Store, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Total Registered" },
    { name: "Total Products", value: metrics.total_products.toString(), icon: Package, color: "text-amber-600", bg: "bg-amber-50", trend: "Active Items" },
    { name: "Total Orders", value: metrics.total_orders.toString(), icon: ShoppingBag, color: "text-rose-600", bg: "bg-rose-50", trend: "All Time" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium">Real-time metrics for QuanStore platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700`} />
            <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative shadow-inner shadow-white`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="relative">
              <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{stat.name}</div>
              <div className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <TrendingUp size={14} /> {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
