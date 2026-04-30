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
    const [activeCodId, setActiveCodId] = useState(null);
    const [filter, setFilter] = useState("Collections");

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

    const handlePayNow = (cod = null) => {
        setPaymentData({
            ...paymentData,
            amount: cod ? cod.amount : (wallet?.pending_cod_amount || ""),
            reference_number: "",
            notes: ""
        });
        setActiveCodId(cod ? cod.id : null);
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
            if (activeCodId) {
                formData.append('cod_collection', activeCodId);
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
        { title: "Today COD Collected", value: wallet?.total_cod_collected || 0, sub: "Revenue", icon: <Banknote />, color: "bg-indigo-50 text-indigo-600" },
        { title: "Pending to Submit", value: wallet?.pending_cod_amount || 0, sub: "Cash in Hand", icon: <Clock />, color: "bg-amber-50 text-amber-600", highlight: true },
        { title: "Submitted Amount", value: wallet?.total_cod_submitted || 0, sub: "To Admin", icon: <CheckCircle2 />, color: "bg-emerald-50 text-emerald-600" },
        { title: "Today's Earnings", value: wallet?.today_earnings || 0, sub: "Your Profit", icon: <IndianRupee />, color: "bg-brand-purple/5 text-brand-purple" },
        { title: "Shortage / Diff", value: wallet?.shortage_amount || 0, sub: "Audit Result", icon: <AlertTriangle />, color: "bg-rose-50 text-rose-600" },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Syncing Ledger...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Wallet / <span className="text-brand-purple">COD Collections</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage customer cash collections and platform settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePayNow}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl shadow-brand-purple/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Pay to Admin</span>
                    </button>
                    <button className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-brand-purple transition-all shadow-sm">
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
            {/* Main Ledger */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-black text-slate-900 font-title">COD Ledger</h3>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            {["Collections", "Submissions"].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                        filter === t ? "bg-white text-brand-purple shadow-sm" : "text-slate-400 hover:text-slate-600"
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
                            placeholder="Search ID..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                {filter === "Collections" ? (
                                    <>
                                        <th className="px-8 py-5">Order ID</th>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Customer Name</th>
                                        <th className="px-8 py-5 text-right">Product Amount</th>
                                        <th className="px-8 py-5 text-right">Shipping</th>
                                        <th className="px-8 py-5 text-right">Tax</th>
                                        <th className="px-8 py-5 text-right">Total Collected</th>
                                        <th className="px-8 py-5 text-right">Payable to Admin</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-5">Submission ID</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5">Method</th>
                                        <th className="px-8 py-5">Reference</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filter === "Collections" ? (
                                (wallet?.recent_cod_collections || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">No collections found</td>
                                    </tr>
                                ) : (
                                    (wallet?.recent_cod_collections || []).map((cod) => (
                                        <tr key={cod.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-slate-900 group-hover:text-brand-purple transition-colors">#{cod.tracking_number?.slice(-8)}</span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                                {new Date(cod.order_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-slate-600">{cod.customer_name}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-700">
                                                ₹{parseFloat(cod.product_amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-500">
                                                ₹{parseFloat(cod.shipping_charge).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-500">
                                                ₹{parseFloat(cod.tax).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-900">
                                                ₹{parseFloat(cod.amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-brand-purple">
                                                ₹{parseFloat(cod.amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                    cod.status === 'Pending' ? "bg-amber-100 text-amber-700" : 
                                                    cod.status === 'Submitted' ? "bg-blue-100 text-blue-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {cod.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    className="text-xs font-black text-brand-purple hover:underline"
                                                    onClick={() => handlePayNow(cod)}
                                                >
                                                    Pay Now
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">No submissions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900">SUB-#{tx.id}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{new Date(tx.created_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-brand-purple">₹{parseFloat(tx.amount).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-600">{tx.payment_method}</td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-400">{tx.reference_number || "N/A"}</td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                    tx.status === 'Submitted' ? "bg-blue-100 text-blue-700" : 
                                                    tx.status === 'Verified' ? "bg-emerald-100 text-emerald-700" : 
                                                    "bg-rose-100 text-rose-700"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-400 hover:text-brand-purple transition-all">
                                                    <FileDown size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
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
                                <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center">
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
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-brand-purple outline-none transition-all"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Payment Method</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-purple outline-none appearance-none cursor-pointer"
                                        value={paymentData.payment_method}
                                        onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash Handover">Cash Handover</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reference ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="UTR / Ref No."
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-purple outline-none"
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
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none resize-none"
                                    rows="2"
                                    placeholder="Any additional info..."
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-brand-purple text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/20 hover:scale-[1.02] transition-all active:scale-95 mt-4"
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
