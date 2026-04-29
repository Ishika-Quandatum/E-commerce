import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/api';
import { 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  User, 
  Mail, 
  Store, 
  List as ListIcon, 
  LayoutGrid,
  MoreVertical,
  ExternalLink,
  Phone,
  MapPin
} from 'lucide-react';
import clsx from 'clsx';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' means All
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await vendorService.getVendors(params);
      setVendors(res.data);
    } catch (err) {
      setError('Failed to fetch vendors list.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this vendor? They will gain access to the vendor dashboard.')) return;
    try {
      await vendorService.approve(id);
      fetchVendors();
    } catch (err) {
      alert('Failed to approve vendor.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    try {
      await vendorService.reject(id);
      fetchVendors();
    } catch (err) {
      alert('Failed to reject vendor.');
    }
  };

  const filterTabs = [
    { label: 'All Applications', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Management</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage vendor applications and status.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {filterTabs.map((tab) => (
                    <button
                    key={tab.label}
                    onClick={() => setStatusFilter(tab.value)}
                    className={clsx(
                        "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        statusFilter === tab.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                    >
                    {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button 
                    onClick={() => setViewMode("list")}
                    className={clsx(
                        "p-2 rounded-xl transition-all",
                        viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <ListIcon size={18} />
                </button>
                <button 
                    onClick={() => setViewMode("grid")}
                    className={clsx(
                        "p-2 rounded-xl transition-all",
                        viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <LayoutGrid size={18} />
                </button>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-32 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse shadow-sm">
            Updating Records...
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-[2rem] font-bold text-center border border-rose-100">{error}</div>
      ) : vendors.length === 0 ? (
        <div className="bg-slate-50 text-slate-400 p-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="flex flex-col items-center gap-4">
              <AlertCircle size={48} className="opacity-20" />
              <p className="font-bold uppercase tracking-widest">No {statusFilter.toLowerCase()} vendor applications found.</p>
          </div>
        </div>
      ) : (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 border border-slate-100 p-4 transition-transform group-hover:scale-110 duration-500">
                                <Store size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{vendor.shop_name}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full mt-2 inline-block">
                                    {vendor.shop_type || "Marketplace"}
                                </span>
                            </div>
                        </div>
                        <div className={clsx(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                            vendor.status === 'Approved' ? 'bg-emerald-500 text-white' :
                            vendor.status === 'Rejected' ? 'bg-rose-500 text-white' :
                            'bg-amber-500 text-white'
                        )}>
                            {vendor.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Owner</p>
                                <p className="text-sm font-bold text-slate-700">{vendor.vendor_name || vendor.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email Address</p>
                                <p className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{vendor.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Applied On</p>
                                <p className="text-sm font-bold text-slate-700">{new Date(vendor.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {vendor.status === 'Pending' ? (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleApprove(vendor.id)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Check size={18} />
                                Approve
                            </button>
                            <button 
                                onClick={() => handleReject(vendor.id)}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <X size={18} />
                                Reject
                            </button>
                        </div>
                    ) : (
                        <button className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                            <ShieldCheck size={18} />
                            Already Processed
                        </button>
                    )}
                </div>
            ))}
            </div>
        ) : (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-left">
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Store Details</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vendor Info</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Applied Date</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {vendors.map(vendor => (
                            <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 p-2">
                                            <Store size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">{vendor.shop_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{vendor.shop_type || "Marketplace"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-slate-700">{vendor.vendor_name || vendor.username}</div>
                                    <div className="text-[10px] font-bold text-slate-400 lowercase">{vendor.email}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-slate-700">{new Date(vendor.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(vendor.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={clsx(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        vendor.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        vendor.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                    )}>
                                        {vendor.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {vendor.status === 'Pending' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleApprove(vendor.id)}
                                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(vendor.id)}
                                                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end text-slate-300">
                                            <ShieldCheck size={20} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
      )}
    </div>
  );
};

export default VendorManagement;
