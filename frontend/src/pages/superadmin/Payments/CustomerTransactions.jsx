import React, { useState, useEffect } from "react";
import { 
  paymentService, 
  vendorService,
  orderService 
} from "../../../services/api";
import { 
  Search, 
  Filter, 
  FileText, 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Eye,
  MoreVertical,
  Calendar,
  IndianRupee,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Send,
  Printer,
  User,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import toast from "react-hot-toast";

// Icon Helpers
const TrendingUp = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const TrendingUpIcon = ({ size }) => <TrendingUp size={size} />;

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    total_revenue: 0,
    today_revenue: 0,
    pending_payments: 0,
    failed_transactions: 0,
    refunded_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [vendors, setVendors] = useState([]);
  
  // Advanced Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txnRes, statsRes, vendorRes] = await Promise.all([
        paymentService.getPayments({
          search: searchTerm,
          status: statusFilter === "All" ? "" : statusFilter,
          method: methodFilter,
          vendor_id: vendorFilter,
          start_date: dateRange.start,
          end_date: dateRange.end,
          min_amount: amountRange.min,
          max_amount: amountRange.max
        }),
        paymentService.getPaymentStats(),
        vendorService.getVendors()
      ]);
      
      setTransactions(Array.isArray(txnRes.data) ? txnRes.data : (txnRes.data.results || []));
      setStats(statsRes.data);
      setVendors(vendorRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, methodFilter, vendorFilter, dateRange, amountRange]);

  const handleRefund = async (id) => {
    const reason = window.prompt("Reason for refund:", "Customer requested refund");
    if (reason === null) return;

    try {
      await paymentService.refundPayment(id, { reason });
      toast.success("Refund processed successfully");
      fetchData();
    } catch (err) {
      toast.error("Refund failed: " + (err.response?.data?.error || "Server error"));
    }
  };

  const handleExport = async (format = 'csv') => {
    setExporting(true);
    try {
      const response = await paymentService.bulkExportPayments();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transactions_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'COD Collected': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Pending': 
      case 'COD Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Refunded': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Chargeback': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 size={12} />;
      case 'COD Collected': return <IndianRupee size={12} />;
      case 'Pending': 
      case 'COD Pending': return <Clock size={12} />;
      case 'Failed': return <XCircle size={12} />;
      case 'Refunded': return <RefreshCcw size={12} />;
      case 'Cancelled': return <X size={12} />;
      case 'Chargeback': return <ShieldAlert size={12} />;
      default: return null;
    }
  };

  const summaryCards = [
    { label: "Total Revenue", value: stats.total_revenue, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Today's Revenue", value: stats.today_revenue, icon: TrendingUpIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Payments", value: stats.pending_payments, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Refunded Total", value: stats.refunded_amount, icon: RefreshCcw, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Failed Count", value: stats.failed_transactions, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", isCount: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-medium text-slate-900 tracking-tight font-title italic">Customer <span className="text-indigo-600 not-italic">Ledger</span></h1>
            <p className="text-slate-500 font-normal mt-1">Audit transactions, manage refunds, and track global store revenue.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-medium text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            <Download size={18} /> {exporting ? "Exporting..." : "Export Reports"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", card.bg, card.color)}>
              <card.icon size={24} />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-1">{card.label}</p>
            <h4 className="text-2xl font-medium text-slate-900 tracking-tighter">
              {card.isCount ? card.value : `₹${parseFloat(card.value).toLocaleString()}`}
            </h4>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by Transaction ID, Customer, or Order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-xs uppercase tracking-widest transition-all border",
                showFilters ? "bg-indigo-600 text-white border-indigo-600 shadow-lg" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Filter size={16} /> Advanced Filters {showFilters && <ChevronDown size={14} className="rotate-180 transition-transform" />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-8 bg-slate-50/30 border-b border-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="COD Pending">COD Pending</option>
                <option value="COD Collected">COD Collected</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
              <select 
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
              >
                <option value="">All Methods</option>
                <option value="cod">Cash on Delivery</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor</label>
              <select 
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
              >
                <option value="">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.shop_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none"
                />
                <span className="text-slate-300">to</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Customer & Vendor</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Method</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Amount</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Date</th>
                <th className="px-8 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-8 py-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6 font-medium text-brand-blue uppercase tracking-tighter text-sm italic">
                      {t.transaction_id || `TXN-${t.id}`}
                      {parseFloat(t.amount) > 5000 && <AlertTriangle size={14} className="inline ml-2 text-amber-500" title="High Amount Transaction" />}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="font-medium text-slate-900 text-sm">{t.customer_name}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Vendor: {t.vendor_name || 'N/A'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                          <CreditCard size={14} className="text-slate-300" />
                          {t.method}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-base font-medium text-slate-900">₹{parseFloat(t.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center">
                          <div className={clsx(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                            getStatusStyle(t.status)
                          )}>
                             {getStatusIcon(t.status)} {t.status}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                       <button 
                         onClick={() => setActionMenuId(actionMenuId === t.id ? null : t.id)}
                         className="p-2 text-slate-400 hover:text-indigo-600 transition-colors hover:bg-indigo-50 rounded-lg"
                       >
                         <MoreVertical size={18} />
                       </button>

                       {actionMenuId === t.id && (
                         <div className="absolute right-8 top-16 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => { setSelectedTxn(t); setShowDetailModal(true); setActionMenuId(null); }}
                              className="w-full px-6 py-4 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50"
                            >
                              <Eye size={16} /> View Audit Details
                            </button>
                            <button 
                              onClick={() => navigate(`/admin/orders?search=${t.order_id}`)}
                              className="w-full px-6 py-4 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50"
                            >
                              <FileText size={16} /> View Order
                            </button>
                            {t.status === 'Paid' && (
                              <button 
                                onClick={() => { handleRefund(t.id); setActionMenuId(null); }}
                                className="w-full px-6 py-4 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-3 border-b border-slate-50"
                              >
                                <RefreshCcw size={16} /> Process Refund
                              </button>
                            )}
                            <button 
                              onClick={() => { toast.success("Invoice download started..."); setActionMenuId(null); }}
                              className="w-full px-6 py-4 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                            >
                              <Download size={16} /> Download Invoice
                            </button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                       <ShieldAlert size={64} strokeWidth={1} />
                       <p className="font-medium uppercase tracking-[0.2em] text-xs">No matching transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTxn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
           <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-60 mb-2">Transaction Audit</p>
                    <h2 className="text-3xl font-medium tracking-tighter italic">#{selectedTxn.transaction_id}</h2>
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-10">
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Payment Overview</h3>
                       <div className="grid grid-cols-2 gap-8">
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                             <p className="text-2xl font-black text-slate-900">₹{parseFloat(selectedTxn.amount).toLocaleString()}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                             <div className={clsx(
                                "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                getStatusStyle(selectedTxn.status)
                             )}>
                                {selectedTxn.status}
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Method</p>
                             <p className="text-sm font-bold text-slate-700 uppercase">{selectedTxn.method}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gateway Ref</p>
                             <p className="text-sm font-medium text-slate-500">{selectedTxn.gateway_reference || 'N/A'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Parties Involved</h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                                <User size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Customer</p>
                                <p className="text-sm font-bold text-slate-900">{selectedTxn.customer_name} ({selectedTxn.customer_email})</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-400">
                                <Store size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Vendor</p>
                                <p className="text-sm font-bold text-slate-900">{selectedTxn.vendor_name || 'System Transaction'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <div>
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Financial Audit</h3>
                       <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4">
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-400 font-medium uppercase">Order Subtotal</span>
                             <span className="font-bold text-slate-900">₹{(selectedTxn.amount * 0.85).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-400 font-medium uppercase">Platform Commission (15%)</span>
                             <span className="font-bold text-indigo-600">₹{(selectedTxn.amount * 0.15).toFixed(2)}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Total Net Revenue</span>
                             <span className="text-xl font-black text-slate-900">₹{parseFloat(selectedTxn.amount).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    {selectedTxn.status === 'Refunded' && (
                       <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100">
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Refund Details</h4>
                          <p className="text-sm font-medium text-rose-900 mb-2 italic">"{selectedTxn.refund_reason}"</p>
                          <p className="text-[10px] font-bold text-rose-400 uppercase">TXN ID: {selectedTxn.refund_transaction_id}</p>
                       </div>
                    )}

                    <div className="flex gap-4">
                       <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                          <Printer size={18} /> Print Invoice
                       </button>
                       <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                          <Send size={18} /> Resend Receipt
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const Store = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 21 17 13 7 13 7 21"></polyline><path d="M2 3h20"></path></svg>
);

export default CustomerTransactions;
