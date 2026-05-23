import React from 'react';
import { CheckCircle2, Clock, XCircle, Info, Check } from 'lucide-react';

const DeliveryStatusCard = React.memo(({ order }) => {
  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  const deliveryDate = new Date(order.updated_at);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Dynamic Return Window Sync
  const items = order.items || [];
  const returnableItems = items.filter(item => item.is_returnable && item.return_deadline);
  const isAllNonReturnable = items.length > 0 && returnableItems.length === 0;

  let formattedDeadline = "";
  let isReturnEnded = false;

  if (isAllNonReturnable) {
    // Non-returnable category/subcategory
    isReturnEnded = true;
  } else if (returnableItems.length > 0) {
    // Resolve minimum return deadline among all returnable items in this order
    const deadlines = returnableItems.map(item => new Date(item.return_deadline));
    const minDeadline = new Date(Math.min(...deadlines));
    isReturnEnded = new Date() > minDeadline;
    formattedDeadline = minDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // Fallback if items list is empty or not loaded yet
    const fallbackDeadline = new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    isReturnEnded = new Date() > fallbackDeadline;
    formattedDeadline = fallbackDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }


  // Timeline stages
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

  // Status config
  let statusText = `${order.status}, ${formattedDeliveryDate}`;
  let statusIcon = <Clock className="text-amber-500 w-6 h-6 shrink-0" />;
  let badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';

  if (isDelivered) {
    statusText = `Delivered on ${formattedDeliveryDate}`;
    statusIcon = <CheckCircle2 className="text-emerald-500 w-6 h-6 fill-emerald-50 shrink-0" />;
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (isCancelled) {
    statusText = `Cancelled on ${formattedDeliveryDate}`;
    statusIcon = <XCircle className="text-rose-500 w-6 h-6 fill-rose-50 shrink-0" />;
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
      {/* Status Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
            {order.status}
          </span>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight leading-tight">
            {statusText}
          </h2>
        </div>
        {statusIcon}
      </div>

      {/* Progress Timeline — hidden for Cancelled */}
      {!isCancelled && (
        <div className="relative flex items-center justify-between pt-1 pb-2">
          {/* Track background */}
          <div className="absolute left-5 right-5 h-[2px] bg-slate-100 top-[22px] z-0" />
          {/* Active fill */}
          <div className="absolute left-5 right-5 top-[22px] h-[2px] z-0">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(currentIndex / (timelineStages.length - 1)) * 100}%` }}
            />
          </div>

          {timelineStages.map((stage, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center z-10 w-14 sm:w-16">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isPast
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-[3px] border-emerald-500 text-emerald-600 shadow-md scale-110'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {isPast
                    ? <Check size={14} strokeWidth={3} />
                    : <span className="text-[11px] font-black">{idx + 1}</span>
                  }
                </div>
                <span className={`text-[9px] sm:text-[10px] mt-2 font-extrabold uppercase tracking-tight text-center ${
                  isPast || isCurrent ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Return eligibility — only for delivered orders */}
      {isDelivered && (
        <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isAllNonReturnable ? (
              <span className="font-extrabold text-rose-600">Non-returnable item</span>
            ) : isReturnEnded ? (
              `Return policy for this order expired on ${formattedDeadline}.`
            ) : (
              `Items eligible for return/exchange until ${formattedDeadline}.`
            )}
          </p>
        </div>
      )}
    </div>
  );
});

DeliveryStatusCard.displayName = 'DeliveryStatusCard';
export default DeliveryStatusCard;
