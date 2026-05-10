import React, { useState, useEffect } from 'react';
import { returnService } from '../../../services/api';
import { Search, Filter, RotateCcw, Eye, CheckCircle2, XCircle, Clock, Truck, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VendorReturnList = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await returnService.getReturnRequests({ 
        status: filterStatus,
        search: searchTerm 
      });
      setReturns(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Error fetching returns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await returnService.updateReturnStatus(id, { status });
      fetchReturns();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Return Requested': 'bg-blue-100 text-blue-600',
      'Approved': 'bg-green-100 text-green-600',
      'Rejected': 'bg-rose-100 text-rose-600',
      'Picked Up': 'bg-amber-100 text-amber-600',
      'Delivered to Vendor': 'bg-indigo-100 text-indigo-600',
      'Refund Completed': 'bg-emerald-100 text-emerald-600',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <RotateCcw className="text-brand-purple" />
            Return Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track product return requests from customers.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 ring-brand-purple/20 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 ring-brand-purple/20 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Return Requested">New Requests</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Picked Up">In Transit</option>
            <option value="Delivered to Vendor">Received</option>
          </select>
        </div>
        <button 
          onClick={fetchReturns}
          className="h-12 bg-brand-navy text-white px-6 rounded-xl font-bold hover:bg-brand-purple transition-all"
        >
          Apply Filters
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100"></div>)}
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 text-center">
          <RotateCcw size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No return requests found</h3>
          <p className="text-slate-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">#RET-{ret.id.toString().padStart(5, '0')}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Order #ORD-{ret.order}</span>
                        <span className="text-xs font-medium text-slate-500 mt-1">{ret.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex -space-x-3">
                        {ret.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                            <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {ret.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                            +{ret.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-brand-purple">₹{ret.refund_amount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{ret.refund_method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(ret.status)}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/vendor/returns/${ret.id}`)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {ret.status === 'Return Requested' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(ret.id, 'Approved')}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if(reason) handleUpdateStatus(ret.id, 'Rejected');
                              }}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReturnList;
