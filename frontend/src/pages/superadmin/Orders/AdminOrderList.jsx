import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Search, MoreVertical } from "lucide-react";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'shipped': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'processing': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'pending': return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case 'cancelled': return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Order <span className="text-indigo-600 not-italic uppercase tracking-normal">Nexus</span></h1>
          <p className="mt-1 text-slate-500 font-medium lowercase">Cross-platform fulfillment tracking and reconciliation.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Trace order ID..." className="outline-none text-sm font-medium w-40" />
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Volume</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] italic tracking-tighter shadow-lg shadow-slate-900/10 uppercase">
                           #{order.id.toString().slice(-4)}
                        </div>
                        <div className="text-xs font-black text-slate-900 font-mono">QS-{order.id.toString().padStart(8, '0')}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800">{order.user?.name || "Anonymous User"}</div>
                    <div className="text-[10px] font-black tracking-widest uppercase text-slate-400">{order.shipping_address?.city || "Global Shipping"}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                        <Clock size={14} className="text-indigo-400" />
                        {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900">₹{order.total_price}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                        {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button className="text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderList;
