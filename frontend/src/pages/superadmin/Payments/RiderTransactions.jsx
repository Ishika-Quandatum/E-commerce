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
  History as HistoryIcon,
  IndianRupee,
  Eye,
  ArrowRight,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { riderService, paymentService } from "../../../services/api";
import clsx from "clsx";

const RiderTransactions = () => {
  const [riders, setRiders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Ledger Modal State
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderLogs, setRiderLogs] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridersRes, logsRes] = await Promise.all([
        riderService.getRiders({ search: searchTerm }),
        paymentService.getRiderFinancialLogs({ limit: 10 })
      ]);
      setRiders(ridersRes.data.results || ridersRes.data || []);
      setLogs(logsRes.data.results || logsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch rider transaction data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiderLedger = async (rider) => {
      setSelectedRider(rider);
      setLoadingLedger(true);
      try {
          const res = await paymentService.getRiderFinancialLogs({ rider_id: rider.id });
          setRiderLogs(res.data.results || res.data || []);
      } catch (err) {
          console.error("Failed to fetch rider ledger");
      } finally {
          setLoadingLedger(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

   const stats = {
       totalCollected: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.total_cod_collected) || 0), 0),
       pendingCOD: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.pending_cod_amount) || 0), 0),
       shortages: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.shortage_amount) || 0), 0),
       totalBalance: riders.reduce((acc, r) => acc + (parseFloat(r.wallet?.current_balance) || 0), 0),
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
            <h1 className="text-4xl font-medium text-slate-900 tracking-tight font-title italic tracking-tighter">Rider <span className="text-brand-blue not-italic">Ledger</span></h1>
            <p className="text-slate-500 font-normal mt-1">Monitor fleet wallet balances, COD collections, and financial history.</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] font-medium text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
           <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mb-12 -mr-12 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-4">Total COD Volume</p>
              <h4 className="text-3xl font-medium tracking-tighter italic">₹{stats.totalCollected.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-slate-500 uppercase tracking-widest italic">
                  <TrendingUp size={12} /> Lifetime Collections
              </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group hover:scale-[1.02] transition-all">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-600/60 mb-4 italic">Pending Submission</p>
              <h4 className="text-3xl font-medium tracking-tighter text-slate-900 italic">₹{stats.pendingCOD.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-amber-600/60 uppercase tracking-widest italic">
                  <Clock size={12} /> Cash with riders
              </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group hover:scale-[1.02] transition-all">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-600/60 mb-4 italic">Unresolved Shortages</p>
              <h4 className="text-3xl font-medium tracking-tighter text-slate-900 font-medium italic">₹{stats.shortages.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-rose-600/60 uppercase tracking-widest italic">
                  <AlertTriangle size={12} /> Dispute Valuations
              </div>
          </div>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 group hover:scale-[1.02] transition-all">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60 mb-4 italic">Fleet Wallet Balance</p>
              <h4 className="text-3xl font-medium tracking-tighter italic">₹{stats.totalBalance.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-white/60 uppercase tracking-widest italic">
                  <Wallet size={12} /> Combined Liquidity
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Riders List */}
          <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h3 className="font-medium text-slate-900 uppercase tracking-widest text-xs flex items-center gap-3">
                        <Bike size={18} className="text-brand-blue" /> Wallet Overview
                    </h3>
                    <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full md:w-64">
                        <Search size={16} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find Rider..."
                            className="bg-transparent border-none focus:ring-0 text-xs font-normal w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Rider</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Collected</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Submitted</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Pending</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center text-rose-400">Shortage</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center text-emerald-500">Earnings</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center text-indigo-500">Incentives</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Payable (Wallet)</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {riders.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-medium text-sm text-slate-500 uppercase">
                                                {r.user?.first_name?.[0] || r.user?.username?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{r.user?.first_name} {r.user?.last_name}</div>
                                                <div className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">ID: #{r.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-sm font-medium text-slate-900">₹{parseFloat(r.wallet?.total_cod_collected || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-sm font-medium text-emerald-600">₹{parseFloat(r.wallet?.total_cod_submitted || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-sm font-medium text-amber-500">₹{parseFloat(r.wallet?.pending_cod_amount || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className={clsx(
                                            "text-sm font-medium",
                                            parseFloat(r.wallet?.shortage_amount) > 0 ? "text-rose-500" : "text-slate-300"
                                        )}>
                                            ₹{parseFloat(r.wallet?.shortage_amount || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-sm font-medium text-emerald-600">₹{parseFloat(r.wallet?.total_earned || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-sm font-medium text-indigo-500">₹{parseFloat(r.wallet?.total_incentives || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="text-lg font-medium text-slate-900 tracking-tighter">₹{parseFloat(r.wallet?.current_balance || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => fetchRiderLedger(r)}
                                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all shadow-sm flex items-center gap-2 ml-auto"
                                        >
                                            <Eye size={14} /> View Ledger
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {riders.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-normal uppercase tracking-widest">No riders found in the ledger.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>

          {/* Recent Logs Sidebar */}
          <div className="space-y-6">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-10">
                  <div className="flex items-center justify-between mb-10">
                      <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                          <HistoryIcon size={16} className="text-indigo-500" /> Recent Logs
                      </h3>
                      <button className="text-[10px] font-medium text-brand-blue uppercase tracking-widest hover:underline">Full Audit</button>
                  </div>
                  <div className="space-y-8">
                      {logs.map((log) => (
                          <div key={log.id} className="flex gap-5 group">
                              <div className={clsx(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                  log.log_type === 'Incentive' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                              )}>
                                  {log.log_type === 'Incentive' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                      <p className="text-xs font-medium text-slate-900">{log.log_type}</p>
                                      <p className={clsx(
                                          "text-xs font-medium tracking-tighter",
                                          log.log_type === 'Incentive' ? "text-emerald-500" : "text-rose-500"
                                      )}>
                                          {log.log_type === 'Incentive' ? '+' : '-'}₹{Math.abs(parseFloat(log.amount)).toLocaleString()}
                                      </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-normal leading-tight line-clamp-2">{log.description}</p>
                                  <p className="text-[9px] font-medium text-slate-300 uppercase tracking-[0.1em] mt-2 flex items-center gap-1">
                                      <Clock size={10} /> {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                              </div>
                          </div>
                      ))}
                      {logs.length === 0 && <p className="text-center py-10 text-slate-400 text-xs font-normal">No recent financial logs.</p>}
                  </div>
              </div>

              <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-slate-900/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full -mt-16 -mr-16" />
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <IndianRupee size={24} className="text-brand-blue" />
                      </div>
                      <h3 className="font-medium uppercase tracking-[0.15em] text-[11px]">Payout Ready</h3>
                  </div>
                  <p className="text-sm font-normal leading-relaxed opacity-80">
                      There is currently <span className="font-bold text-brand-blue">₹{stats.totalBalance.toLocaleString()}</span> across the fleet wallet ready for the next settlement cycle.
                  </p>
                  <button 
                    onClick={() => navigate("/admin/payments/settlements")}
                    className="w-full py-5 bg-brand-blue text-white rounded-2xl font-medium text-xs uppercase tracking-widest shadow-xl shadow-brand-blue/30 hover:bg-white hover:text-brand-blue transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      Open Payroll System <ArrowRight size={16} />
                  </button>
              </div>
          </div>
      </div>
      
      {/* Ledger Modal */}
      {selectedRider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                          <h3 className="text-xl font-medium text-slate-900 font-title">Ledger: {selectedRider.user?.first_name} {selectedRider.user?.last_name}</h3>
                          <p className="text-xs font-normal text-slate-500 mt-1 uppercase tracking-widest">Complete Financial History</p>
                      </div>
                      <button onClick={() => setSelectedRider(null)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all">
                          <X size={18} className="text-slate-500" />
                      </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
                      {loadingLedger ? (
                          <div className="flex justify-center items-center py-20">
                              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                          </div>
                      ) : riderLogs.length === 0 ? (
                          <p className="text-center text-slate-400 text-xs uppercase tracking-widest py-20">No financial logs found for this rider.</p>
                      ) : (
                          <div className="space-y-4">
                              {riderLogs.map((log) => (
                                  <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                                      <div className={clsx(
                                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                          log.log_type === 'Incentive' ? "bg-emerald-50 text-emerald-600" : 
                                          log.log_type === 'Payout' ? "bg-brand-blue/10 text-brand-blue" :
                                          "bg-rose-50 text-rose-600"
                                      )}>
                                          {log.log_type === 'Incentive' ? <TrendingUp size={16} /> : 
                                           log.log_type === 'Payout' ? <Wallet size={16} /> :
                                           <TrendingDown size={16} />}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <p className="text-xs font-medium text-slate-900 uppercase tracking-wider">{log.log_type}</p>
                                              <p className={clsx(
                                                  "text-sm font-medium tracking-tighter",
                                                  log.log_type === 'Incentive' ? "text-emerald-500" : 
                                                  log.log_type === 'Payout' ? "text-brand-blue" :
                                                  "text-rose-500"
                                              )}>
                                                  {log.log_type === 'Incentive' ? '+' : '-'}₹{Math.abs(parseFloat(log.amount)).toLocaleString()}
                                              </p>
                                          </div>
                                          <p className="text-xs text-slate-500 mt-1">{log.description}</p>
                                          <p className="text-[9px] font-medium text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                                              <Clock size={10} /> {new Date(log.timestamp).toLocaleDateString()} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RiderTransactions;
