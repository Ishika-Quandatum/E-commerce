import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Banknote, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileDown,
  Search,
  Filter,
  ArrowRight,
  Upload,
  CreditCard,
  IndianRupee,
  X,
  Plus,
  History as HistoryIcon
} from "lucide-react";
import { riderService } from "../../services/api";
import clsx from "clsx";
import toast from "react-hot-toast";

const RiderWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [filter, setFilter] = useState("All");

    // Pay Modal State
    const [paymentData, setPaymentData] = useState({
        amount: "",
        payment_method: "UPI",
        reference_number: "",
        notes: "",
        screenshot: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, transRes] = await Promise.all([
                riderService.getWallet(),
                riderService.getWalletTransactions()
            ]);
            setWallet(walletRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error("Error fetching wallet data", err);
            toast.error("Failed to sync wallet data");
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = () => {
        setPaymentData({
            ...paymentData,
            amount: wallet?.pending_cod_amount || ""
        });
        setShowPayModal(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('amount', paymentData.amount);
            formData.append('payment_method', paymentData.payment_method);
            formData.append('reference_number', paymentData.reference_number);
            formData.append('notes', paymentData.notes);
            if (paymentData.screenshot) {
                formData.append('screenshot', paymentData.screenshot);
            }

            await riderService.submitWalletCOD(formData);
            toast.success("COD submission recorded! Awaiting admin verification.");
            setShowPayModal(false);
            fetchData();
        } catch (err) {
            toast.error("Submission failed. Please check details.");
        }
    };

    const stats = [
        { title: "Today COD Collected", value: wallet?.total_cod_collected || 0, sub: "Last 24h", icon: <Banknote />, color: "bg-indigo-50 text-indigo-600" },
        { title: "Pending to Submit", value: wallet?.pending_cod_amount || 0, sub: "Cash in Hand", icon: <Clock />, color: "bg-amber-50 text-amber-600", highlight: true },
        { title: "Awaiting Approval", value: transactions.filter(t => t.status === 'Submitted').reduce((acc, t) => acc + parseFloat(t.amount), 0), sub: "Submitted", icon: <ArrowRight />, color: "bg-blue-50 text-blue-600" },
        { title: "Verified by Admin", value: wallet?.total_cod_submitted || 0, sub: "Settled", icon: <CheckCircle2 />, color: "bg-emerald-50 text-emerald-600" },
        { title: "Shortage / Diff", value: wallet?.shortage_amount || 0, sub: "Audit Result", icon: <AlertTriangle />, color: "bg-rose-50 text-rose-600" },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Syncing Ledger...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Wallet / <span className="text-indigo-600">COD Collections</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage customer cash collections and platform settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePayNow}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Pay to Admin</span>
                    </button>
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                        <FileDown size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={clsx(
                        "bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-slate-200/50",
                        stat.highlight ? "border-amber-200 shadow-lg shadow-amber-500/5" : "border-slate-100"
                    )}>
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
                            {React.cloneElement(stat.icon, { size: 22 })}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">₹{parseFloat(stat.value).toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Warning for pending cash */}
            {wallet?.pending_cod_amount > 0 && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Pending Cash Submission</p>
                        <p className="text-xs font-medium opacity-80">Please submit ₹{wallet.pending_cod_amount} collected from customers to avoid penalties or account suspension.</p>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-black text-slate-900 font-title">Submission History</h3>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            {["All", "Submitted", "Verified", "Rejected"].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        filter === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Ref ID..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                <th className="px-8 py-5">Date & ID</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Method</th>
                                <th className="px-8 py-5">Reference</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.filter(t => filter === "All" || t.status === filter).length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <HistoryIcon size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No submission records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.filter(t => filter === "All" || t.status === filter).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-slate-900">#{tx.id.toString().padStart(6, '0')}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">₹{parseFloat(tx.amount).toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <CreditCard size={14} className="text-slate-400" />
                                                {tx.payment_method}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400 font-mono">{tx.reference_number || "N/A"}</td>
                                        <td className="px-8 py-5">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                tx.status === 'Verified' ? "bg-emerald-50 text-emerald-600" :
                                                tx.status === 'Submitted' ? "bg-blue-50 text-blue-600" :
                                                "bg-rose-50 text-rose-600"
                                            )}>
                                                {tx.status === 'Submitted' ? 'Awaiting Approval' : tx.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pay Now Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <IndianRupee size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 font-title">Cash Settlement</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submit Collected Cash</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPayModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Amount to Submit</label>
                                <input 
                                    type="number" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Payment Method</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                                        value={paymentData.payment_method}
                                        onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                                    >
                                        <option>UPI</option>
                                        <option>Bank Transfer</option>
                                        <option>Cash Handover</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reference ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="UTR / Ref No."
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                                        value={paymentData.reference_number}
                                        onChange={(e) => setPaymentData({...paymentData, reference_number: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Upload Proof (Screenshot)</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setPaymentData({...paymentData, screenshot: e.target.files[0]})}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 group-hover:bg-slate-100 transition-all">
                                        <Upload size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {paymentData.screenshot ? paymentData.screenshot.name : "Select Image"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Notes</label>
                                <textarea 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                                    rows="2"
                                    placeholder="Any additional info..."
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
                            >
                                Confirm Submission
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderWallet;
