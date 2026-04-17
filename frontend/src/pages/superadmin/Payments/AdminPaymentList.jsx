import React, { useState, useEffect } from "react";
import { CreditCard, DollarSign, ArrowDownLeft, ArrowUpRight, Search, FileText, Filter, AlertCircle, Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { paymentService } from "../../../services/api";

const AdminPaymentList = () => {
  const [stats, setStats] = useState({
    total_customer_payments: 0,
    pending_vendor_payouts: 0,
    total_commission_earned: 0,
    failed_transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await paymentService.getPaymentStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch payment stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    { 
      name: "Total Customer Payments", 
      value: `₹${(stats?.total_customer_payments || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      description: "Successful order inflows",
      link: "/admin/payments/customers"
    },
    { 
      name: "Pending Vendor Payouts", 
      value: `₹${(stats?.pending_vendor_payouts || 0).toLocaleString()}`, 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      description: "Awaiting settlement",
      link: "/admin/payments/vendors"
    },
    { 
      name: "Total Commission Earned", 
      value: `₹${(stats?.total_commission_earned || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      description: "Platform net revenue",
      link: "/admin/payments/vendors"
    },
    { 
      name: "Failed Transactions", 
      value: (stats?.failed_transactions || 0).toString(), 
      icon: AlertCircle, 
      color: "text-rose-600", 
      bg: "bg-rose-50",
      description: "Payment errors",
      link: "/admin/payments/customers"
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
            Payment <span className="text-indigo-600 not-italic uppercase tracking-normal">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time financial health and transaction overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <Link 
            key={card.name} 
            to={card.link}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700`} />
            <div className={`${card.bg} ${card.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative shadow-inner shadow-white`}>
              <card.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="relative">
              <div className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{card.name}</div>
              <div className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">{card.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.description}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Link to="/admin/payments/customers" className="group relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white transition-all hover:shadow-2xl hover:shadow-indigo-500/20">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <ArrowDownLeft size={120} strokeWidth={3} />
             </div>
             <div className="relative space-y-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <CreditCard size={24} />
                 </div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter underline decoration-indigo-500 decoration-4 underline-offset-8">Customer Transactions</h3>
                 <p className="text-slate-400 font-medium max-w-sm">Detailed logs of all order payments, transaction IDs, and settlement methods.</p>
                 <div className="pt-4 font-black text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    View Ledger <ArrowUpRight size={16} />
                 </div>
             </div>
        </Link>

        <Link to="/admin/payments/vendors" className="group relative overflow-hidden bg-white border border-slate-100 rounded-[3rem] p-10 text-slate-900 transition-all hover:shadow-2xl hover:border-indigo-100 shadow-xl shadow-slate-200/40">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                <ArrowUpRight size={120} strokeWidth={3} />
             </div>
             <div className="relative space-y-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                 </div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter underline decoration-indigo-500 decoration-4 underline-offset-8">Vendor Payouts</h3>
                 <p className="text-slate-500 font-medium max-w-sm">Manage merchant settlements, commission deductions, and payout history.</p>
                 <div className="pt-4 font-black text-xs text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    Manage Settlements <ArrowUpRight size={16} />
                 </div>
             </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminPaymentList;
