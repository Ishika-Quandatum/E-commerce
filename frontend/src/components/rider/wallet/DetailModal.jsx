import React, { useEffect } from "react";
import { Package, X } from "lucide-react";
import clsx from "clsx";

const DetailModal = ({ 
  isOpen, 
  onClose, 
  selectedItem 
}) => {
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

  if (!isOpen || !selectedItem) return null;

  const isCollection = !!selectedItem.tracking_number;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
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
            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <Package size={24} />
            </div>
            <div>
              <h3 id="detail-modal-title" className="text-xl font-black text-slate-900 font-title">
                {isCollection ? "Order Details" : "Submission Details"}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                #{selectedItem.tracking_number || `SUB-${selectedItem.id}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            aria-label="Close detail modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6">
          {isCollection ? (
            // Layout for COD Collections and Pending Items
            <>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{selectedItem.customer_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="font-bold text-slate-900">{selectedItem.payment_method}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Amount</p>
                  <p className="font-bold text-slate-900">₹{parseFloat(selectedItem.product_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping + Tax</p>
                  <p className="font-bold text-slate-900">
                    ₹{(parseFloat(selectedItem.shipping_charge || 0) + parseFloat(selectedItem.tax || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Collected</p>
                    <p className="text-2xl font-black text-slate-900">
                      ₹{parseFloat(selectedItem.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase",
                    selectedItem.status === 'Pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {selectedItem.status}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Layout for Submissions/Transactions
            <>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Method</p>
                  <p className="font-bold text-slate-900">{selectedItem.payment_method}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                  <p className="font-bold text-slate-900">{selectedItem.reference_number || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rider Notes</p>
                  <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl italic">
                    "{selectedItem.notes || "No notes provided"}"
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center bg-brand-purple/5 p-4 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted Amount</p>
                    <p className="text-2xl font-black text-brand-purple">
                      ₹{parseFloat(selectedItem.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase",
                    selectedItem.status === 'Verified' ? "bg-emerald-100 text-emerald-700" : 
                    selectedItem.status === 'Submitted' ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {selectedItem.status}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
