import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/api";
import { DollarSign, ShoppingBag, Box, TrendingUp, Package, Clock, ShieldAlert, CheckCircle, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import clsx from "clsx";

const VendorDashboard = () => {
  const { vendorStatus } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorStatus === 'Approved') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [vendorStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getOrders({ page: 1 })
      ]);
      
      setStats(statsRes.data);
      
      const ordersData = ordersRes.data.results || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error("Error fetching vendor dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'packed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (vendorStatus !== 'Approved') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce shadow-lg shadow-amber-200">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Verification Pending</h1>
          <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium italic">
            Our strategic commanders are currently reviewing your shop credentials. 
            Full command access will be granted upon authorization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto relative z-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Phase 01</div>
              <div className="flex items-center gap-2 text-emerald-600 font-black italic">
                <CheckCircle size={18} /> Submission
              </div>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-inner">
              <div className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Phase 02</div>
              <div className="flex items-center gap-2 text-amber-600 font-black italic">
                <Clock size={18} className="animate-spin-slow" /> Security Review
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 opacity-40 font-black text-slate-400 italic">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Phase 03</div>
              Market Entry
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-slate-900 tracking-tighter font-title uppercase italic">Command <span className="text-indigo-600">Center</span></h1>
          <p className="mt-1 text-slate-500 font-medium italic">Live telemetry and performance metrics for your enterprise.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operational</span>
             </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Net Revenue" 
            value={`₹${stats.total_revenue}`} 
            icon={<DollarSign />} 
            color="bg-emerald-50 text-emerald-600"
            link="/vendor/payments"
            linkText="Financial Ledger"
          />
          <StatCard 
            title="Total Deployments" 
            value={stats.total_orders} 
            icon={<ShoppingBag />} 
            color="bg-indigo-50 text-indigo-600"
            link="/vendor/orders"
            linkText="Order Command"
          />
          <StatCard 
            title="Catalog Size" 
            value={stats.total_products} 
            icon={<Box />} 
            color="bg-amber-50 text-amber-600"
            link="/vendor/products"
            linkText="Inventory Intelligence"
          />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white shadow-2xl shadow-slate-200/40 border border-slate-100 rounded-[3rem] overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Clock size={20} />
            </div>
            Recent Logistics
          </h3>
          <Link to="/vendor/orders" className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all">
            View Operations <ChevronRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => navigate(`/vendor/orders/${order.id}`)}>
                    <td className="px-10 py-7 whitespace-nowrap text-sm font-black text-indigo-600 italic">
                      #{order.id}
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm italic uppercase">{order.user?.first_name} {order.user?.last_name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{order.user?.email}</div>
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap text-lg font-black text-slate-900 tabular-nums italic">
                      ₹{order.total_price}
                    </td>
                    <td className="px-10 py-7 whitespace-nowrap text-right">
                      <span className={clsx(
                          "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                          getStatusColor(order.status)
                      )}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center">
                    <Package className="mx-auto h-16 w-16 text-slate-100 mb-4" strokeWidth={1} />
                    <p className="text-slate-400 font-black uppercase tracking-widest italic">No Operational History</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, color, link, linkText }) => (
    <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/30 group hover:scale-[1.02] transition-all relative overflow-hidden">
        <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-5 transition-transform group-hover:scale-150 duration-700 bg-current", color)} />
        <div className="flex items-start justify-between mb-8">
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", color)}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <Link to={link} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <ArrowUpRight size={20} />
            </Link>
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</h4>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50">
             <Link to={link} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{linkText}</Link>
        </div>
    </div>
);

export default VendorDashboard;
