import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Banknote,
  FileText,
  Lock,
  CheckCircle2,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { adminService } from "../../services/api";

const WalletSalary = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const walletRes = await adminService.getRiderWallet();
            setWallet(walletRes.data);
        } catch (err) {
            console.error("Error fetching financial data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="animate-pulse text-slate-400 font-bold">Loading Finances...</div>
        </div>
    );

    const formatCurrency = (val) => {
        return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const stats = [
        { title: "Current Wallet Balance", value: formatCurrency(wallet?.current_balance), sub: "Available Balance", icon: <Wallet />, color: "text-brand-purple bg-brand-purple/10", border: "border-slate-100" },
        { title: "COD Collected", value: formatCurrency(wallet?.total_cod_collected), sub: "This Week", icon: <Banknote />, color: "text-emerald-600 bg-emerald-50", border: "border-slate-100" },
        { title: "Delivery Earnings", value: formatCurrency(wallet?.total_earned), sub: "This Week", icon: <TrendingUp />, color: "text-brand-orange bg-brand-orange/10", border: "border-slate-100" },
        { title: "Payable to Admin", value: formatCurrency(wallet?.pending_cod_amount), sub: "Pending Settlement", icon: <FileText />, color: "text-rose-500 bg-rose-50", border: "border-rose-100 shadow-sm shadow-rose-500/10" },
        
        { title: "Pending Settlement", value: formatCurrency(wallet?.pending_payout), sub: "Not Paid to Admin", icon: <AlertCircle />, color: "text-amber-500 bg-amber-50", border: "border-slate-100" },
        { title: "Hold Amount", value: formatCurrency(wallet?.hold_amount), sub: "On Hold", icon: <Lock />, color: "text-rose-600 bg-rose-50", border: "border-slate-100" },
        { title: "Paid to Admin", value: formatCurrency(wallet?.total_cod_submitted), sub: "This Month", icon: <CheckCircle2 />, color: "text-emerald-600 bg-emerald-50", border: "border-slate-100" },
        { title: "Total Orders Delivered", value: wallet?.total_orders_delivered || 0, sub: "This Week", icon: <PackageCheck />, color: "text-blue-500 bg-blue-50", border: "border-slate-100" },
    ];

    const handleSettlement = () => {
        alert("Payment Intimation Sent to Admin for Reconciliation.");
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                    My <span className="text-brand-purple">Wallet</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Track your earnings, COD collections, and admin settlements.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-[24px] border ${stat.border} flex items-center gap-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                            {React.cloneElement(stat.icon, { size: 24, strokeWidth: 2.5 })}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{stat.title}</p>
                            <p className="text-2xl font-black text-slate-900 font-title tracking-tight">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Transactions Table */}
                <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black font-title text-slate-900">Recent Transactions</h3>
                        <button className="text-sm font-bold text-brand-purple hover:underline">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                                <tr>
                                    <th className="px-4 py-4 rounded-l-xl">Order ID</th>
                                    <th className="px-4 py-4">Customer</th>
                                    <th className="px-4 py-4">COD Amount</th>
                                    <th className="px-4 py-4">Earnings</th>
                                    <th className="px-4 py-4">Payable to Admin</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 rounded-r-xl">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallet?.recent_cod_transactions?.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-slate-400 font-bold">No recent COD transactions found.</td>
                                    </tr>
                                ) : wallet?.recent_cod_transactions?.map((tx, idx) => {
                                    const earning = 40.00;
                                    const payable = parseFloat(tx.amount) - earning;

                                    return (
                                        <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 font-bold text-slate-900">#{tx.tracking_number?.slice(-6) || 'N/A'}</td>
                                            <td className="px-4 py-4 font-medium text-slate-600">{tx.customer_name}</td>
                                            <td className="px-4 py-4 font-black text-slate-900">₹{parseFloat(tx.amount).toFixed(2)}</td>
                                            <td className="px-4 py-4 font-bold text-emerald-600">₹{earning.toFixed(2)}</td>
                                            <td className="px-4 py-4 font-bold text-rose-500">₹{payable.toFixed(2)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-400">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Settlement Summary */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <h3 className="text-xl font-black font-title text-slate-900 mb-8">Settlement Summary</h3>
                    
                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Total Payable to Admin</p>
                                <p className="text-2xl font-black text-slate-900">₹{parseFloat(wallet?.settlement_summary?.total_payable || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Total Paid to Admin</p>
                                <p className="text-xl font-bold text-slate-600">₹{parseFloat(wallet?.settlement_summary?.total_paid || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <p className="text-xs font-black text-rose-400 uppercase tracking-tighter mb-1">Pending Amount</p>
                            <p className="text-3xl font-black text-rose-500 font-title tracking-tight">
                                ₹{parseFloat(wallet?.settlement_summary?.pending_amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}
                            </p>
                        </div>

                        <div className="pt-6">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Settlement</p>
                             <p className="text-sm font-bold text-slate-600">
                                {wallet?.settlement_summary?.last_settlement_date 
                                    ? new Date(wallet.settlement_summary.last_settlement_date).toLocaleDateString()
                                    : '-'}
                             </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSettlement}
                        className="mt-8 w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-purple/20 active:scale-95"
                    >
                        Make Settlement Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletSalary;
