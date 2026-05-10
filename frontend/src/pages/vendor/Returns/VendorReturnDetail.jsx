import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnService } from '../../../services/api';
import { ArrowLeft, Clock, MapPin, Package, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await returnService.getReturnDetail(id);
        setReturnRequest(res.data);
      } catch (err) {
        console.error("Error fetching return detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatusUpdate = async (status, description = '') => {
    setActionLoading(true);
    try {
      const res = await returnService.updateReturnStatus(id, { status, description });
      setReturnRequest(res.data);
      if (status === 'Rejected') setShowRejectModal(false);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading details...</div>;
  if (!returnRequest) return <div className="p-10 text-center font-bold text-rose-500">Return request not found.</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <button 
        onClick={() => navigate('/vendor/returns')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Returns
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Main Info */}
        <div className="flex-1 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-wrap justify-between items-start gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    returnRequest.status === 'Approved' ? 'bg-green-100 text-green-600' :
                    returnRequest.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {returnRequest.status}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Requested on {new Date(returnRequest.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Return Request #RET-{id.toString().padStart(5, '0')}</h1>
                <p className="text-slate-500 font-medium mt-1">Associated with Order #ORD-{returnRequest.order}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential Refund</p>
                <p className="text-4xl font-black text-brand-purple italic">₹{returnRequest.refund_amount}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-brand-purple" />
              Items to be Returned
            </h3>
            <div className="space-y-4">
              {returnRequest.items.map((item) => (
                <div key={item.id} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{item.product_name}</p>
                    <p className="text-xs text-slate-500 font-medium">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Reason</p>
                    <p className="text-xs font-black text-slate-900">{item.reason || returnRequest.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Card */}
          {returnRequest.images.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-brand-purple" />
                Customer Provided Proof
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {returnRequest.images.map((img, idx) => (
                  <a key={idx} href={img.image} target="_blank" rel="noreferrer" className="aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                    <img src={img.image} alt="Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Description Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-purple" />
              Detailed Reason
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
              "{returnRequest.description}"
            </p>
          </div>
        </div>

        {/* Right Column: Actions & History */}
        <div className="w-full lg:w-96 space-y-8">
          {/* Actions */}
          {returnRequest.status === 'Return Requested' && (
            <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-purple/20">
              <h3 className="text-lg font-black mb-6">Take Action</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => handleStatusUpdate('Approved', 'Request approved by vendor')}
                  disabled={actionLoading}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 size={18} />
                  Approve Return
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  <XCircle size={18} />
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {/* Return Tracking / History */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
              <Clock size={20} className="text-brand-purple" />
              Process Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {returnRequest.history.map((h, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                    idx === 0 ? 'bg-brand-purple' : 'bg-slate-200'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {new Date(h.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm font-black text-slate-900">{h.status}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{h.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">By {h.changed_by_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Reject Request</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">Please provide a valid reason for rejecting this return request. This will be shared with the customer.</p>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-rose-500/20 transition-all outline-none resize-none mb-6"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusUpdate('Rejected', rejectionReason)}
                disabled={!rejectionReason || actionLoading}
                className="flex-1 h-14 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReturnDetail;
