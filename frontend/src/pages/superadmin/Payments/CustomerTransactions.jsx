import React, { useState, useEffect } from "react";
import { paymentService } from "../../../services/api";
import { Search, Filter, FileText, ArrowLeft, Download, CreditCard, Clock, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments({
        search: searchTerm,
        status: statusFilter === "All" ? "" : statusFilter
      });
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch customer transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Refunded': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Failed': return <XCircle size={14} />;
      case 'Refunded': return <RefreshCcw size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Transactions</h1>
            <p className="text-slate-500 font-medium">Full ledger of store inflows and order payments.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
            <Download size={18} /> Export Reports
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search TXN ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {['All', 'Completed', 'Pending', 'Failed'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-indigo-600"></div>
                      <span className="font-bold text-slate-400">Loading ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-indigo-600 uppercase tracking-tighter text-sm italic">{t.transaction_id || `TXN-${t.id}`}</td>
                    <td className="px-8 py-6">
                       <span className="font-bold text-slate-900 capitalize block">{t.customer_name || t.username}</span>
                       <span className="text-[11px] font-medium text-slate-500 block">{t.customer_email || 'No Email'}</span>
                       {t.customer_phone && <span className="text-[10px] font-bold text-slate-400 tracking-wider">📞 {t.customer_phone}</span>}
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">#{t.order_id}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <CreditCard size={14} className="text-slate-400" />
                          {t.method === 'cod' ? 'Cash on Delivery' : 
                           t.method === 'card' ? 'Credit/Debit Card' :
                           t.method === 'upi' ? 'UPI' :
                           t.method === 'netbanking' ? 'Net Banking' : t.method}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-900">₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(t.status)}`}>
                          {getStatusIcon(t.status)} {t.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <FileText size={32} />
                       </div>
                       <p className="text-lg font-bold text-slate-900">No transactions found</p>
                       <p className="text-slate-500 text-sm">No payment records match your current criteria.</p>
                    </div>
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

export default CustomerTransactions;
