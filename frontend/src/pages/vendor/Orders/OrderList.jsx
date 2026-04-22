import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Truck,
  Box,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  const tabs = ["All", "Pending", "Packed", "Ready for Dispatch", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders();
      setOrders(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleSendToDispatch = async (id) => {
    try {
       await adminService.initializeDispatch(id);
       fetchOrders();
       alert("Order sent to Dispatch Queue!");
    } catch (err) {
       alert(err.response?.data?.error || "Failed to initialize dispatch");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Dispatch Queue': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Packed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Cancelled': return 'bg-slate-100 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
        order.id.toString().includes(searchTerm) || 
        `${order.user?.first_name} ${order.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight font-title">
            Order <span className="text-brand-blue">Command</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage, fulfill, and track your incoming customer orders.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-brand-blue/5 text-brand-blue px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                {filteredOrders.length} Orders Found
            </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by ID or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-blue transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  {tabs.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0",
                            activeTab === tab 
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {tab}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan="5" className="px-8 py-10 bg-slate-50/20" />
                    </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                               <Package size={22} />
                           </div>
                           <div>
                               <div className="font-black text-slate-900 text-lg tracking-tight">#{o.id}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                           </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="font-black text-slate-700 text-sm">{o.user?.first_name} {o.user?.last_name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{o.address}</div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="font-black text-slate-900">₹{o.total_price}</div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{o.payment_method}</div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={clsx(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        getStatusStyle(o.status)
                      )}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center justify-end gap-2">
                        {o.status === 'Pending' && (
                            <button 
                                onClick={() => handleUpdateStatus(o.id, 'Processing')}
                                className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Mark Processing
                            </button>
                        )}

                        {o.status === 'Processing' && (
                            <button 
                                onClick={() => handleUpdateStatus(o.id, 'Packed')}
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Mark Packed
                            </button>
                        )}
                        
                        {o.status === 'Packed' && (
                            <button 
                                onClick={() => handleSendToDispatch(o.id)}
                                className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Send to Dispatch
                            </button>
                        )}

                        <button 
                          onClick={() => navigate(`/vendor/orders/${o.id}`)}
                          className="p-3 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <Box className="mx-auto h-16 w-16 text-slate-100 mb-4" />
                    <h3 className="text-xl font-black text-slate-400 font-title">No orders found</h3>
                    <p className="text-sm font-medium text-slate-300">Try adjusting your filters or search term.</p>
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

export default OrderList;
