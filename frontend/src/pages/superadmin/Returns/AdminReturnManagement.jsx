import React, { useState, useEffect } from 'react';
import { returnService } from '../../../services/api';
import { Search, Filter, RotateCcw, Eye, CheckCircle2, ShieldAlert, BarChart3, TrendingDown, Users, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReturnManagement = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    refunded: 0
  });

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await returnService.getReturnRequests({ 
        status: filterStatus,
        search: searchTerm 
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReturns(data);
      
      // Basic stats calculation
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'Return Requested').length,
        approved: data.filter(r => r.status === 'Approved').length,
        refunded: data.filter(r => r.status === 'Refund Completed').length
      });
    } catch (err) {
      console.error("Error fetching returns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const handleRefundApproval = async (id) => {
    if (!window.confirm("Are you sure you want to approve this refund? This will credit the customer's wallet.")) return;
    try {
      await returnService.updateReturnStatus(id, { 
        status: 'Refund Completed', 
        description: 'Refund approved and processed by Super Admin' 
      });
      fetchReturns();
    } catch (err) {
      alert("Failed to process refund");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title">
            Return <span className="text-brand-purple">Center</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor and manage all product returns across the platform.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", value: stats.total, icon: <Package />, color: "bg-blue-50 text-blue-600" },
          { label: "Pending Review", value: stats.pending, icon: <RotateCcw />, color: "bg-amber-50 text-amber-600" },
          { label: "Approved Pickups", value: stats.approved, icon: <CheckCircle2 />, color: "bg-indigo-50 text-indigo-600" },
          { label: "Refunded Amount", value: `₹${returns.reduce((acc, r) => r.status === 'Refund Completed' ? acc + parseFloat(r.refund_amount) : acc, 0)}`, icon: <TrendingDown />, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Customer, or Vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
             <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-6 text-xs font-black uppercase tracking-widest outline-none"
             >
                <option value="">All Statuses</option>
                <option value="Return Requested">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Refund Processing">Processing Refund</option>
                <option value="Refund Completed">Refunded</option>
             </select>
             <button onClick={fetchReturns} className="h-12 bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-purple transition-all">
                Refresh
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Vendor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">Fetching return data...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">No return requests found.</td></tr>
              ) : returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">#RET-{ret.id.toString().padStart(5, '0')}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Order #ORD-{ret.order}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 italic underline decoration-rose-300 underline-offset-4">{ret.customer_name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase mt-2">Vendor: {ret.vendor_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-brand-purple italic">₹{ret.refund_amount}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      ret.status === 'Refund Completed' ? 'bg-emerald-100 text-emerald-600' :
                      ret.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       {ret.status === 'Refund Processing' || (ret.status === 'Delivered to Vendor' && ret.refund_method === 'Wallet') ? (
                          <button 
                            onClick={() => handleRefundApproval(ret.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-600/20"
                          >
                            Approve Refund
                          </button>
                       ) : (
                          <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm">
                            <Eye size={16} />
                          </button>
                       )}
                       <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <ShieldAlert size={16} />
                       </button>
                    </div>
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

export default AdminReturnManagement;
