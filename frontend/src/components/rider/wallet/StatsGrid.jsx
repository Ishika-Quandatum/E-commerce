import React from "react";
import { 
  Banknote, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  AlertTriangle 
} from "lucide-react";
import clsx from "clsx";

const StatsGrid = ({ wallet }) => {
  const stats = [
    { 
      title: "COD Collected", 
      value: wallet?.total_cod_collected || 0, 
      sub: "Cash received from customers", 
      icon: <Banknote size={22} />, 
      color: "bg-indigo-50 text-indigo-600" 
    },
    { 
      title: "Pending to Submit", 
      value: wallet?.pending_cod_amount || 0, 
      sub: "Cash currently with rider", 
      icon: <Clock size={22} />, 
      color: "bg-amber-50 text-amber-600", 
      highlight: true 
    },
    { 
      title: "Submitted Amount", 
      value: wallet?.total_cod_submitted || 0, 
      sub: "Handed over to admin", 
      icon: <CheckCircle2 size={22} />, 
      color: "bg-emerald-50 text-emerald-600" 
    },
    { 
      title: "Today's Earnings", 
      value: wallet?.today_earnings || 0, 
      sub: "Delivery income today", 
      icon: <IndianRupee size={22} />, 
      color: "bg-brand-purple/5 text-brand-purple" 
    },
    { 
      title: "Shortage / Difference", 
      value: wallet?.shortage_amount || 0, 
      sub: wallet?.shortage_amount > 0 ? "Missing cash mismatch" : "No mismatch found", 
      icon: <AlertTriangle size={22} />, 
      color: wallet?.shortage_amount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" aria-label="Wallet Statistics">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={clsx(
            "bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-slate-200/50",
            stat.highlight ? "border-amber-200 shadow-lg shadow-amber-500/5" : "border-slate-100"
          )}
        >
          <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)} aria-hidden="true">
            {stat.icon}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
          <h3 className="text-2xl font-black text-slate-900 leading-none">
            ₹{parseFloat(stat.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
