import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  Wallet,
  Calendar,
  User,
  CheckCircle2,
  FileText,
  DollarSign,
  Plus,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../../../services/api";
import clsx from "clsx";

const RiderSettlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getRiderSettlements({
        status: statusFilter === "All" ? "" : statusFilter,
        search: searchTerm
      });
      setSettlements(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch settlements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter, searchTerm]);

  const handlePayRider = async (id) => {
    if (window.confirm("Confirm monthly salary payment? This will record the transaction and update the rider's earnings history.")) {
        try {
            await paymentService.payRider(id, { method: 'Bank Transfer' });
            fetchSettlements();
        } catch (err) {
            console.error("Failed to process payment");
        }
    }
  };

  const totals = {
      paid: settlements.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + parseFloat(curr.final_payable), 0),
      pending: settlements.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + parseFloat(curr.final_payable), 0),
      ridersCount: [...new Set(settlements.map(s => s.rider))].length
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title italic">Fleet <span className="text-brand-blue not-italic">Settlements</span></h1>
            <p className="text-slate-500 font-bold mt-1">Manage monthly salaries, delivery incentives, and bonuses for riders.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                <FileText size={18} /> Bulk Payslips
             </button>
             <button className="flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-brand-blue/20">
                <Plus size={18} /> Run Payroll
             </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Current Month Payout</p>
              <h4 className="text-3xl font-black tracking-tighter text-slate-900">₹{(totals.paid + totals.pending).toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <User size={12} /> {totals.ridersCount} Active Riders
              </div>
          </div>
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100/50 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-4">Total Paid</p>
              <h4 className="text-3xl font-black tracking-tighter text-emerald-700">₹{totals.paid.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Fully Settled
              </div>
          </div>
          <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100/50 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/60 mb-4">Pending Payroll</p>
              <h4 className="text-3xl font-black tracking-tighter text-amber-700">₹{totals.pending.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">
                  <Clock size={12} /> Ready for Payout
              </div>
          </div>
          <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100/50 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 mb-4">Est. Incentives</p>
              <h4 className="text-3xl font-black tracking-tighter text-indigo-700">₹{settlements.reduce((acc, curr) => acc + parseFloat(curr.incentives), 0).toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest">
                  <TrendingUp size={12} className="inline mr-1" /> Performance Based
              </div>
          </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96 group focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Rider..."
              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {["All", "Pending", "Paid"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  statusFilter === status 
                    ? "bg-brand-blue text-white shadow-lg" 
                    : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Rider & Month</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Deliveries</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Breakdown (₹)</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Net Payable</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 uppercase">
                          {s.rider_name?.[0] || 'R'}
                       </div>
                       <div>
                          <div className="text-sm font-black text-slate-900">{s.rider_name}</div>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                             <Calendar size={10} /> {s.month_display}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="text-lg font-black text-slate-900">{s.total_deliveries}</div>
                     <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Tasks Done</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                        <div className="flex justify-between w-48 text-[11px] font-bold">
                            <span className="text-slate-400 uppercase tracking-tighter">Base Salary</span>
                            <span className="text-slate-900">₹{parseFloat(s.base_salary).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-48 text-[11px] font-bold">
                            <span className="text-slate-400 uppercase tracking-tighter">Incentives</span>
                            <span className="text-emerald-500">+₹{parseFloat(s.incentives).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-48 text-[11px] font-bold border-t border-dashed border-slate-100 pt-1 mt-1">
                            <span className="text-rose-400 uppercase tracking-tighter">Deductions</span>
                            <span className="text-rose-500">-₹{parseFloat(s.deductions).toLocaleString()}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-center">
                        <div className="text-xl font-black text-slate-900">₹{parseFloat(s.final_payable).toLocaleString()}</div>
                        <span className={clsx(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            s.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                            {s.status}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {s.status === 'Pending' ? (
                        <button 
                            onClick={() => handlePayRider(s.id)}
                            className="bg-brand-blue text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 ml-auto shadow-lg shadow-brand-blue/20 active:scale-95"
                        >
                            Pay Rider <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button className="text-slate-400 hover:text-brand-blue transition-colors px-4 py-3 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ml-auto">
                            <FileText size={14} /> View Payslip
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {settlements.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No settlement records for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiderSettlements;
