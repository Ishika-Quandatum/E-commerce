import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { returnService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ReturnRequestModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('Wallet');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleItemToggle = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Please select at least one item to return');
      return;
    }
    if (!reason || !description) {
      setError('Please provide a reason and description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('order', order.id);
      formData.append('reason', reason);
      formData.append('description', description);
      formData.append('refund_method', refundMethod);
      
      const items = selectedItems.map(itemId => {
        const item = order.items.find(i => i.id === itemId);
        return {
          order_item: itemId,
          quantity: item.quantity,
          reason: reason // or individual reason if we add it to UI
        };
      });
      formData.append('items', JSON.stringify(items));

      images.forEach((image) => {
        formData.append('images', image);
      });

      await returnService.createReturnRequest(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Return request failed", err);
      setError(err.response?.data?.error || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Request Return</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Order #ORD-{order.id.toString().padStart(5, '0')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              {/* Item Selection */}
              <div className="mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Items to Return</label>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleItemToggle(item.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedItems.includes(item.id) 
                          ? 'border-brand-purple bg-brand-purple/5' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                        <img src={item.product?.primary_image} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{item.product?.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity} • ₹{item.price}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.includes(item.id) ? 'bg-brand-purple border-brand-purple' : 'border-slate-200'
                      }`}>
                        {selectedItems.includes(item.id) && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Reason */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Return Reason</label>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 ring-brand-purple/20 transition-all outline-none"
                  >
                    <option value="">Select a reason</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Size/Color Issue">Size/Color Issue</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Changed my mind">Changed my mind</option>
                  </select>
                </div>

                {/* Refund Method */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Refund Method</label>
                  <select 
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 ring-brand-purple/20 transition-all outline-none"
                  >
                    <option value="Wallet">Wallet (Instant)</option>
                    <option value="Original Payment Method">Original Payment Method</option>
                    <option value="Bank Transfer">Bank Transfer (3-5 days)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Detailed Notes</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about the issue..."
                  className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-brand-purple/20 transition-all outline-none resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Proof Images/Videos</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviews(previews.filter((_, i) => i !== idx));
                          setImages(images.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-purple hover:bg-brand-purple/5 transition-all">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Add File</span>
                    <input type="file" multiple onChange={handleImageChange} className="hidden" accept="image/*,video/*" />
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-2xl mb-8">
                <Info size={18} className="text-blue-500 mt-0.5" />
                <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                  By submitting this request, you agree to our Return Policy. Items must be returned in their original packaging with all tags intact.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-brand-navy text-white rounded-2xl font-black text-lg hover:bg-brand-purple transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Submitting Request...' : 'Submit Return Request'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReturnRequestModal;
