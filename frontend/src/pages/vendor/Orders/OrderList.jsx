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
  MoreVertical,
  ChevronLeft,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const tabs = ["All", "Pending", "Packed", "Dispatch Queue", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab]);

  // Debounced search
  useEffect(() => {
      const timer = setTimeout(() => {
          if (page === 1) fetchOrders();
          else setPage(1);
      }, 500);
      return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({
          page: page,
          status: activeTab,
          search: searchTerm
      });
      
      if (res.data.results) {
          setOrders(res.data.results);
          setTotalCount(res.data.count);
          setTotalPages(Math.ceil(res.data.count / 10));
      } else {
          setOrders(Array.isArray(res.data) ? res.data : []);
          setTotalCount(res.data.length || 0);
          setTotalPages(1);
      }
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
      case 'Dispatch Queue': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Packed': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Cancelled': return 'bg-slate-100 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight font-title italic uppercase">
            Order <span className="text-brand-blue">Command</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 italic">Manage, fulfill, and track your incoming customer orders.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-brand-blue/5 text-brand-blue px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic">
                {totalCount} Total Shipments
            </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/20 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text" 
                    placeholder="Search ORD# or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-blue transition-all outline-none placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  {tabs.map(tab => (
                      <button
                        key={tab}
                        onClick={() => {setActiveTab(tab); setPage(1);}}
                        className={clsx(
                            "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                            activeTab === tab 
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {tab}
                      </button>
                  ))}
                  <button 
                    onClick={() => {setSearchTerm(""); setActiveTab("All"); setPage(1);}}
                    className="p-3 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all ml-2"
                  >
                      <RotateCcw size={16} />
                  </button>
              </div>
          </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Details</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform border border-brand-blue/10">
                               <Package size={24} />
                           </div>
                           <div>
                               <div className="font-black text-slate-900 text-lg tracking-tight italic uppercase">ORD#{o.id}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                           </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="font-black text-slate-700 text-sm italic uppercase leading-none mb-1">{o.user?.first_name} {o.user?.last_name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[180px] italic">{o.address}</div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="text-lg font-black text-slate-900 tabular-nums italic">₹{o.total_price}</div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{o.payment_method}</div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={clsx(
                        "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        getStatusStyle(o.status)
                      )}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3">
                        {o.status === 'Pending' && (
                            <button 
                                onClick={() => handleUpdateStatus(o.id, 'Processing')}
                                className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Process Order
                            </button>
                        )}

                        {o.status === 'Processing' && (
                            <button 
                                onClick={() => handleUpdateStatus(o.id, 'Packed')}
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Mark Packed
                            </button>
                        )}
                        
                        {o.status === 'Packed' && (
                            <button 
                                onClick={() => handleSendToDispatch(o.id)}
                                className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Dispatch
                            </button>
                        )}

                        <button 
                          onClick={() => navigate(`/vendor/orders/${o.id}`)}
                          className="w-10 h-10 rounded-xl text-slate-300 hover:text-brand-blue hover:bg-brand-blue/5 flex items-center justify-center transition-all active:scale-90"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan="5" className="px-8 py-40 text-center">
                    <Box className="mx-auto h-20 w-20 text-slate-100 mb-6" strokeWidth={1} />
                    <h3 className="text-2xl font-black text-slate-900 font-title italic uppercase tracking-tighter">No Active Deployment</h3>
                    <p className="text-sm font-medium text-slate-400 mt-2 italic">Your order command is clear. No matching shipments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-10 py-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Operations Ledger {totalCount > 0 ? (page - 1) * 10 + 1 : 0} - {Math.min(page * 10, totalCount)} of {totalCount} Records
            </p>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={clsx(
                                "w-10 h-10 rounded-xl text-xs font-black transition-all",
                                page === i + 1 
                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                                    : "bg-white border border-slate-200 text-slate-500 hover:border-brand-blue/20"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
