import React, { useState, useEffect } from "react";
import { IndianRupee, Upload, X } from "lucide-react";
import clsx from "clsx";

const PayNowModal = ({ 
  isOpen, 
  onClose, 
  initialAmount, 
  activeCodId, 
  onSubmit 
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values when modal opens or active COD changes
  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount || "");
      setPaymentMethod("UPI");
      setReferenceNumber("");
      setNotes("");
      setScreenshot(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialAmount]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("payment_method", paymentMethod);
      formData.append("reference_number", referenceNumber);
      formData.append("notes", notes);
      
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }
      if (activeCodId) {
        formData.append("cod_collection", activeCodId);
      }
      
      await onSubmit(formData);
    } catch (err) {
      console.error("Form submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 z-10">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center" aria-hidden="true">
              <IndianRupee size={24} />
            </div>
            <div>
              <h3 id="modal-title" className="text-xl font-black text-slate-900 font-title">
                Cash Settlement
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Submit Collected Cash
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            aria-label="Close settlement modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Amount input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
              Amount to Submit
            </label>
            <input 
              id="amount"
              type="number" 
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black focus:ring-2 focus:ring-brand-purple outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              step="any"
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Method & Reference Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                Payment Method
              </label>
              <div className="relative">
                <select 
                  id="paymentMethod"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-purple outline-none cursor-pointer appearance-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash Handover">Cash Handover</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400" aria-hidden="true">
                  ▼
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="refNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
                Reference ID
              </label>
              <input 
                id="refNumber"
                type="text" 
                placeholder="UTR / Ref No."
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-purple outline-none"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <label htmlFor="screenshot" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
              Upload Proof (Screenshot)
            </label>
            <div className="relative group">
              <input 
                id="screenshot"
                type="file" 
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
              <div className="w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 group-hover:bg-slate-100 transition-all">
                <Upload size={18} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[250px]">
                  {screenshot ? screenshot.name : "Select Image"}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">
              Notes
            </label>
            <textarea 
              id="notes"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none resize-none"
              rows="2"
              placeholder="Any additional info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Action button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "w-full bg-brand-purple text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/20 transition-all mt-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-purple/50",
              isSubmitting 
                ? "opacity-80 cursor-not-allowed" 
                : "hover:scale-[1.02] active:scale-95"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              "Confirm Submission"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayNowModal;
