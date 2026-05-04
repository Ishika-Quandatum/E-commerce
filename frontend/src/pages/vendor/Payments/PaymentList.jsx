import React, { useEffect, useState, useRef } from "react";
import { paymentService } from "../../../services/api";
import { 
  CreditCard, 
  ArrowRightLeft, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  Percent, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  MoreHorizontal,
  RotateCcw,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import toast from "react-hot-toast";

const PaymentList = () => {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    total_earnings: 0,
    pending_amount: 0,
    commission_deducted: 0,
    month_earnings: 0,
    selected_period: ""
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "All",
    start_date: "",
    end_date: "",
    order_id: "",
    sort_by: "-created_at",
    page: 1,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [expandedPayout, setExpandedPayout] = useState(null);
  const monthPickerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payoutsRes, statsRes] = await Promise.all([
        paymentService.getVendorPayouts({
          status: filters.status === "All" ? "" : filters.status,
          start_date: filters.start_date,
          end_date: filters.end_date,
          order_id: filters.order_id,
          sort_by: filters.sort_by,
          page: filters.page,
          // We can also filter table by selected month if no specific date range is set
          ...( (!filters.start_date && !filters.end_date) && {
              month: filters.month,
              year: filters.year
          })
        }),
        paymentService.getVendorPayoutStatsForVendor({
            month: filters.month,
            year: filters.year
        })
      ]);

      if (payoutsRes.data.results) {
          setPayouts(payoutsRes.data.results);
          setTotalCount(payoutsRes.data.count);
          setTotalPages(Math.ceil(payoutsRes.data.count / 10));
      } else {
          setPayouts(Array.isArray(payoutsRes.data) ? payoutsRes.data : []);
          setTotalPages(1);
          setTotalCount(payoutsRes.data.length || 0);
      }
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to fetch payment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle outside click for month picker
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
            setShowMonthPicker(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReset = () => {
      setFilters({
          status: "All",
          start_date: "",
          end_date: "",
          order_id: "",
          sort_by: "-created_at",
          page: 1,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
      });
      toast.success("Filters reset to current month");
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setFilters(prev => ({ ...prev, page: newPage }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const handleDownloadInvoice = async (payout) => {
      try {
          const res = await paymentService.downloadPayoutInvoice(payout.id);
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Invoice_${payout.transaction_id}.csv`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          toast.success("Invoice downloaded successfully");
      } catch (err) {
          toast.error("Failed to download invoice");
      }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'hold': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="mt-1 text-slate-500 font-medium italic">Track your earnings, platform commissions, and settlement history.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm border",
                showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            <Filter size={16} /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          {/* Functional Month Picker Badge */}
          <div className="relative" ref={monthPickerRef}>
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 hover:border-indigo-200 transition-all active:scale-95"
              >
                 <Calendar size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                     {stats.selected_period || "Loading..."}
                 </span>
                 <ChevronDown size={14} className={clsx("text-slate-300 transition-transform", showMonthPicker && "rotate-180")} />
              </button>

              <AnimatePresence>
                  {showMonthPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 z-50 overflow-hidden"
                      >
                          <div className="flex items-center justify-between mb-4 px-1">
                              <button 
                                onClick={() => setFilters(f => ({...f, year: f.year - 1, page: 1}))}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
                              >
                                  <ChevronLeft size={16} className="text-slate-400" />
                              </button>
                              <span className="text-sm font-black text-slate-900 italic tracking-tighter">{filters.year}</span>
                              <button 
                                onClick={() => setFilters(f => ({...f, year: f.year + 1, page: 1}))}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
                              >
                                  <ChevronRight size={16} className="text-slate-400" />
                              </button>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                              {months.map((m, i) => (
                                  <button 
                                    key={m}
                                    onClick={() => {
                                        setFilters(f => ({...f, month: i + 1, page: 1}));
                                        setShowMonthPicker(false);
                                    }}
                                    className={clsx(
                                        "py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-tighter",
                                        filters.month === i + 1 
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105" 
                                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                    )}
                                  >
                                      {m.slice(0, 3)}
                                  </button>
                              ))}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Total Earnings" 
            value={stats.total_earnings} 
            icon={<DollarSign />} 
            color="bg-emerald-50 text-emerald-600" 
            sub="Life-time Revenue"
          />
          <SummaryCard 
            title="Pending Payout" 
            value={stats.pending_amount} 
            icon={<Wallet />} 
            color="bg-amber-50 text-amber-600" 
            sub="Awaiting Release"
          />
          <SummaryCard 
            title="Platform Fee" 
            value={stats.commission_deducted} 
            icon={<Percent />} 
            color="bg-rose-50 text-rose-600" 
            sub="Commission Deducted"
          />
          <SummaryCard 
            title={stats.selected_period} 
            value={stats.month_earnings} 
            icon={<TrendingUp />} 
            color="bg-indigo-50 text-indigo-600" 
            sub="Selected Month Yield"
          />
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
          {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                  <div className="bg-white p-7 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 space-y-7">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Order Identifier</label>
                              <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Search ORD#..." 
                                    value={filters.order_id}
                                    onChange={(e) => setFilters({...filters, order_id: e.target.value, page: 1})}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-slate-300"
                                  />
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Transfer Status</label>
                              <select 
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 transition-all appearance-none cursor-pointer"
                              >
                                  <option value="All">All Transactions</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Hold">On Hold</option>
                              </select>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sort Hierarchy</label>
                              <select 
                                value={filters.sort_by}
                                onChange={(e) => setFilters({...filters, sort_by: e.target.value, page: 1})}
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 transition-all appearance-none cursor-pointer"
                              >
                                  <option value="-created_at">Newest First</option>
                                  <option value="created_at">Oldest First</option>
                                  <option value="-final_amount">Highest Amount</option>
                                  <option value="final_amount">Lowest Amount</option>
                              </select>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Custom Date Range</label>
                              <div className="flex items-center gap-2">
                                  <input 
                                    type="date" 
                                    value={filters.start_date}
                                    onChange={(e) => setFilters({...filters, start_date: e.target.value, page: 1})}
                                    className="flex-1 px-3 py-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                                  />
                                  <span className="text-slate-300 font-black">-</span>
                                  <input 
                                    type="date" 
                                    value={filters.end_date}
                                    onChange={(e) => setFilters({...filters, end_date: e.target.value, page: 1})}
                                    className="flex-1 px-3 py-3.5 bg-slate-50 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                                  />
                              </div>
                          </div>
                      </div>
                      <div className="flex justify-end pt-2">
                          <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
                          >
                              <RotateCcw size={14} /> Reset
                          </button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Main Ledger Table */}
      <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50 border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Identity</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse bg-slate-50/10"><td colSpan="6" className="h-24" /></tr>)
              ) : payouts.length > 0 ? (
                payouts.map((p) => (
                  <React.Fragment key={p.id}>
                      <tr 
                        onClick={() => setExpandedPayout(expandedPayout === p.id ? null : p.id)}
                        className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                      >
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 leading-none mb-1.5 italic">Settlement #{p.transaction_id.slice(-6)}</div>
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                <Calendar size={12} className="text-indigo-400" />
                                {new Date(p.created_at).toLocaleDateString('en-GB')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                           <div className="flex flex-col">
                               <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl w-fit">ORD#{p.order_id}</span>
                               <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">Protocol: {p.method?.replace('_', ' ')}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                            <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-500 tabular-nums">₹{p.total_amount}</div>
                                <div className="text-[10px] font-black text-rose-500 tabular-nums">
                                    -{p.commission_rate}% Fee (₹{p.commission_amount})
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="text-xl font-black text-slate-900 tracking-tighter tabular-nums italic">₹{p.final_amount}</div>
                        </td>
                        <td className="px-10 py-7 text-center">
                          <span className={clsx(
                              "inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all",
                              getStatusColor(p.status)
                          )}>
                            {p.status === 'Paid' ? <CheckCircle2 size={12} /> : p.status === 'Hold' ? <ShieldCheck size={12} /> : <Clock size={12} />}
                            {p.status}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                {expandedPayout === p.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                        </td>
                      </tr>
                      {/* Timeline View */}
                      <AnimatePresence>
                          {expandedPayout === p.id && (
                              <motion.tr 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50/30"
                              >
                                  <td colSpan="6" className="px-10 py-10">
                                      <div className="max-w-4xl mx-auto">
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Payment Lifecycle Timeline</h4>
                                          <div className="flex items-center justify-between relative px-10">
                                              <div className="absolute left-20 right-20 top-5 h-0.5 bg-slate-200 z-0" />
                                              
                                              <TimelineStep 
                                                label="Order Delivered" 
                                                date={new Date(p.created_at).toLocaleDateString()} 
                                                active={true}
                                                icon={<ShieldCheck size={14} />}
                                              />
                                              <TimelineStep 
                                                label="Payment Initiated" 
                                                date={new Date(p.created_at).toLocaleDateString()} 
                                                active={p.status !== 'Hold'}
                                                icon={<Clock size={14} />}
                                              />
                                              <TimelineStep 
                                                label="Settlement Paid" 
                                                date={p.payout_date ? new Date(p.payout_date).toLocaleDateString() : 'Awaiting...'} 
                                                active={p.status === 'Paid'}
                                                icon={<CheckCircle2 size={14} />}
                                                isLast={true}
                                              />
                                          </div>
                                          {p.status === 'Paid' && (
                                              <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                          <ArrowUpRight size={18} />
                                                      </div>
                                                      <div>
                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</p>
                                                          <p className="text-xs font-bold text-slate-900">{p.reference_number || 'TRX-DEFAULT-XXXXX'}</p>
                                                      </div>
                                                  </div>
                                                  <button 
                                                    onClick={() => handleDownloadInvoice(p) }
                                                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                                                  >
                                                      Download Invoice
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  </td>
                              </motion.tr>
                          )}
                      </AnimatePresence>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center">
                    <div className="max-w-xs mx-auto space-y-4 opacity-30">
                       <ArrowRightLeft size={64} strokeWidth={1} className="mx-auto text-slate-400" />
                       <div className="space-y-1">
                           <p className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">No Transaction Ledger</p>
                           <p className="text-slate-500 text-xs font-medium">Your payouts will appear here once orders are delivered.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Real Pagination */}
        <div className="px-10 py-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {totalCount > 0 ? (filters.page - 1) * 10 + 1 : 0} - {Math.min(filters.page * 10, totalCount)} of {totalCount} Transactions
            </p>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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
                                filters.page === i + 1 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-200"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages || totalPages === 0}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color, sub }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all group overflow-hidden relative">
        <div className={clsx("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-5 transition-transform group-hover:scale-150 duration-700 bg-current", color)} />
        <div className="relative z-10 space-y-4">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", color)}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h4 className="text-2xl font-black tracking-tighter text-slate-900 tabular-nums italic">₹{value.toLocaleString()}</h4>
            </div>
            <div className="flex items-center justify-between pt-1">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
                <MoreHorizontal size={14} className="text-slate-200" />
            </div>
        </div>
    </div>
);

const TimelineStep = ({ label, date, active, icon, isLast = false }) => (
    <div className="flex flex-col items-center gap-3 relative z-10">
        <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all shadow-lg",
            active ? "bg-white border-indigo-600 text-indigo-600 scale-110" : "bg-slate-50 border-slate-100 text-slate-300"
        )}>
            {icon}
        </div>
        <div className="text-center min-w-[80px]">
            <p className={clsx("text-[9px] font-black uppercase tracking-widest mb-1", active ? "text-slate-900" : "text-slate-400")}>{label}</p>
            <p className="text-[10px] font-bold text-slate-300">{date}</p>
        </div>
    </div>
);

export default PaymentList;
