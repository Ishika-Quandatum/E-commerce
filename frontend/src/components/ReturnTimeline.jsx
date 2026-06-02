import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const ReturnTimeline = ({ history = [], currentStatus }) => {
  const allSteps = [
    { status: 'Return Requested', label: 'Return Requested', description: 'Return request submitted by customer' },
    { status: 'Approved by Vendor', label: 'Approved by Vendor', description: 'Vendor has approved the request' },
    { status: 'Pickup Assigned', label: 'Pickup Assigned', description: 'Rider assigned for collection' },
    { status: 'Picked Up from Customer', label: 'Picked Up from Customer', description: 'Rider collected the product' },
    { status: 'Delivered to Vendor', label: 'Delivered to Vendor', description: 'Product delivered to vendor' },
    { status: 'Vendor Confirmed Received', label: 'Vendor Confirmed Received', description: 'Vendor confirmed receipt' },
    { status: 'Inspection Started', label: 'Inspection Started', description: 'Vendor is inspecting the product' },
    { status: 'Admin Review', label: 'Admin Review', description: 'Admin is reviewing proof and inspection' },
    { status: 'Refund Approved', label: 'Refund Approved', description: 'Admin approved the refund' },
    { status: 'Refund Processed', label: 'Refund Processed', description: 'Refund credited to customer' }
  ];

  // Helper to find history entry for a step
  const getHistoryEntry = (status) => {
    return history.find(h => h.status === status);
  };

  // Helper to check if a step is completed or current
  const getStepStatus = (status, index) => {
    const currentIndex = allSteps.findIndex(s => s.status === currentStatus);
    const entry = getHistoryEntry(status);
    
    if (entry || (currentIndex >= index && currentIndex !== -1)) {
        if (status === currentStatus) return 'current';
        return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
      {allSteps.map((step, idx) => {
        const stepStatus = getStepStatus(step.status, idx);
        const entry = getHistoryEntry(step.status);
        
        return (
          <div key={idx} className="relative pl-10">
            <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors duration-500 ${
              stepStatus === 'completed' || (stepStatus === 'current' && step.status === 'Refund Processed') ? 'bg-emerald-500' : 
              stepStatus === 'current' ? 'bg-brand-purple animate-pulse' : 'bg-slate-200'
            }`}>
              {stepStatus === 'completed' || (stepStatus === 'current' && step.status === 'Refund Processed') ? (
                <CheckCircle2 size={12} className="text-white" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <p className={`text-sm font-black ${
                  stepStatus === 'pending' ? 'text-slate-400' : 'text-slate-900'
                }`}>
                  {step.label}
                </p>
                {entry && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(entry.timestamp).toLocaleDateString('en-GB')}
                  </p>
                )}
              </div>
              
              <p className={`text-xs font-medium mt-1 ${
                stepStatus === 'pending' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {entry?.description || step.description}
              </p>
              
              {entry?.changed_by_name && (
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">
                  By {entry.changed_by_name}
                </p>
              )}
            </motion.div>
          </div>
        );
      })}

      {['Refund Rejected', 'Return Rejected by Vendor'].includes(currentStatus) && (
        <div className="relative pl-10">
          <div className="absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 bg-rose-500">
             <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div>
            <p className="text-sm font-black text-rose-600">{currentStatus}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {currentStatus === 'Return Rejected by Vendor' 
                ? 'The vendor has rejected the product after inspection.' 
                : 'The refund request was rejected by the admin.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnTimeline;
