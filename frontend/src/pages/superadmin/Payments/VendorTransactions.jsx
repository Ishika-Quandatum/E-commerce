import React, { useState, useEffect } from "react";
import { paymentService } from "../../../services/api";
import { Search, Filter, FileText, ArrowLeft, Download, Wallet, Clock, CheckCircle2, XCircle, Percent, ArrowUpRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorTransactions = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getVendorPayouts({
        status: statusFilter === "All" ? "" : statusFilter
      });
      setPayouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch vendor payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const handleMarkPaid = async (id) => {
    if (window.confirm("Mark this payout as paid? Ensure you have completed the bank transfer/UPI payment.")) {
        try {
            await paymentService.updatePayoutStatus(id);
            fetchPayouts();
        } catch (err) {
            console.error("Failed to update payout status");
        }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Transactions</h1>
            <p className="text-slate-500 font-medium">Manage merchant payouts and commission settlements.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
            <Download size={18} /> Financial Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Percent size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Payout Logic</p>
                <p className="text-xs font-bold text-slate-900 leading-none mt-0.5">Final = Sale Amount - Commission</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {['All', 'Paid', 'Pending'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200'}`}
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
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Amount</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Commission</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Final Payable</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-indigo-600"></div>
                      <span className="font-bold text-slate-400">Fetching payout logs...</span>
                    </div>
                  </td>
                </tr>
              ) : payouts.length > 0 ? (
                payouts.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{p.vendor_name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order #{p.order_id}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-bold text-slate-500 line-through decoration-rose-400/50 decoration-2">₹{p.product_amount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-black mb-1">-{p.commission_rate}%</span>
                            <span className="text-xs font-black text-rose-600">-₹{p.commission_amount.toLocaleString()}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-indigo-600 font-black text-base italic tracking-tighter">
                          <Wallet size={16} strokeWidth={3} /> ₹{p.final_amount.toLocaleString()}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(p.status)}`}>
                          {p.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {p.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       {p.status === 'Pending' ? (
                           <button 
                             onClick={() => handleMarkPaid(p.id)}
                             className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                           >
                              <Check size={14} strokeWidth={3} /> Settle Payout
                           </button>
                       ) : (
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                               <Check size={12} strokeWidth={3} /> Settled {p.payout_date ? `on ${new Date(p.payout_date).toLocaleDateString()}` : ''}
                           </div>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <ArrowUpRight size={32} />
                       </div>
                       <p className="text-lg font-bold text-slate-900">No payout pending</p>
                       <p className="text-slate-500 text-sm">Merchant settlements are all up to date.</p>
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

export default VendorTransactions;
