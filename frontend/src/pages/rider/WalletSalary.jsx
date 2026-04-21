import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CreditCard,
  Download,
  Info,
  DollarSign,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import { adminService } from "../../services/api";

const WalletSalary = () => {
    const [wallet, setWallet] = useState(null);
    const [salaryConfig, setSalaryConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, salaryRes] = await Promise.all([
                adminService.getRiderWallet(),
                adminService.getRiderSalary()
            ]);
            setWallet(walletRes.data);
            setSalaryConfig(salaryRes.data);
        } catch (err) {
            console.error("Error fetching financial data", err);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { title: "Current Balance", value: `$${wallet?.current_balance || '0.00'}`, icon: <Wallet />, color: "bg-brand-blue" },
        { title: "Total Earned", value: `$${wallet?.total_earned || '0.00'}`, icon: <TrendingUp />, color: "bg-emerald-500" },
        { title: "Pending Payout", value: `$${wallet?.pending_payout || '0.00'}`, icon: <CreditCard />, color: "bg-brand-orange" },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="animate-pulse text-slate-400 font-bold">Loading Finances...</div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Wallet & <span className="text-brand-blue">Salary</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Track your earnings, commissions, and payout history.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                    <Download size={18} /> Download Statement
                </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/10 group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <div className="bg-slate-50 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl text-slate-400">
                                This Month
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold mb-2">{stat.title}</h3>
                        <p className="text-3xl font-black text-slate-900 tracking-tight font-title">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Salary Logic & Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Salary Calculation Info */}
                    <div className="bg-brand-blue rounded-[40px] p-10 text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-2 text-primary-200 text-sm font-black uppercase tracking-[0.2em]">
                                    <Info size={16} /> Salary Structure
                                </div>
                                <h2 className="text-3xl font-black font-title">Your Payment Plan</h2>
                                <p className="text-primary-100 font-medium">Your salary is managed by the Admin. You earn based on a fixed monthly base plus performance-based commissions.</p>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                        <p className="text-[10px] font-black uppercase text-white/60 mb-1">Fixed Monthly</p>
                                        <p className="text-xl font-black">${salaryConfig?.monthly_fixed_salary || '0'}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                        <p className="text-[10px] font-black uppercase text-white/60 mb-1">Per Delivery</p>
                                        <p className="text-xl font-black">${salaryConfig?.per_delivery_commission || '0'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-56 aspect-square bg-white rounded-[32px] p-6 flex flex-col items-center justify-center text-center shadow-xl group hover:rotate-3 transition-transform">
                                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-4">
                                    <Calendar size={32} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Payout</p>
                                <p className="text-xl font-black text-slate-900 font-title tracking-tight">May 01, 2026</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                    <History size={24} />
                                </div>
                                <h3 className="text-xl font-black font-title text-slate-900">Transaction History</h3>
                            </div>
                            <select className="bg-slate-50 border-none outline-none text-xs font-bold px-4 py-2 rounded-xl text-slate-600">
                                <option>Last 30 Days</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            {wallet?.transactions?.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                                    <DollarSign size={48} className="opacity-10 mb-4" />
                                    <p className="font-bold">No transactions found</p>
                                    <p className="text-sm">Earnings from deliveries will appear here.</p>
                                </div>
                            ) : wallet?.transactions?.map((tx, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 rounded-[24px] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            tx.transaction_type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'
                                        }`}>
                                            {tx.transaction_type === 'Credit' ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{tx.description || tx.transaction_type}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${tx.transaction_type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        <p className="text-lg font-black font-title">
                                            {tx.transaction_type === 'Credit' ? '+' : '-'}${tx.amount}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-2 h-full bg-brand-orange" />
                         <h3 className="text-lg font-black font-title mb-6">Wallet Actions</h3>
                         <div className="space-y-3">
                             <button className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95">
                                 Request Advance
                             </button>
                             <button className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold transition-all border border-slate-200">
                                 View Payout Settings
                             </button>
                         </div>
                         <p className="mt-8 text-xs text-slate-400 font-medium leading-relaxed">
                            * Note: Earnings from deliveries are credited within 24 hours of successful delivery confirmation.
                         </p>
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent" />
                        <h3 className="text-lg font-bold mb-4">Need Help?</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">Having issues with your salary or wallet? Contact the support center immediately.</p>
                        <button className="text-brand-orange font-bold text-sm flex items-center gap-2 group">
                            Support Dashboard <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletSalary;
