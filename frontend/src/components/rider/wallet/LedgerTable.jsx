import React, { useState, useMemo } from "react";
import { Search, FileDown } from "lucide-react";
import clsx from "clsx";

const LedgerTable = ({ 
  wallet, 
  transactions, 
  filter, 
  setFilter, 
  onPayNow, 
  onViewDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const collections = wallet?.recent_cod_collections || [];

  // Filter collections and transactions based on active tab and search term
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (filter !== "Submissions") {
      // "Collections" or "Pending"
      const baseCollections = filter === "Pending" 
        ? collections.filter(c => c.status === "Pending")
        : collections;

      if (!term) return baseCollections;

      return baseCollections.filter(item => {
        const orderId = (item.tracking_number || "").toLowerCase();
        const customer = (item.customer_name || "").toLowerCase();
        return orderId.includes(term) || customer.includes(term);
      });
    } else {
      // "Submissions"
      if (!term) return transactions;

      return transactions.filter(tx => {
        const subId = `sub-#${tx.id}`.toLowerCase();
        const rawId = `${tx.id}`.toLowerCase();
        const ref = (tx.reference_number || "").toLowerCase();
        const method = (tx.payment_method || "").toLowerCase();
        return subId.includes(term) || rawId.includes(term) || ref.includes(term) || method.includes(term);
      });
    }
  }, [filter, collections, transactions, searchTerm]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header and Controls */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-black text-slate-900 font-title">COD Ledger</h3>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="tablist" aria-label="Ledger Tabs">
            {["Collections", "Pending", "Submissions"].map(t => (
              <button 
                key={t}
                role="tab"
                aria-selected={filter === t}
                onClick={() => {
                  setFilter(t);
                  setSearchTerm(""); // Reset search when switching tabs
                }}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple",
                  filter === t ? "bg-white text-brand-purple shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Search ID or name..."
            aria-label="Search ledger transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none w-full transition-all"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-50">
              {filter === "Collections" || filter === "Pending" ? (
                <>
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Payment Method</th>
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
            {filter !== "Submissions" ? (
              filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-8 py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">
                    No {filter.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                filteredData.map((cod) => (
                  <tr key={cod.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900 group-hover:text-brand-purple transition-colors">
                        #{cod.tracking_number?.slice(-8)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400">
                      {new Date(cod.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                        cod.payment_method === 'COD' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {cod.payment_method}
                      </span>
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
                      ₹{cod.payment_method === 'COD' ? parseFloat(cod.amount).toLocaleString() : "0"}
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
                      {cod.payment_method === 'COD' && cod.status === 'Pending' ? (
                        <button 
                          className="text-xs font-black text-brand-purple hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-md px-1"
                          onClick={() => onPayNow(cod)}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button 
                          onClick={() => onViewDetails(cod)}
                          className="text-xs font-bold text-slate-400 hover:text-brand-purple transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-md px-1"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )
            ) : (
              filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs">
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">SUB-#{tx.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-brand-purple">
                      ₹{parseFloat(tx.amount).toLocaleString()}
                    </td>
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
                      {/* Submissions file down downloads proof screenshot if exists */}
                      <button 
                        onClick={() => onViewDetails(tx)}
                        className="p-2 text-slate-400 hover:text-brand-purple transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl"
                        aria-label={`View submission SUB-${tx.id} details`}
                      >
                        <FileDown size={18} aria-hidden="true" />
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
  );
};

export default LedgerTable;
