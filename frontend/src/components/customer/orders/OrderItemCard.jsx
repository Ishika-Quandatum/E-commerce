import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReviewStars from './ReviewStars';
import RefundStatusCard from './RefundStatusCard';

const RETURN_STATUS_LABELS = {
  'Refund Processed': 'Refund Completed',
  'Return Requested': 'Return Requested',
  'Refund Approved': 'Refund Approved',
  'Refund Rejected': 'Refund Rejected',
  'Return Rejected by Vendor': 'Return Rejected',
  'Admin Review': 'Under Review',
};

const getImageSrc = (product) => {
  if (!product?.primary_image) return 'https://placehold.co/100';
  return product.primary_image.startsWith('http')
    ? product.primary_image
    : `http://127.0.0.1:8000${product.primary_image}`;
};

/**
 * OrderItemCard — renders a single order line-item.
 * Handles its own product navigation, review stars (via ReviewStars),
 * return button, and refund status banner (via RefundStatusCard).
 *
 * Props:
 *   item        — order item object from API
 *   order       — parent order object (for date, status, return action)
 *   isDelivered — boolean derived from order.status === 'Delivered'
 *   onOpenReview(product, rating) — opens WriteReviewModal in Profile
 *   onOpenReturn(order)           — opens ReturnRequestModal in Profile
 */
const OrderItemCard = React.memo(({ item, order, isDelivered, onOpenReview, onOpenReturn }) => {
  const navigate = useNavigate();

  const statusLabel = item.return_status
    ? (RETURN_STATUS_LABELS[item.return_status] ?? 'Return In Progress')
    : isDelivered
    ? `Delivered on ${new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : order.status;

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
      {/* Rate & Review stars — only for delivered orders */}
      {isDelivered && (
        <ReviewStars product={item.product} onOpenReview={onOpenReview} />
      )}

      {/* Product row — click to navigate to product page */}
      <div
        onClick={() => navigate(`/customer/orders/${order.id}`)}
        className="flex items-center gap-4 p-4 hover:bg-slate-50/20 transition-colors cursor-pointer"
      >
        {/* Rounded thumbnail */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
          <img
            src={getImageSrc(item.product)}
            alt={item.product?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & status */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800">{statusLabel}</p>
          <p className="text-xs text-slate-500 font-medium truncate mt-1">{item.product?.name}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">
            Qty: {item.quantity}
            {item.size && ` • Size: ${item.size}`}
            {` • ₹${item.price}`}
          </p>
        </div>

        <ChevronRight size={18} className="text-slate-400 shrink-0" />
      </div>

      {/* Return button — only when item is eligible */}
      {isDelivered && item.can_return && (
        <div className="flex justify-end p-2 bg-slate-50/20 border-t border-slate-100/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenReturn(order);
            }}
            className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-lg uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={11} /> Return
          </button>
        </div>
      )}

      {/* Refund / exchange status banner */}
      {item.return_status && (
        <RefundStatusCard returnStatus={item.return_status} price={item.price} />
      )}
    </div>
  );
});

OrderItemCard.displayName = 'OrderItemCard';
export default OrderItemCard;
