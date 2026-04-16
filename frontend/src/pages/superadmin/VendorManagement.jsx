import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/api';
import { Check, X, Clock, ShieldCheck, User, Mail, Store } from 'lucide-react';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getVendors();
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Management</h1>
          <p className="text-slate-500 mt-1">Review and manage vendor applications and status.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm">
          <ShieldCheck size={18} />
          Super Admin Panel
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">{error}</div>
      ) : vendors.length === 0 ? (
        <div className="bg-slate-50 text-slate-500 p-12 text-center rounded-3xl border-2 border-dashed border-slate-200">
          No vendor applications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                    <Store size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{vendor.shop_name}</h3>
                    <p className="text-slate-500 text-sm">{vendor.shop_type}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  vendor.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  vendor.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {vendor.status}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <User size={16} className="text-slate-400" />
                  <span className="font-medium text-slate-900">{vendor.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock size={16} className="text-slate-400" />
                  <span>Applied on {new Date(vendor.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {vendor.status === 'Pending' && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleApprove(vendor.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(vendor.id)}
                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
