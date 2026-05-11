import React, { useState, useEffect } from 'react';
import { returnService } from '../../../services/api';
import { Search, Filter, RotateCcw, Eye, CheckCircle2, XCircle, ShieldAlert, BarChart3, TrendingDown, Users, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReturnManagement = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    refunded: 0
  });
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refundData, setRefundData] = useState({
    method: 'Wallet',
    account: '',
    transactionId: ''
  });

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await returnService.getReturnRequests({ 
        status: filterStatus,
        search: searchTerm 
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReturns(data);
      
      // Basic stats calculation
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'Return Requested').length,
        adminReview: data.filter(r => r.status === 'Admin Review').length,
        refunded: data.filter(r => r.status === 'Refund Processed').length
      });
    } catch (err) {
      console.error("Error fetching returns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const handleStatusUpdate = async (id, status, description, extraData = {}) => {
    if (!window.confirm(`Are you sure you want to update to ${status}?`)) return;
    try {
      await returnService.updateReturnStatus(id, { 
        status, 
        description,
        ...extraData
      });
      fetchReturns();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title">
            Return <span className="text-brand-purple">Center</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor and manage all product returns across the platform.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", value: stats.total, icon: <Package />, color: "bg-blue-50 text-blue-600" },
          { label: "Awaiting Review", value: stats.adminReview, icon: <RotateCcw />, color: "bg-amber-50 text-amber-600" },
          { label: "Pending Pickup", value: stats.pending, icon: <CheckCircle2 />, color: "bg-indigo-50 text-indigo-600" },
          { label: "Refunded Total", value: `₹${returns.reduce((acc, r) => r.status === 'Refund Processed' ? acc + parseFloat(r.refund_amount) : acc, 0)}`, icon: <TrendingDown />, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Customer, or Vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-brand-purple/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
             <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-6 text-xs font-black uppercase tracking-widest outline-none"
             >
                <option value="">All Statuses</option>
                <option value="Return Requested">Pending</option>
                <option value="Approved by Vendor">Approved</option>
                <option value="Inspection Started">Inspecting</option>
                <option value="Refund Approved">Refund Approved</option>
                <option value="Refund Processed">Refunded</option>
                <option value="Refund Rejected">Refund Rejected</option>
             </select>
             <button onClick={fetchReturns} className="h-12 bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-purple transition-all">
                Refresh
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Vendor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">Fetching return data...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">No return requests found.</td></tr>
              ) : returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">#RET-{ret.id.toString().padStart(5, '0')}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Order #ORD-{ret.order}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 italic underline decoration-rose-300 underline-offset-4">{ret.customer_name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase mt-2">Vendor: {ret.vendor_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-brand-purple italic">₹{ret.refund_amount}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      ret.status === 'Refund Processed' ? 'bg-emerald-100 text-emerald-600' :
                      ret.status === 'Refund Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setSelectedReturn(ret); setShowDetailModal(true); }}
                          className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                        >
                           <Eye size={16} />
                        </button>

                        {ret.status === 'Admin Review' && (
                          <button 
                            onClick={() => { setSelectedReturn(ret); setShowDetailModal(true); }}
                            className="bg-brand-purple text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand-purple/20"
                          >
                            Review & Approve
                          </button>
                       )}
                       {ret.status === 'Refund Approved' && (
                          <button 
                            onClick={() => handleStatusUpdate(ret.id, 'Refund Processed', 'Admin processed and credited the refund')}
                            disabled={ret.status === 'Refund Processed'}
                            className={`bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-600/20 ${ret.status === 'Refund Processed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Process Payment
                          </button>
                       )}
                       <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <ShieldAlert size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Detail & Refund Processing Modal */}
      {showDetailModal && selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-10 my-10 shadow-2xl relative">
            <button 
              onClick={() => setShowDetailModal(false)}
              className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
            >
              <ShieldAlert size={20} className="rotate-45" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Return Info */}
              <div className="space-y-8">
                <div>
                   <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.2em]">Return Summary</span>
                   <h2 className="text-3xl font-black text-slate-900 mt-2">#RET-{selectedReturn.id.toString().padStart(5, '0')}</h2>
                   <p className="text-slate-500 font-medium">Order #ORD-{selectedReturn.order}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Customer</span>
                      <span className="text-slate-900 font-black">{selectedReturn.customer_name}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Phone</span>
                      <span className="text-slate-900 font-black">{selectedReturn.customer_phone || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest">Vendor</span>
                      <span className="text-slate-900 font-black">{selectedReturn.vendor_name}</span>
                   </div>
                   <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900 uppercase">Potential Refund</span>
                      <span className="text-2xl font-black text-brand-purple">₹{selectedReturn.refund_amount}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Package size={16} className="text-brand-purple" /> Items
                   </h3>
                   <div className="space-y-2">
                      {selectedReturn.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-2xl">
                           <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight">{item.product_name}</p>
                              <p className="text-[10px] font-medium text-slate-400">Qty: {item.quantity}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Search size={16} className="text-brand-purple" /> Reason
                   </h3>
                   <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                      "{selectedReturn.description}"
                   </p>
                </div>
              </div>

              {/* Right Column: Inspection & Final Process */}
              <div className="space-y-8">
                 {/* Inspection Results */}
                 <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[2rem] space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Vendor Inspection</h3>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                         selectedReturn.inspection_status === 'Accepted' ? 'bg-emerald-500 text-white' :
                         selectedReturn.inspection_status === 'Rejected' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                       }`}>
                         {selectedReturn.inspection_status}
                       </span>
                    </div>

                    {selectedReturn.vendor_decision ? (
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Decision</p>
                                <p className="text-xs font-bold text-indigo-900">{selectedReturn.vendor_decision}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Reason</p>
                                <p className="text-xs font-bold text-indigo-900">{selectedReturn.inspection_reason || 'N/A'}</p>
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Vendor Notes</p>
                             <p className="text-xs font-bold text-indigo-900">"{selectedReturn.inspection_notes || 'No notes provided'}"</p>
                          </div>
                          
                          <div>
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Condition Proof (Inspection Images)</p>
                             <div className="grid grid-cols-3 gap-2">
                                {selectedReturn.images.filter(img => img.is_inspection_image).map((img, idx) => (
                                   <a key={idx} href={img.image} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-indigo-100 bg-white">
                                      <img src={img.image} alt="" className="w-full h-full object-cover" />
                                   </a>
                                ))}
                                {selectedReturn.images.filter(img => img.is_inspection_image).length === 0 && (
                                   <p className="text-[10px] text-indigo-300 font-bold italic col-span-3">No inspection images uploaded.</p>
                                )}
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center py-6 text-center">
                          <Clock size={32} className="text-indigo-200 mb-2" />
                          <p className="text-[10px] font-black text-indigo-400 uppercase">Awaiting Vendor Inspection</p>
                       </div>
                    )}
                 </div>

                 {/* Action Panel */}
                 <div className="space-y-6">
                    {selectedReturn.status === 'Admin Review' && (
                       <div className="space-y-6">
                          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                             <h3 className="text-sm font-black uppercase tracking-widest mb-4">Compare Proofs</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-slate-400 uppercase">Customer Proof</p>
                                   <div className="flex flex-wrap gap-2">
                                      {selectedReturn.images.filter(img => !img.is_inspection_image).map((img, idx) => (
                                         <a key={idx} href={img.image} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                                            <img src={img.image} className="w-full h-full object-cover" />
                                         </a>
                                      ))}
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black text-slate-400 uppercase">Vendor Proof</p>
                                   <div className="flex flex-wrap gap-2">
                                      {selectedReturn.images.filter(img => img.is_inspection_image).map((img, idx) => (
                                         <a key={idx} href={img.image} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                                            <img src={img.image} className="w-full h-full object-cover" />
                                         </a>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Admin Final Decision</h3>
                          <div className="flex gap-4">
                             <button 
                               onClick={() => handleStatusUpdate(selectedReturn.id, 'Refund Approved', 'Admin approved the refund after evidence review')}
                               className="flex-1 h-14 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                             >
                               <CheckCircle2 size={18} />
                               Approve Refund
                             </button>
                             <button 
                               onClick={() => handleStatusUpdate(selectedReturn.id, 'Refund Rejected', 'Admin rejected the refund after evidence review')}
                               className="flex-1 h-14 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                             >
                               <XCircle size={18} />
                               Reject Refund
                             </button>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                             <ShieldAlert className="text-blue-500 shrink-0" size={18} />
                             <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                                IMPORTANT: Approving refund will automatically CANCEL vendor settlement. Rejecting refund will RELEASE settlement to vendor.
                             </p>
                          </div>
                       </div>
                    )}

                    {selectedReturn.status === 'Refund Approved' && (
                       <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-6">
                          <h3 className="text-sm font-black uppercase tracking-widest">Process Refund Transaction</h3>
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund Method</label>
                                <select 
                                  value={refundData.method}
                                  onChange={(e) => setRefundData({...refundData, method: e.target.value})}
                                  className="w-full h-12 bg-slate-800 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 ring-brand-purple/50 transition-all"
                                >
                                   <option value="Wallet">Wallet Credit</option>
                                   <option value="Bank Transfer">Bank Transfer (Manual)</option>
                                   <option value="UPI">UPI Transfer (Manual)</option>
                                   <option value="Original Payment Method">Original Source (Automatic)</option>
                                </select>
                             </div>

                             {(refundData.method === 'Bank Transfer' || refundData.method === 'UPI') && (
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / TXN ID</label>
                                   <input 
                                     type="text" 
                                     placeholder="Enter transaction reference..."
                                     value={refundData.transactionId}
                                     onChange={(e) => setRefundData({...refundData, transactionId: e.target.value})}
                                     className="w-full h-12 bg-slate-800 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 ring-brand-purple/50 transition-all"
                                   />
                                </div>
                             )}

                             <button 
                               onClick={() => {
                                  handleStatusUpdate(
                                    selectedReturn.id, 
                                    'Refund Processed', 
                                    `Refund processed via ${refundData.method}. Ref: ${refundData.transactionId}`,
                                    {
                                      refund_method: refundData.method,
                                      refund_transaction_id: refundData.transactionId
                                    }
                                  );
                               }}
                               disabled={selectedReturn.status === 'Refund Processed'}
                               className="w-full h-14 bg-brand-purple text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-brand-purple/30 mt-4 disabled:opacity-50"
                             >
                               Finalize & Mark Refunded
                             </button>
                          </div>
                       </div>
                    )}

                    {selectedReturn.status === 'Refund Processed' && (
                       <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                             <CheckCircle2 size={32} />
                          </div>
                          <h3 className="text-lg font-black text-emerald-900 uppercase">Refund Completed</h3>
                          <p className="text-xs font-bold text-emerald-600 mt-1">Funds have been credited to the customer.</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnManagement;
