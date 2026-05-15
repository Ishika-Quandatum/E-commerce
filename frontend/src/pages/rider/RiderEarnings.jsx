import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  FileText,
  ChevronRight,
  Zap,
  Clock,
  CircleDollarSign,
  History,
  Download,
  Info,
  Banknote,
  ArrowRight
} from "lucide-react";
import { riderService, payrollService } from "../../services/api";
import clsx from "clsx";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';

const RiderEarnings = () => {
    const [stats, setStats] = useState({
        today: 0,
        deliveries: 0,
        pending: 0,
        bonus: 0,
        monthTotal: 0,
        baseSalary: 0,
        incentives: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [codLogs, setCodLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const chartData = [
        { day: 'Mon', amount: 350 },
        { day: 'Tue', amount: 420 },
        { day: 'Wed', amount: 380 },
        { day: 'Thu', amount: 550 },
        { day: 'Fri', amount: 480 },
        { day: 'Sat', amount: 720 },
        { day: 'Sun', amount: 650 },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transRes, settRes, walletRes, codRes] = await Promise.all([
                riderService.getSalaryTransactions(),
                payrollService.getSettlements(),
                payrollService.getWallets(),
                riderService.getWallet() // For COD logs
            ]);
            
            const transData = transRes.data?.results || transRes.data || [];
            const settData = settRes.data?.results || settRes.data || [];
            const walletData = walletRes.data?.[0] || {};
            const codData = codRes.data?.recent_cod_collections || [];

            setTransactions(transData);
            setSettlements(settData);
            setCodLogs(codData);
            
            // Latest settlement for breakdown
            const latestSett = settData[0] || {};
            
            setStats({
                today: transData.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).reduce((acc, t) => acc + parseFloat(t.amount || 0), 0),
                deliveries: latestSett.deliveries_count || 0,
                pending: walletData.pending_payout || 0,
                bonus: latestSett.total_incentive || 0,
                monthTotal: latestSett.net_payable || 0,
                baseSalary: latestSett.base_salary || 0,
                incentives: latestSett.total_incentive || 0
            });
        } catch (err) {
            console.error("Error fetching earnings data", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return `₹${parseFloat(val || 0).toLocaleString('en-IN')}`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Earnings...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Salary / <span className="text-indigo-600">Earnings</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time tracking of your payouts, incentives, and monthly settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                        <Zap size={14} className="animate-pulse" />
                        Live Earning Active
                    </div>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Today's Earnings", value: stats.today, icon: <TrendingUp />, color: "text-indigo-600 bg-indigo-50", trend: "+12%" },
                    { label: "Total Deliveries", value: stats.deliveries, icon: <Target />, color: "text-blue-600 bg-blue-50", trend: "This Month" },
                    { label: "Pending Payout", value: stats.pending, icon: <Clock />, color: "text-amber-600 bg-amber-50", trend: "Awaiting Settlement" },
                    { label: "Attendance Bonus", value: stats.bonus, icon: <Award />, color: "text-emerald-600 bg-emerald-50", trend: "Good Standing" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                                {React.cloneElement(stat.icon, { size: 22 })}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">
                            {i !== 1 ? formatCurrency(stat.value) : stat.value}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Side: Chart & Breakdown */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Performance Chart */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 font-title">Weekly Performance</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Earnings breakdown by day</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><Calendar size={18} /></button>
                                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><Download size={18} /></button>
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                                        dy={10}
                                    />
                                    <YAxis hide domain={[0, 'dataMax + 100']} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                                        labelStyle={{fontWeight: 900, fontSize: '12px', marginBottom: '4px'}}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#4f46e5" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* COD Wallet Logs Section */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Banknote size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 font-title uppercase tracking-tight">Rider Wallet / COD Logs</h3>
                            </div>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                Full History <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Order ID</th>
                                        <th className="px-8 py-5">Collected</th>
                                        <th className="px-8 py-5">Submitted</th>
                                        <th className="px-8 py-5 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {codLogs.slice(0, 5).map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                                {new Date(log.order_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-xs font-black text-slate-900">
                                                #{log.tracking_number?.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-emerald-600">
                                                ₹{parseFloat(log.amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-400">
                                                ₹{log.status === 'Verified' ? parseFloat(log.amount).toLocaleString() : '0'}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-rose-500">
                                                ₹{log.status === 'Pending' ? parseFloat(log.amount).toLocaleString() : '0'}
                                            </td>
                                        </tr>
                                    ))}
                                    {codLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">No recent COD activity</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Side: Monthly Summary & Settlements */}
                <div className="space-y-8">
                    {/* Monthly Pot Card */}
                    <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Monthly Earnings Summary</p>
                        <h2 className="text-4xl font-black font-title tracking-tight mb-8">{formatCurrency(stats.monthTotal)}</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Zap size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Base Salary</span>
                                </div>
                                <span className="text-xs font-black">{formatCurrency(stats.baseSalary)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Target size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Incentives</span>
                                </div>
                                <span className="text-xs font-black">{formatCurrency(stats.incentives)}</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                            View Latest Payslip
                        </button>
                    </div>

                    {/* Settlements List */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 font-title">Settlements</h3>
                            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><Info size={14} /></div>
                        </div>

                        <div className="space-y-4">
                            {settlements.slice(0, 3).map((sett, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm"><FileText size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{new Date(sett.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                            <p className={clsx(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                sett.status === 'Paid' ? "text-emerald-500" : "text-amber-500"
                                            )}>{sett.status}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"><ChevronRight size={18} /></button>
                                </div>
                            ))}
                            {settlements.length === 0 && (
                                <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No past settlements found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderEarnings;
