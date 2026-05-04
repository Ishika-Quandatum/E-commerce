import React, { useState, useEffect } from "react";
import { paymentService, vendorService } from "../../../services/api";
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
  CreditCard,
  MoreVertical,
  Pause,
  Play,
  Calendar,
  IndianRupee,
  ChevronDown,
  Users,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import toast from "react-hot-toast";

const VendorTransactions = () => {
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    pending_payout: 0,
    paid_this_month: 0,
    platform_commission: 0,
    refund_holds: 0,
    active_vendors: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [vendors, setVendors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayouts, setSelectedPayouts] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePayout, setActivePayout] = useState(null);
  const [paymentData, setPaymentData] = useState({ method: "bank_transfer", reference_number: "" });
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payoutsRes, statsRes, vendorsRes] = await Promise.all([
        paymentService.getVendorPayouts({
          status: statusFilter === "All" ? "" : statusFilter,
          vendor_id: vendorFilter,
          start_date: dateRange.start,
          end_date: dateRange.end,
          min_amount: amountRange.min,
          max_amount: amountRange.max,
          search: searchTerm
        }),
        paymentService.getVendorPayoutStats(),
        vendorService.getVendors({ status: 'Approved' })
      ]);

      setPayouts(Array.isArray(payoutsRes.data) ? payoutsRes.data : (payoutsRes.data?.results || []));
      setStats(statsRes.data);
      setVendors(Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data?.results || []));
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, vendorFilter, dateRange, amountRange, searchTerm]);

  const handleAction = async (action, id, data = {}) => {
    try {
      if (action === 'pay') {
        await paymentService.updatePayoutStatus(id, data);
        toast.success("Payout processed successfully");
      } else if (action === 'hold') {
        await paymentService.holdPayout(id);
        toast.success("Payout put on hold");
      } else if (action === 'approve') {
        await paymentService.approvePayout(id);
        toast.success("Payout approved for processing");
      }
      fetchData();
      setIsPaymentModalOpen(false);
      setActivePayout(null);
    } catch (err) {
      toast.error(`Failed to ${action} payout`);
    }
  };

  const handleBulkPayout = async () => {
    if (selectedPayouts.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await paymentService.bulkPayout({
        payout_ids: selectedPayouts,
        method: 'bank_transfer',
        reference_number: `BULK-${Date.now()}`
      });
      toast.success(`Processed ${selectedPayouts.length} payouts`);
      setSelectedPayouts([]);
      fetchData();
    } catch (err) {
      toast.error("Bulk payout failed");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleDownloadStatement = async () => {
    try {
      const res = await paymentService.downloadPayoutStatement({
        status: statusFilter === "All" ? "" : statusFilter,
        vendor_id: vendorFilter,
        start_date: dateRange.start,
        end_date: dateRange.end,
        search: searchTerm
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payout_statement.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error("Failed to download statement");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Hold': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Failed': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const toggleSelectAll = () => {
    if (selectedPayouts.length === payouts.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(payouts.filter(p => p.status === 'Pending').map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedPayouts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] space-y-8 animate-in fade-in duration-700 pb-24 font-sans">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 md:px-0">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-12 h-12 bg-white border border-purple-100 rounded-2xl flex items-center justify-center hover:bg-purple-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} className="text-purple-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendor Settlements</h1>
            <p className="text-slate-500 text-sm font-medium">Manage merchant payouts and platform commissions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadStatement}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-purple-200 text-purple-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-purple-50 transition-all shadow-sm"
          >
            <Download size={16} /> Download CSV
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-sm",
                showFilters ? "bg-purple-600 text-white" : "bg-white border border-purple-200 text-purple-700"
            )}
          >
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 px-4 md:px-0">
          <StatCard 
            title="Pending Payout" 
            value={stats.pending_payout} 
            icon={<Wallet className="text-amber-600" />} 
            color="bg-amber-50"
            sub="Awaiting Release"
          />
          <StatCard 
            title="Paid This Month" 
            value={stats.paid_this_month} 
            icon={<CheckCircle2 className="text-emerald-600" />} 
            color="bg-emerald-50"
            sub="Successful Transfers"
          />
          <StatCard 
            title="Commission" 
            value={stats.platform_commission} 
            icon={<TrendingUp className="text-purple-600" />} 
            color="bg-purple-50"
            sub="Platform Revenue"
          />
          <StatCard 
            title="Refund Holds" 
            value={stats.refund_holds} 
            icon={<AlertCircle className="text-rose-600" />} 
            color="bg-rose-50"
            sub="Orders Returned"
          />
          <StatCard 
            title="Active Vendors" 
            value={stats.active_vendors} 
            icon={<Users className="text-blue-600" />} 
            color="bg-blue-50"
            isCurrency={false}
            sub="Verified Partners"
          />
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 md:px-0"
          >
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Search Merchant</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Order ID or Vendor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-400 transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Vendor</label>
                    <select 
                        value={vendorFilter} 
                        onChange={(e) => setVendorFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-400 transition-all appearance-none"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.shop_name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Status Protocol</label>
                    <div className="flex gap-2">
                        {['All', 'Pending', 'Paid', 'Hold'].map(s => (
                            <button 
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={clsx(
                                    "px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all flex-1",
                                    statusFilter === s ? "bg-purple-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Date Range</label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full px-3 py-3 bg-slate-50 border-none rounded-xl text-[10px] focus:ring-2 focus:ring-purple-400"
                        />
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full px-3 py-3 bg-slate-50 border-none rounded-xl text-[10px] focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-purple-100 shadow-xl shadow-purple-500/5 overflow-hidden mx-4 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 w-10">
                    <input 
                        type="checkbox" 
                        checked={selectedPayouts.length === payouts.length && payouts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 rounded-lg border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                </th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant Partner</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Breakdown</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse bg-slate-50/20"><td colSpan="7" className="h-24" /></tr>)
              ) : payouts.length > 0 ? (
                payouts.map((p) => (
                  <tr key={p.id} className={clsx(
                      "group transition-all duration-300 hover:bg-purple-50/30",
                      selectedPayouts.includes(p.id) && "bg-purple-50/50"
                  )}>
                    <td className="px-8 py-6">
                        <input 
                            type="checkbox" 
                            disabled={p.status !== 'Pending'}
                            checked={selectedPayouts.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="w-5 h-5 rounded-lg border-slate-300 text-purple-600 focus:ring-purple-500 disabled:opacity-30"
                        />
                    </td>
                    <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                {p.vendor_name?.slice(0,1).toUpperCase()}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">{p.vendor_name}</span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase">Vendor ID: #{p.vendor}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-6">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 tracking-tight text-sm">ORD-{p.order_id}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{p.transaction_id}</span>
                        </div>
                    </td>
                    <td className="px-6 py-6">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4 max-w-[140px]">
                                <span className="text-[10px] font-medium text-slate-400">Gross:</span>
                                <span className="text-xs font-semibold text-slate-600">₹{parseFloat(p.total_amount).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 max-w-[140px]">
                                <span className="text-[10px] font-medium text-rose-400">Comm ({p.commission_rate}%):</span>
                                <span className="text-xs font-semibold text-rose-500">-₹{parseFloat(p.commission_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                              <span className="text-lg font-bold text-purple-700 tracking-tighter italic">₹{parseFloat(p.final_amount).toLocaleString()}</span>
                          </div>
                          <span className={clsx(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border w-fit uppercase tracking-wider mt-1",
                              getStatusStyle(p.status)
                          )}>
                              {p.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                <Calendar size={12} className="text-slate-300" />
                                Created: {new Date(p.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600">
                                <Clock size={12} className="text-purple-300" />
                                Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <ActionDropdown 
                                p={p} 
                                onPay={() => { setActivePayout(p); setIsPaymentModalOpen(true); }}
                                onHold={() => handleAction('hold', p.id)}
                                onApprove={() => handleAction('approve', p.id)}
                                onView={() => navigate(`/admin/orders/${p.order_id}`)}
                           />
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-10 py-32 text-center">
                    <div className="max-w-xs mx-auto space-y-4 opacity-40">
                       <ShieldCheck size={64} strokeWidth={1} className="mx-auto text-purple-200" />
                       <div className="space-y-1">
                           <p className="text-lg font-bold text-slate-900 uppercase tracking-tighter italic">No Records Found</p>
                           <p className="text-slate-500 text-xs font-medium">Try adjusting your filters or search terms</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
          {selectedPayouts.length > 0 && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
              >
                  <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl shadow-purple-900/40 flex items-center justify-between border border-white/10 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center font-bold text-lg">
                              {selectedPayouts.length}
                          </div>
                          <div>
                              <p className="font-bold text-sm">Payouts Selected</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Total: ₹{payouts.filter(p => selectedPayouts.includes(p.id)).reduce((acc, curr) => acc + parseFloat(curr.final_amount), 0).toLocaleString()}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setSelectedPayouts([])}
                            className="px-6 py-3 text-xs font-bold uppercase text-slate-400 hover:text-white transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleBulkPayout}
                            disabled={isBulkProcessing}
                            className="px-8 py-3 bg-purple-600 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50"
                          >
                              {isBulkProcessing ? "Processing..." : "Pay All Now"}
                          </button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        payout={activePayout}
        onSubmit={(data) => handleAction('pay', activePayout.id, data)}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, sub, isCurrency = true }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-purple-50 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all group overflow-hidden relative">
        <div className={clsx("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform group-hover:scale-150 duration-700", color.replace('bg-', 'bg-opacity-50 '))} />
        <div className="relative z-10 space-y-4">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", color)}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
                <h4 className="text-2xl font-bold tracking-tighter text-slate-900 group-hover:text-purple-700 transition-colors">
                    {isCurrency ? "₹" : ""}{value.toLocaleString()}
                </h4>
            </div>
            <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                <ChevronDown size={12} className="rotate-180 text-emerald-500" /> {sub}
            </p>
        </div>
    </div>
);

const ActionDropdown = ({ p, onPay, onHold, onApprove, onView }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-slate-400 hover:text-purple-600"
            >
                <MoreVertical size={18} />
            </button>
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-purple-100 p-2 z-20"
                        >
                            <button onClick={() => { setOpen(false); onView(); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-purple-50 rounded-xl transition-colors">
                                <ExternalLink size={16} className="text-slate-400" /> View Order Details
                            </button>
                            <div className="h-px bg-purple-50 my-1 mx-2" />
                            {p.status === 'Pending' && (
                                <>
                                    <button onClick={() => { setOpen(false); onPay(); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                                        <CreditCard size={16} /> Release Payout
                                    </button>
                                    <button onClick={() => { setOpen(false); onHold(); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                        <Pause size={16} /> Place on Hold
                                    </button>
                                </>
                            )}
                            {p.status === 'Hold' && (
                                <button onClick={() => { setOpen(false); onApprove(); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                                    <Play size={16} /> Approve Release
                                </button>
                            )}
                            <button className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <FileText size={16} /> Download Statement
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, payout, onSubmit }) => {
    const [data, setData] = useState({ method: "bank_transfer", reference_number: "" });
    if (!isOpen || !payout) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-purple-100"
            >
                <div className="bg-purple-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-20"><CreditCard size={120} /></div>
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Finalizing Settlement</p>
                        <h2 className="text-3xl font-bold tracking-tight">Authorize Payment</h2>
                        <div className="flex items-center gap-2 pt-4">
                            <span className="text-sm font-medium opacity-80">Payable to:</span>
                            <span className="font-bold underline underline-offset-4 decoration-purple-400">{payout.vendor_name}</span>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Order Amount</p>
                            <p className="text-xl font-bold text-slate-900 italic">₹{parseFloat(payout.total_amount).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Net Payout</p>
                            <p className="text-3xl font-bold text-purple-700 tracking-tighter italic">₹{parseFloat(payout.final_amount).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Transfer Protocol</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'bank_transfer', label: 'Bank', icon: <Users size={14} /> },
                                    { id: 'upi', label: 'UPI', icon: <IndianRupee size={14} /> },
                                    { id: 'wallet', label: 'Wallet', icon: <Wallet size={14} /> },
                                    { id: 'manual', label: 'Manual', icon: <CreditCard size={14} /> }
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => setData({...data, method: m.id})}
                                        className={clsx(
                                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                            data.method === m.id ? "bg-purple-50 border-purple-600 text-purple-700" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        {m.icon}
                                        <span className="text-[10px] font-bold uppercase">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Transaction Reference Number</label>
                            <input 
                                type="text" 
                                placeholder="Enter Bank UTR / UPI Ref ID..." 
                                value={data.reference_number}
                                onChange={(e) => setData({...data, reference_number: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-400 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 text-xs font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onSubmit(data)}
                            disabled={!data.reference_number}
                            className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            Confirm Settlement
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VendorTransactions;
