import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnService } from '../../../services/api';
import { ArrowLeft, Clock, MapPin, Package, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import ReturnTimeline from '../../../components/ReturnTimeline';

const VendorReturnDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionReason, setInspectionReason] = useState('');
  const [inspectionImages, setInspectionImages] = useState([]);
  const [vendorDecision, setVendorDecision] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await returnService.getReturnDetail(id);
        setReturnRequest(res.data);
        if (res.data.inspection_notes) setInspectionNotes(res.data.inspection_notes);
        if (res.data.inspection_reason) setInspectionReason(res.data.inspection_reason);
        if (res.data.vendor_decision) setVendorDecision(res.data.vendor_decision);
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
      if (status === 'Refund Rejected') setShowRejectModal(false);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectionSubmit = async () => {
    if (!vendorDecision) return alert("Please select a decision");
    if (!inspectionReason) return alert("Please select an inspection reason");
    if (!inspectionNotes) return alert("Please provide inspection notes");
    
    setActionLoading(true);
    
    const formData = new FormData();
    formData.append('vendor_decision', vendorDecision);
    formData.append('inspection_reason', inspectionReason);
    formData.append('inspection_notes', inspectionNotes);
    inspectionImages.forEach(img => {
      formData.append('inspection_images', img);
    });

    try {
      const res = await returnService.inspectReturn(id, formData);
      setReturnRequest(res.data);
      setShowInspectionModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit inspection");
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
                    ['Refund Processed', 'Refund Approved', 'Approved by Vendor'].includes(returnRequest.status) ? 'bg-green-100 text-green-600' :
                    returnRequest.status === 'Refund Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {returnRequest.status}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Requested on {new Date(returnRequest.created_at).toLocaleDateString('en-GB')}
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

          {/* Inspection Results Summary (Show if already inspected) */}
          {returnRequest.inspection_completed_at && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                    returnRequest.inspection_status === 'Accepted' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {returnRequest.vendor_decision}
                  </div>
               </div>
               
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <CheckCircle2 size={20} className="text-brand-purple" />
                 Inspection Results
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Decision Reason</p>
                    <p className="text-sm font-bold text-slate-800">{returnRequest.inspection_reason}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspected At</p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(returnRequest.inspection_completed_at).toLocaleDateString('en-GB')}, {new Date(returnRequest.inspection_completed_at).toLocaleTimeString('en-US')}
                    </p>
                  </div>
               </div>

               <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Notes</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed italic">
                    "{returnRequest.inspection_notes}"
                  </p>
               </div>

               {returnRequest.images.filter(img => img.is_inspection_image).length > 0 && (
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Inspection Proof</p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {returnRequest.images.filter(img => img.is_inspection_image).map((img, idx) => (
                        <a key={idx} href={img.image} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                          <img src={img.image} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right Column: Actions & History */}
        <div className="w-full lg:w-96 space-y-8">
          {/* Actions */}
          {returnRequest.status === 'Return Requested' && (
            <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-purple/20">
              <h3 className="text-lg font-black mb-6">Take Action</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => handleStatusUpdate('Approved by Vendor', 'Request approved by vendor')}
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

          {returnRequest.status === 'Delivered to Vendor' && (
            <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-purple/20">
              <h3 className="text-lg font-black mb-6">Process Return</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => handleStatusUpdate('Vendor Confirmed Received', 'Vendor confirmed receipt of the product')}
                  disabled={actionLoading}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Package size={18} />
                  Confirm Received
                </button>
              </div>
            </div>
          )}

          {returnRequest.status === 'Vendor Confirmed Received' && (
            <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-purple/20">
              <h3 className="text-lg font-black mb-6">Process Return</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => handleStatusUpdate('Inspection Started', 'Vendor started product inspection')}
                  disabled={actionLoading}
                  className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Clock size={18} />
                  Start Inspection
                </button>
              </div>
            </div>
          )}

          {returnRequest.status === 'Inspection Started' && (
            <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-purple/20">
              <h3 className="text-lg font-black mb-6 italic">Mandatory Inspection</h3>
              <p className="text-xs text-brand-purple-light font-bold mb-6 opacity-80 uppercase tracking-widest leading-relaxed">
                Please verify product condition, tags, and accessories before making a decision.
              </p>
              <button 
                onClick={() => setShowInspectionModal(true)}
                disabled={actionLoading}
                className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Package size={18} />
                Submit Inspection
              </button>
            </div>
          )}

          {/* Return Tracking / History */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
              <Clock size={20} className="text-brand-purple" />
              Process Timeline
            </h3>
            <div className="space-y-8 relative">
              <ReturnTimeline history={returnRequest.history} currentStatus={returnRequest.status} />
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
                onClick={() => handleStatusUpdate('Refund Rejected', rejectionReason)}
                disabled={!rejectionReason || actionLoading}
                className="flex-1 h-14 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 my-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500" />
            
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Professional Inspection</h2>
                  <p className="text-slate-500 text-sm font-medium">Verify product condition, tags, and accessories.</p>
               </div>
               <button onClick={() => setShowInspectionModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle size={24} className="text-slate-400" />
               </button>
            </div>

            <div className="space-y-6">
               {/* Decision Selection */}
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inspection Decision</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setVendorDecision('Return Accepted')}
                      className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                        vendorDecision === 'Return Accepted' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'border-slate-100 hover:border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 size={28} />
                      <span className="font-black text-xs uppercase tracking-widest">Accept Return</span>
                      <p className="text-[8px] font-bold opacity-60">Product is in good condition</p>
                    </button>
                    <button 
                      onClick={() => setVendorDecision('Return Rejected by Vendor')}
                      className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                        vendorDecision === 'Return Rejected by Vendor' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-500/10' : 'border-slate-100 hover:border-slate-200 text-slate-400'
                      }`}
                    >
                      <XCircle size={28} />
                      <span className="font-black text-xs uppercase tracking-widest">Reject Return</span>
                      <p className="text-[8px] font-bold opacity-60">Policy violation detected</p>
                    </button>
                  </div>
               </div>

               {/* Reason Selection */}
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Finding Category</label>
                  <select 
                    value={inspectionReason}
                    onChange={(e) => setInspectionReason(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Product condition good">Product condition good</option>
                    <option value="Wrong product returned">Wrong product returned</option>
                    <option value="Product damaged">Product damaged</option>
                    <option value="Missing accessories">Missing accessories</option>
                    <option value="Tag missing">Tag missing</option>
                    <option value="Used product">Used product</option>
                    <option value="Color changed">Color changed</option>
                    <option value="Size changed">Size changed</option>
                    <option value="Fake product">Fake product</option>
                  </select>
               </div>

               {/* Notes */}
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inspection Notes</label>
                  <textarea 
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="Describe the exact condition of the product and packaging..."
                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-2 ring-indigo-500/20 transition-all outline-none resize-none font-medium"
                  />
               </div>

               {/* Image Upload */}
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Visual Proof (Mandatory for Rejection)</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                     {inspectionImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl bg-slate-100 relative group overflow-hidden border border-slate-200 shadow-sm">
                           <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                           <button 
                             onClick={() => setInspectionImages(inspectionImages.filter((_, i) => i !== idx))}
                             className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <XCircle size={14} />
                           </button>
                        </div>
                     ))}
                     {inspectionImages.length < 5 && (
                       <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-600">
                          <ImageIcon size={20} />
                          <span className="text-[8px] font-black uppercase tracking-tighter">Upload Proof</span>
                          <input 
                             type="file" 
                             multiple 
                             accept="image/*" 
                             className="hidden" 
                             onChange={(e) => setInspectionImages([...inspectionImages, ...Array.from(e.target.files)])}
                          />
                       </label>
                     )}
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => setShowInspectionModal(false)}
                    className="flex-1 h-16 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleInspectionSubmit}
                    disabled={!vendorDecision || !inspectionReason || !inspectionNotes || actionLoading}
                    className="flex-1 h-16 bg-brand-navy text-white rounded-2xl font-black text-sm hover:bg-indigo-900 transition-all disabled:opacity-50 shadow-xl shadow-brand-navy/20"
                  >
                    {actionLoading ? 'Processing...' : 'Submit Inspection'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReturnDetail;
