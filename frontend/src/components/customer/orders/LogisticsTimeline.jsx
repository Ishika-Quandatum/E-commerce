import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Package, Truck, MapPin, CheckCircle2, Clock, Info } from 'lucide-react';
import { trackingService } from '../../../services/api';

/* ─────────────────────────────────────────────────────────
   Skeleton loader for timeline while fetching
───────────────────────────────────────────────────────── */
const TimelineSkeleton = () => (
  <div className="animate-pulse space-y-6 py-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-slate-200 mt-1 shrink-0" />
          {i < 3 && <div className="w-0.5 flex-1 bg-slate-100 mt-2" style={{ minHeight: 40 }} />}
        </div>
        <div className="flex-1 pb-6 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-40" />
          <div className="h-3 bg-slate-100 rounded w-56" />
          <div className="h-3 bg-slate-100 rounded w-44" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────
   Individual tracking event row inside a section
───────────────────────────────────────────────────────── */
const TimelineEvent = ({ message, timestamp, isBold }) => (
  <div className="py-1">
    <p className={`text-sm leading-snug ${isBold ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
      {message}
    </p>
    {timestamp && (
      <p className="text-xs text-slate-400 font-medium mt-0.5">{timestamp}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────
   Section header row (the green dot + label + date)
───────────────────────────────────────────────────────── */
const SectionIcon = ({ sectionKey }) => {
  const icons = {
    ORDER_CONFIRMED: <Package size={9} strokeWidth={3} />,
    SHIPPED:         <Truck size={9} strokeWidth={3} />,
    OUT_FOR_DELIVERY: <MapPin size={9} strokeWidth={3} />,
    DELIVERED:       <CheckCircle2 size={9} strokeWidth={3} />,
  };
  return icons[sectionKey] || null;
};

/* ─────────────────────────────────────────────────────────
   Main LogisticsTimeline component
───────────────────────────────────────────────────────── */
const LogisticsTimeline = ({ shipmentId, order, rider: riderProp, onChatOpen }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipmentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await trackingService.getCustomerTimeline(shipmentId);
        if (!cancelled) setTimeline(res.data);
      } catch (err) {
        if (!cancelled) setError('Unable to load shipment timeline.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [shipmentId]);

  // ── Return-policy dates ──────────────────────────────────────────────────
  const isDelivered = order?.status === 'Delivered';
  const isCancelled = order?.status === 'Cancelled';
  const deliveryDate  = new Date(order?.updated_at);

  // Dynamic Return Window Sync
  const items = order?.items || [];
  const returnableItems = items.filter(item => item.is_returnable && item.return_deadline);
  const isAllNonReturnable = items.length > 0 && returnableItems.length === 0;

  let fmtDeadline = "";
  let isReturnEnded = false;

  if (isAllNonReturnable) {
    // Non-returnable category/subcategory
    isReturnEnded = true;
  } else if (returnableItems.length > 0) {
    // Resolve minimum return deadline among all returnable items in this order
    const deadlines = returnableItems.map(item => new Date(item.return_deadline));
    const minDeadline = new Date(Math.min(...deadlines));
    isReturnEnded = new Date() > minDeadline;
    fmtDeadline = minDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // Fallback if items list is empty or not loaded yet
    const fallbackDeadline = new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    isReturnEnded = new Date() > fallbackDeadline;
    fmtDeadline = fallbackDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }


  // ── Rider from timeline response (preferred) or prop fallback ────────────
  const riderData = timeline?.rider || null;
  const showRiderContact = timeline?.is_out_for_delivery ?? false;

  // ── Cancelled state shortcut ─────────────────────────────────────────────
  if (isCancelled) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border text-rose-700 bg-rose-50 border-rose-200">
            Cancelled
          </span>
        </div>
        <p className="text-sm text-slate-500 font-medium">This order has been cancelled.</p>
      </div>
    );
  }

  // ── No shipment yet — fallback to simple status card ────────────────────
  if (!shipmentId && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          <p className="text-sm font-black text-slate-800">
            {order?.status || 'Pending'}
          </p>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Your order has been placed and is being prepared by the seller.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {timeline && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                isDelivered
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-indigo-700 bg-indigo-50 border-indigo-200'
              }`}>
                {isDelivered ? 'Delivered' : timeline?.current_status || order?.status}
              </span>
            )}
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              {isDelivered
                ? `Delivered on ${deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Shipment Timeline'}
            </h2>
          </div>
          {isDelivered && <CheckCircle2 className="text-emerald-500 w-6 h-6 fill-emerald-50 shrink-0" />}
        </div>
      </div>

      {/* ── Timeline body ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        {loading ? (
          <TimelineSkeleton />
        ) : error ? (
          <p className="text-xs text-slate-400 font-medium py-4">{error}</p>
        ) : timeline ? (
          <div className="relative">
            {timeline.sections.map((section, sIdx) => {
              const isLastSection = sIdx === timeline.sections.length - 1;
              const hasEvents     = section.events?.length > 0;

              return (
                <div key={section.key} className="flex gap-0">

                  {/* ── Left: dot + vertical line ── */}
                  <div className="flex flex-col items-center mr-4" style={{ minWidth: 20 }}>
                    {/* Dot */}
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      section.active
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      <SectionIcon sectionKey={section.key} />
                    </div>
                    {/* Connecting line */}
                    {!isLastSection && (
                      <div className={`w-0.5 flex-1 mt-1.5 mb-0 min-h-[32px] ${
                        section.active ? 'bg-emerald-400' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>

                  {/* ── Right: section content ── */}
                  <div className={`flex-1 ${isLastSection ? 'pb-1' : 'pb-5'}`}>

                    {/* Section heading */}
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className={`text-sm font-black leading-tight ${
                        section.active ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {section.label}
                      </span>
                      {section.date && (
                        <span className={`text-xs font-semibold ${
                          section.active ? 'text-slate-500' : 'text-slate-300'
                        }`}>
                          {section.date}
                        </span>
                      )}
                    </div>

                    {/* Shipped section: courier + tracking number */}
                    {section.key === 'SHIPPED' && section.active && section.tracking_number && (
                      <p className="text-[13px] font-black text-slate-800 mb-2 tracking-tight">
                        {section.courier} –{' '}
                        <span className="font-black text-slate-700 tracking-widest uppercase text-[11px]">
                          {String(section.tracking_number).replace(/-/g, '').toUpperCase().slice(-14)}
                        </span>
                      </p>
                    )}

                    {/* Events list */}
                    {section.active && hasEvents && (
                      <div className="space-y-1.5">
                        {section.events.map((ev, eIdx) => (
                          <TimelineEvent
                            key={eIdx}
                            message={ev.message}
                            timestamp={ev.timestamp}
                            isBold={eIdx === 0}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ── Rider Contact strip (visible only after Out For Delivery) ────── */}
      {showRiderContact && riderData?.name && (
        <div className="mx-5 mb-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
            {riderData.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{riderData.name}</p>
            <p className="text-[11px] text-slate-500 font-bold capitalize">
              {riderData.vehicle ? `${riderData.vehicle} · ` : ''}Delivery Partner
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {riderData.phone_raw && (
              <a
                href={`tel:${riderData.phone_raw}`}
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                title={`Call ${riderData.phone_masked}`}
              >
                <Phone size={15} />
              </a>
            )}
            {riderData.phone_raw && (
              <a
                href={`https://wa.me/${riderData.phone_raw.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Chat with delivery partner on WhatsApp"
              >
                <MessageSquare size={15} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Return eligibility note ─────────────────────────────────────── */}
      {isDelivered && (
        <div className="mx-5 mb-5 flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {isAllNonReturnable ? (
              <span className="font-extrabold text-rose-600">Non-returnable item</span>
            ) : isReturnEnded ? (
              `Return policy for this order expired on ${fmtDeadline}.`
            ) : (
              `Items eligible for return/exchange until ${fmtDeadline}.`
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogisticsTimeline;
