import React from 'react';
import { CheckCircle2, Landmark } from 'lucide-react';

const RETURN_STATUS_MESSAGES = {
  'Refund Processed': (price) => `Refund of ₹${price}`,
  'Exchange Completed': () => 'Exchange Completed',
  'Return Requested': () => 'Return Requested',
  'Refund Approved': () => 'Refund Approved',
  'Refund Rejected': () => 'Refund Rejected',
  'Return Rejected by Vendor': () => 'Return Rejected',
  'Admin Review': () => 'Refund Pending (Under Review)',
};

const RefundStatusCard = React.memo(({ returnStatus, price }) => {
  const getMessage = () => {
    const fn = RETURN_STATUS_MESSAGES[returnStatus];
    return fn ? fn(price) : 'Return in Progress';
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-700">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        <span>{getMessage()}</span>
      </div>
      <Landmark size={14} className="text-slate-400 shrink-0" />
    </div>
  );
});

RefundStatusCard.displayName = 'RefundStatusCard';
export default RefundStatusCard;
