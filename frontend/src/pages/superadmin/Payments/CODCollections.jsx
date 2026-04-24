import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Banknote,
  User,
  Package,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../../../services/api";
import clsx from "clsx";

const CODCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getCODCollections({
        status: statusFilter === "All" ? "" : statusFilter,
        search: searchTerm
      });
      setCollections(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch COD collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCollections();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, searchTerm]);

  const handleMarkSubmitted = async (id) => {
    if (window.confirm("Confirm cash submission from rider? This will update the rider's pending balance.")) {
        try {
            await paymentService.submitCOD(id);
            fetchCollections();
        } catch (err) {
            console.error("Failed to update COD status");
        }
    }
  };

  const totals = {
      pending: collections.filter(c => c.status === 'Pending').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
      submitted: collections.filter(c => c.status === 'Submitted').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
      alerts: collections.filter(c => c.status === 'Pending' && (new Date() - new Date(c.collected_at)) > 86400000).length // Older than 24h
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title italic">COD <span className="text-brand-blue not-italic">Collections</span></h1>
            <p className="text-slate-500 font-bold mt-1">Monitor and record cash submissions from delivery riders.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
             <Download size={18} /> Export Daily Report
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue relative z-10">
                  <Banknote size={24} />
              </div>
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total COD Collected</p>
                  <h4 className="text-4xl font-black tracking-tighter text-slate-900">₹{(totals.pending + totals.submitted).toLocaleString()}</h4>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                   <Clock size={16} /> Updated Real-time
              </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <AlertCircle size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Pending Submission</p>
                  <h4 className="text-4xl font-black tracking-tighter text-slate-900">₹{totals.pending.toLocaleString()}</h4>
              </div>
              <div className={clsx(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                totals.alerts > 0 ? "text-rose-500" : "text-amber-500"
              )}>
                   <AlertCircle size={16} /> {totals.alerts} Late Submissions
              </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6 group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Submitted</p>
                  <h4 className="text-4xl font-black tracking-tighter text-slate-900">₹{totals.submitted.toLocaleString()}</h4>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                   <CheckCircle2 size={16} /> Verified by Admin
              </div>
          </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96 group focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <Search className="text-slate-400 group-focus-within:text-brand-blue transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by Rider or Order ID..."
              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full text-slate-900 placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {["All", "Pending", "Submitted"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  statusFilter === status 
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                    : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Order & Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Delivery Boy</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-10 py-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold">No collection records found.</td>
                </tr>
              ) : collections.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-slate-900 flex items-center gap-2 group-hover:text-brand-blue transition-colors">
                        <Package size={14} className="text-slate-300" /> #{c.tracking_number}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar size={10} /> {new Date(c.collected_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {c.rider_name?.split(' ').map(n => n[0]).join('') || 'R'}
                       </div>
                       <div>
                          <div className="text-sm font-black text-slate-900">{c.rider_name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{c.rider}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-bold text-slate-600">{c.customer_name}</td>
                  <td className="px-10 py-8">
                    <div className="text-lg font-black text-slate-900">₹{parseFloat(c.amount).toLocaleString()}</div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{c.payment_method}</div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      <span className={clsx(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        c.status === 'Submitted' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {c.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {c.status === 'Pending' ? (
                        <button 
                            onClick={() => handleMarkSubmitted(c.id)}
                            className="bg-brand-blue text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
                        >
                            Record Submission
                        </button>
                    ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                            <CheckCircle2 size={16} /> Verified
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CODCollections;
