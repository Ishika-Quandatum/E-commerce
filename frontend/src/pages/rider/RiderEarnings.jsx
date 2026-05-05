import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Award, 
  Calendar,
  FileText,
  ChevronRight,
  Zap,
  Clock,
  MapPin,
  CircleDollarSign,
  History,
  Download,
  Info
} from "lucide-react";
import { riderService } from "../../services/api";
import clsx from "clsx";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const RiderEarnings = () => {
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        pending: 0,
        paid: 0,
        incentives: 0,
        bonus: 0,
        deliveries: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
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
            const [transRes, settRes, walletRes] = await Promise.all([
                riderService.getSalaryTransactions(),
                riderService.getSettlements(),
                riderService.getWallet()
            ]);
            
            const transData = transRes.data?.results || transRes.data || [];
            const settData = settRes.data?.results || settRes.data || [];
            const walletData = walletRes.data || {};

            setTransactions(transData);
            setSettlements(settData);
            
            setStats({
                today: walletData.today_earnings || 0,
                deliveries: walletData.total_orders_delivered || 0,
                pending: settData.filter(s => s.status === 'Pending').reduce((acc, s) => acc + parseFloat(s.final_salary || 0), 0),
                paid: settData.filter(s => s.status === 'Paid').reduce((acc, s) => acc + parseFloat(s.final_salary || 0), 0),
                bonus: transData.filter(t => t.transaction_type && t.transaction_type.includes('Bonus')).reduce((acc, t) => acc + parseFloat(t.amount || 0), 0),
                month: settData.reduce((acc, s) => acc + parseFloat(s.final_salary || 0), 0)
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
                        Earnings / <span className="text-indigo-600">Salary</span>
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
                    { label: "Total Deliveries", value: stats.deliveries, icon: <Target />, color: "text-blue-600 bg-blue-50", trend: "This Week" },
                    { label: "Pending Payout", value: stats.pending, icon: <Clock />, color: "text-amber-600 bg-amber-50", trend: "Due in 2 days" },
                    { label: "Attendance Bonus", value: stats.bonus, icon: <Award />, color: "text-emerald-600 bg-emerald-50", trend: "Good Standing" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                                {React.cloneElement(stat.icon, { size: 22 })}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">
                            {typeof stat.value === 'number' && i !== 1 ? formatCurrency(stat.value) : stat.value}
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
                                    <YAxis 
                                        hide 
                                        domain={[0, 'dataMax + 100']}
                                    />
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

                    {/* Transaction History */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 font-title">Earnings History</h3>
                            <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View Ledger</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {transactions.length === 0 ? (
                                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No transactions recorded today</div>
                            ) : transactions.map((tx, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                            tx.transaction_type.includes('Penalty') ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {tx.transaction_type.includes('Bonus') ? <Award size={20} /> : 
                                             tx.transaction_type.includes('Penalty') ? <ArrowDownRight size={20} /> : <CircleDollarSign size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{tx.transaction_type}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {tx.description}
                                                </p>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={clsx(
                                            "text-lg font-black font-title leading-none",
                                            tx.transaction_type.includes('Penalty') ? "text-rose-500" : "text-emerald-600"
                                        )}>
                                            {tx.transaction_type.includes('Penalty') ? '-' : '+'}{formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Monthly Earnings</p>
                        <h2 className="text-4xl font-black font-title tracking-tight mb-8">{formatCurrency(stats.month)}</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Zap size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Base Salary</span>
                                </div>
                                <span className="text-xs font-black">₹8,500</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Target size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Incentives</span>
                                </div>
                                <span className="text-xs font-black">₹2,840</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                            View Payslip Detail
                        </button>
                    </div>

                    {/* Settlements List */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 font-title">Settlements</h3>
                            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><Info size={14} /></div>
                        </div>

                        <div className="space-y-4">
                            {settlements.length === 0 ? (
                                <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No past settlements found</div>
                            ) : settlements.map((sett, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm"><FileText size={18} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{sett.month_display}</p>
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{sett.status}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"><ChevronRight size={18} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.1em] text-center italic">Next cycle starts on 1st of next month</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderEarnings;
