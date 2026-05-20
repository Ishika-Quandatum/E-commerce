import React from 'react';
import { CheckCircle2, Clock, XCircle, ChevronRight, Info, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryStatusCard = React.memo(({ order }) => {
  const navigate = useNavigate();

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  // Calculate return policy deadline (10 days after creation)
  const orderDate = new Date(order.created_at);
  const returnDeadline = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
  const isReturnEnded = new Date() > returnDeadline;
  
  const formattedDeliveryDate = orderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const formattedDeadline = returnDeadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Simple progress timeline mapping
  const timelineStages = ['Placed', 'Packed', 'Shipped', 'Delivered'];
  
  const getStatusIndex = (status) => {
    switch (status) {
      case 'Pending':
      case 'Accepted':
      case 'Processing':
        return 0;
      case 'Packed':
      case 'Dispatch Queue':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
      case 'Returned':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);

  // Status-based configuration
  let statusText = `${order.status}, ${formattedDeliveryDate}`;
  let statusIcon = <Clock className="text-amber-500 w-7 h-7 shrink-0" />;
  let badgeColor = 'text-amber-600';
  let badgeBg = 'bg-amber-50 border-amber-100';

  if (isDelivered) {
    statusText = `Delivered on ${formattedDeliveryDate}`;
    statusIcon = <CheckCircle2 className="text-emerald-500 w-7 h-7 fill-emerald-50 shrink-0" />;
    badgeColor = 'text-emerald-700';
    badgeBg = 'bg-emerald-50 border-emerald-100';
  } else if (isCancelled) {
    statusText = `Cancelled on ${formattedDeliveryDate}`;
    statusIcon = <XCircle className="text-rose-500 w-7 h-7 fill-rose-50 shrink-0" />;
    badgeColor = 'text-rose-700';
    badgeBg = 'bg-rose-50 border-rose-100';
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Status & Icon Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeColor} ${badgeBg}`}>
            {order.status}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {statusText}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {statusIcon}
        </div>
      </div>

      {/* Progress Timeline (Hidden for Cancelled orders) */}
      {!isCancelled && (
        <div className="py-2">
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-6 right-6 h-[3px] bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
            
            {/* Active Line Fill */}
            <div className="absolute left-6 right-6 h-[3px] top-1/2 -translate-y-1/2 z-0">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{ width: `${(currentIndex / (timelineStages.length - 1)) * 100}%` }}
              />
            </div>

            {/* Stages */}
            {timelineStages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <div key={stage} className="flex flex-col items-center relative z-10 w-16 sm:w-20">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isPast 
                        ? 'bg-emerald-500 border border-emerald-500 text-white shadow-md' 
                        : isCurrent 
                        ? 'bg-white border-[3px] border-emerald-500 text-emerald-600 shadow-lg scale-110' 
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-black">{idx + 1}</span>}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-3 font-extrabold uppercase tracking-tight text-center ${
                    isPast || isCurrent ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Return policy details */}
      {isDelivered && (
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Return Eligibility</h4>
            <p className="text-xs text-slate-500 font-medium">
              {isReturnEnded 
                ? `Return policy for this order expired on ${formattedDeadline}.` 
                : `Items are eligible for refund/exchange until ${formattedDeadline}.`
              }
            </p>
          </div>
        </div>
      )}

      {/* CTA Tracking Button */}
      {!isCancelled && (
        <button
          onClick={() => navigate(`/tracking/${order.shipment_id || order.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-2xl text-sm font-black transition-all active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-indigo-100 cursor-pointer"
        >
          <span>See Live Map &amp; Tracking Updates</span>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
});

DeliveryStatusCard.displayName = 'DeliveryStatusCard';
export default DeliveryStatusCard;
