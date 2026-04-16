import React, { useState } from "react";
import { CreditCard, DollarSign, ArrowDownLeft, ArrowUpRight, Search, FileText, Filter } from "lucide-react";

const AdminPaymentList = () => {
  // Static mock data for payments since backend might not have a dedicated aggregator yet
  const transactions = [
    { id: "TXN102938", date: "2024-04-16", amount: "₹2,500.00", status: "Success", method: "UPI", merchant: "Fresh Mart", user: "Rahul Sharma" },
    { id: "TXN102939", date: "2024-04-16", amount: "₹450.00", status: "Success", method: "Cards", merchant: "Organic Store", user: "Anita Singh" },
    { id: "TXN102940", date: "2024-04-15", amount: "₹1,200.00", status: "Pending", method: "Netbanking", merchant: "Tech Hub", user: "Karan Johar" },
    { id: "TXN102941", date: "2024-04-15", amount: "₹9,800.00", status: "Failed", method: "UPI", merchant: "Fashion House", user: "Priya Das" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Capital <span className="text-indigo-600 not-italic uppercase tracking-normal">Flow</span></h1>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                  <ArrowDownLeft size={14} strokeWidth={3} /> Inflow: ₹1.4M
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-200 shadow-sm">
                  <ArrowUpRight size={14} strokeWidth={3} /> Payouts: ₹840K
              </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs shadow-sm shadow-slate-200/50 hover:bg-slate-50 transition-all">
                <FileText size={18} /> Export CSV
            </button>
            <button className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                <Filter size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 rounded-[3rem] overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Real-time Settlement Log</h3>
                <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-2 px-4 shadow-inner">
                    <Search size={14} className="text-slate-400" />
                    <input type="text" placeholder="Search reference..." className="bg-transparent border-none outline-none text-[11px] font-bold w-32" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-50">
                    <thead className="bg-slate-50/20">
                    <tr>
                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Change</th>
                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                    {transactions.map((t) => (
                        <tr key={t.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                            <td className="px-10 py-6 whitespace-nowrap">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black border ${t.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-inner' : t.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {t.id.slice(0, 1)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{t.id}</div>
                                        <div className="text-[10px] font-black text-slate-400 leading-none mt-1 uppercase tracking-widest">{t.date}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap">
                                <div className="text-sm font-black text-slate-900">{t.amount}</div>
                                <div className="text-[10px] font-bold text-slate-400 italic">Merchant: {t.merchant}</div>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-900/10">
                                    {t.method}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Financial Highlights Sidebar */}
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <CreditCard size={32} strokeWidth={2.5} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60 italic">Available Balance</h4>
                <div className="text-4xl font-black italic tracking-tighter mb-8 leading-none">₹8,45,200.00</div>
                
                <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs font-bold opacity-80 uppercase tracking-widest">
                        <span>Withdrawals</span>
                        <span className="text-white">₹2.4M</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white rounded-full shadow-[0_0_10px_white]" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[3rem] p-10">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Distribution
                </h4>
                <div className="space-y-8">
                    {[
                        { name: "UPI Infrastructure", value: 65, color: "bg-indigo-500 shadow-indigo-500/30" },
                        { name: "Payment Gateways", value: 25, color: "bg-purple-500 shadow-purple-500/30" },
                        { name: "Wallet Settlement", value: 10, color: "bg-pink-500 shadow-pink-500/30" }
                    ].map((item) => (
                        <div key={item.name}>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name}</span>
                                <span className="text-xs font-black text-slate-900 italic uppercase">{item.value}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentList;
