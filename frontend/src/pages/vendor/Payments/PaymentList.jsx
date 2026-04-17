import React, { useEffect, useState } from "react";
import { paymentService } from "../../../services/api";
import { CreditCard, ArrowRightLeft, DollarSign, Clock, CheckCircle2 } from "lucide-react";

const PaymentList = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getVendorPayouts();
      setPayouts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredPayouts = statusFilter === "All" 
    ? payouts 
    : payouts.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Track your earnings, platform commissions, and settlements.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Status</label>
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all outline-none bg-white text-xs font-bold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Transactions</option>
            <option value="Pending">Pending Settlements</option>
            <option value="Paid">Paid Payouts</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Product Amt</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right text-rose-500">Commission</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Final Payable</th>
                <th scope="col" className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 italic font-medium">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                          <DollarSign size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 leading-none mb-1 capitalize">Payout {p.id.toString().padStart(4, '0')}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-GB') : 'Processing...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className="text-xs font-black text-slate-900 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">ORD#{p.order_id}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-slate-900 tabular-nums">
                      ₹{p.product_amount}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-black text-rose-500 tabular-nums">
                      -{p.commission_rate}% (₹{p.commission_amount})
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-indigo-600 tabular-nums">
                      ₹{p.final_amount}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(p.status)}`}>
                        {p.status === 'Paid' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {p.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-50">
                        <ArrowRightLeft size={32} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase">No Payout Records</h3>
                        <p className="mt-1 text-xs text-slate-500 font-medium">Payouts are generated once orders are marked as delivered. Please check back later.</p>
                      </div>
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

export default PaymentList;
