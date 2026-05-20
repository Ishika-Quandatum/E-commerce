import React from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrderItemCard from './OrderItemCard';

/**
 * OrderCard — full order container.
 * Renders the order header (ID, date, track, total), shipping address,
 * and maps each item through OrderItemCard.
 *
 * Props:
 *   order          — order object from API
 *   onOpenReturn(order)          — bubbles up to Profile to open ReturnRequestModal
 *   onOpenReview(product, rating) — bubbles up to Profile to open WriteReviewModal
 */
const OrderCard = React.memo(({ order, onOpenReturn, onOpenReview }) => {
  const navigate = useNavigate();
  const isDelivered = order.status === 'Delivered';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* ── Order header ── */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Order ID</p>
            <p className="text-sm font-bold text-slate-900">
              #ORD-{order.id.toString().padStart(5, '0')}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Placed On</p>
            <p className="text-sm font-bold text-slate-900">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Price</p>
            <p className="text-base font-black text-indigo-600">₹{order.total_price}</p>
          </div>
        </div>
      </div>

      {/* ── Order body ── */}
      <div className="p-6 space-y-4">
        {/* Shipping address */}
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-2 mb-2 text-slate-800">
            <MapPin size={14} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Shipping Address</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{order.address}</p>
        </div>

        {/* Items list */}
        <div className="space-y-4">
          {(order.items || []).map((item, idx) => (
            <OrderItemCard
              key={item.id ?? idx}
              item={item}
              order={order}
              isDelivered={isDelivered}
              onOpenReview={onOpenReview}
              onOpenReturn={onOpenReturn}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

OrderCard.displayName = 'OrderCard';
export default OrderCard;
