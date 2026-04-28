import React, { useState, useEffect } from "react";
import { paymentService } from "../../../services/api";
import { 
  Search, 
  Filter, 
  FileText, 
  ArrowLeft, 
  Download, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  ArrowUpRight, 
  Check,
  ShieldCheck,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

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
        status: statusFilter === "All" ? "" : statusFilter,
        search: searchTerm
      });
      setPayouts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch vendor payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayouts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchTerm]);

  const handleMarkPaid = async (id) => {
    if (window.confirm("Confirm Settlement? This will record the transfer as completed and notify the vendor.")) {
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
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const totals = {
      pending: payouts.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + parseFloat(curr.final_amount), 0),
      settled: payouts.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + parseFloat(curr.final_amount), 0),
      commission: payouts.reduce((acc, curr) => acc + parseFloat(curr.commission_amount), 0)
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-medium text-slate-900 tracking-tight font-title italic">Vendor <span className="text-brand-blue not-italic">Settlements</span></h1>
            <p className="text-slate-500 font-normal mt-1">Merchant payout registry and financial distribution logs.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white" />)}
           </div>
           <div className="pr-4 border-r border-slate-100">
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-1">Active Merchants</p>
               <p className="text-sm font-medium text-slate-900">12 Vendors Syncing</p>
           </div>
           <button className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-medium text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all">
                Export Ledger
           </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-blue">
                      <Wallet size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">Pending Settlement</p>
                      <h4 className="text-4xl font-medium tracking-tighter">₹{totals.pending.toLocaleString()}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-medium uppercase tracking-widest">
                       <ShieldCheck size={16} /> Awaiting Delivered Proof
                  </div>
              </div>
          </div>
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand-blue">
                  <CreditCard size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Total Settled</p>
                  <h4 className="text-4xl font-medium tracking-tighter text-slate-900">₹{totals.settled.toLocaleString()}</h4>
              </div>
              <div className="text-[10px] font-normal text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} /> Updated Real-time
              </div>
          </div>
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Platform Revenue</p>
                  <h4 className="text-4xl font-medium tracking-tighter text-slate-900">₹{totals.commission.toLocaleString()}</h4>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-medium uppercase tracking-widest">
                   +12% Yield This Week
              </div>
          </div>
      </div>

      {/* Registry Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <input 
                type="text" 
                placeholder="Search by Order ID or Vendor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-brand-blue outline-none transition-all"
             />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {['All', 'Paid', 'Pending', 'Failed'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                    "px-8 py-3.5 rounded-2xl text-[10px] font-medium uppercase tracking-widest transition-all shrink-0",
                    statusFilter === f 
                        ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
                        : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
                )}
              >
                {f} Payouts
              </button>
            ))}
          </div>
      </div>

      {/* Settlement Registry Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Target Merchant</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Registry ID</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Net Settlement</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-900">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse bg-slate-50/20"><td colSpan="5" className="h-24" /></tr>)
              ) : payouts.length > 0 ? (
                payouts.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-blue font-medium text-lg group-hover:scale-110 transition-transform">
                                {p.vendor_name?.slice(0,1).toUpperCase()}
                            </div>
                            <div>
                                <span className="font-medium text-slate-900 font-title tracking-tight">{p.vendor_name}</span>
                                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">Verified Merchant Partner</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest mb-1">TRANSACTION ORIGIN</span>
                            <span className="font-medium text-slate-700 tracking-tighter">ORD-{p.order_id}</span>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                        <div className="inline-flex flex-col items-center bg-rose-50/50 px-4 py-2 rounded-2xl border border-rose-100">
                            <span className="text-[9px] font-medium text-rose-400 uppercase mb-1">-{p.commission_rate}% FEE</span>
                            <span className="text-sm font-medium text-rose-600 leading-none">-₹{p.commission_amount.toLocaleString()}</span>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col">
                          <span className="text-sm font-normal text-slate-300 line-through decoration-slate-200">₹{p.product_amount.toLocaleString()}</span>
                          <div className="flex items-center gap-2 text-brand-blue font-medium text-2xl tracking-tighter italic">
                             ₹{p.final_amount.toLocaleString()}
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <AnimatePresence mode="wait">
                           {p.status === 'Pending' ? (
                               <motion.button 
                                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                 onClick={() => handleMarkPaid(p.id)}
                                 className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-medium uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20 active:scale-95"
                               >
                                  <Check size={14} strokeWidth={3} /> Authorize Payout
                               </motion.button>
                           ) : (
                               <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-medium uppercase tracking-widest border border-emerald-100">
                                   <ShieldCheck size={16} /> Fully Settled
                               </div>
                           )}
                       </AnimatePresence>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="max-w-xs mx-auto space-y-6 opacity-30">
                       <ShieldCheck size={80} strokeWidth={1} className="mx-auto text-slate-400" />
                       <div className="space-y-1">
                           <p className="text-xl font-medium text-slate-900 font-title uppercase tracking-tighter italic">Ledger Synchronized</p>
                           <p className="text-slate-500 font-normal text-sm tracking-tight">All delivered orders have been settled with our merchant partners.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer / Intelligence */}
      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-orange shadow-inner border border-slate-100 shrink-0">
                  <Percent size={32} />
              </div>
              <div className="max-w-xl">
                  <h4 className="font-medium text-slate-900 uppercase tracking-widest text-sm mb-1">Financial Reconciliation Protocol</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                      Payouts are automatically recalculated and staged for authorization once logistics telemetry confirms "Delivered" status via OTP validation. Administrative review is required before final wire transfer.
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-8 border-l border-slate-200 pl-10 shrink-0">
               <div className="text-center">
                   <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest mb-1">Avg Settlement</p>
                   <p className="text-lg font-medium text-slate-900 tracking-tighter">4.2 Hours</p>
               </div>
               <div className="text-center">
                   <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest mb-1">Accuracy</p>
                   <p className="text-lg font-medium text-emerald-500 tracking-tighter">99.98%</p>
               </div>
          </div>
      </div>
    </div>
  );
};

export default VendorTransactions;
