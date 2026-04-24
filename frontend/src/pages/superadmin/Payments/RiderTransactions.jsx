import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Clock,
  Bike,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { riderService, paymentService } from "../../../services/api";
import clsx from "clsx";

const RiderTransactions = () => {
  const [riders, setRiders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridersRes, logsRes] = await Promise.all([
        riderService.getRiders({ search: searchTerm }),
        paymentService.getRiderFinancialLogs({ limit: 10 })
      ]);
      setRiders(ridersRes.data.results || ridersRes.data);
      setLogs(logsRes.data.results || logsRes.data);
    } catch (err) {
      console.error("Failed to fetch rider transaction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const stats = {
      totalCollected: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.total_earned) || 0), 0),
      pendingCOD: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.pending_cod_amount) || 0), 0),
      shortages: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.shortage_amount) || 0), 0),
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title italic">Rider <span className="text-brand-blue not-italic">Ledger</span></h1>
            <p className="text-slate-500 font-bold mt-1">Full financial history and wallet balances for the delivery fleet.</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
           <Download size={18} /> Download Ledger
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16" />
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Wallet size={20} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Fleet Total Collected</p>
                  <h4 className="text-4xl font-black tracking-tighter">₹{stats.totalCollected.toLocaleString()}</h4>
              </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <Clock size={20} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Awaiting Submission</p>
                  <h4 className="text-4xl font-black tracking-tighter text-slate-900">₹{stats.pendingCOD.toLocaleString()}</h4>
              </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <AlertTriangle size={20} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Shortages</p>
                  <h4 className="text-4xl font-black tracking-tighter text-slate-900">₹{stats.shortages.toLocaleString()}</h4>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Riders List */}
          <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-3">
                        <Bike size={18} className="text-brand-blue" /> Rider Wallets
                    </h3>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <Search size={14} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..."
                            className="bg-transparent border-none focus:ring-0 text-xs font-bold w-32"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total COD</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Sub.</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shortage</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {riders.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 uppercase">
                                                {r.user?.first_name?.[0] || r.user?.username?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{r.user?.get_full_name || r.user?.username}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{r.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-700">₹{parseFloat(r.wallet?.total_earned || 0).toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg font-black text-[10px] uppercase",
                                            parseFloat(r.wallet?.pending_cod_amount) > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            ₹{parseFloat(r.wallet?.pending_cod_amount || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-rose-500 font-bold">₹{parseFloat(r.wallet?.shortage_amount || 0).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-right font-black text-slate-900">₹{parseFloat(r.wallet?.current_balance || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>

          {/* Recent Logs Sidebar */}
          <div className="space-y-6">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                          <History size={16} className="text-indigo-500" /> Financial Logs
                      </h3>
                      <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                      {logs.map((log) => (
                          <div key={log.id} className="flex gap-4 group">
                              <div className={clsx(
                                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                  log.log_type === 'Incentive' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                              )}>
                                  {log.log_type === 'Incentive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-0.5">
                                      <p className="text-[11px] font-black text-slate-900">{log.log_type}</p>
                                      <p className={clsx(
                                          "text-xs font-black",
                                          log.log_type === 'Incentive' ? "text-emerald-500" : "text-rose-500"
                                      )}>
                                          {log.log_type === 'Incentive' ? '+' : '-'}₹{Math.abs(parseFloat(log.amount))}
                                      </p>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{log.description}</p>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                              </div>
                          </div>
                      ))}
                      {logs.length === 0 && <p className="text-center py-10 text-slate-400 text-xs font-bold">No recent logs.</p>}
                  </div>
              </div>

              <div className="bg-brand-blue rounded-[3rem] p-8 text-white space-y-6">
                  <div className="flex items-center gap-3">
                      <Bike size={24} className="text-white/50" />
                      <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Fleet Payout Alert</h3>
                  </div>
                  <p className="text-sm font-bold leading-relaxed opacity-90">
                      Total pending monthly settlements: <span className="font-black underline underline-offset-4">₹42,500</span>
                  </p>
                  <button 
                    onClick={() => navigate("/admin/payments/settlements")}
                    className="w-full py-4 bg-white text-brand-blue rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-blue/30 active:scale-95 transition-all"
                  >
                      Go to Settlements
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default RiderTransactions;
