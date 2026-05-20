import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy, Check, AlertCircle, MapPin, Phone, CreditCard,
  ShoppingBag, Receipt, User, Bike, MessageSquare, X, Send,
} from 'lucide-react';
import api, { trackingService } from '../../../services/api';
import OrderDetailsHeader from '../../../components/customer/orders/OrderDetailsHeader';
import DeliveryStatusCard from '../../../components/customer/orders/DeliveryStatusCard';
import RecommendedProducts from '../../../components/customer/orders/RecommendedProducts';

// ─── Chat Modal ───────────────────────────────────────────────────────────────
const RiderChatModal = ({ rider, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, from: 'rider', text: 'Hello! I am on my way to deliver your order.', time: '2:10 PM' },
    { id: 2, from: 'rider', text: 'I will reach in approximately 15 minutes.', time: '2:11 PM' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const riderName = rider?.rider_name || rider?.user?.first_name || 'Delivery Partner';

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now(), from: 'customer', text, time }]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
            {riderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{riderName}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[10px] text-slate-500 font-bold">Online · Delivery Partner</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50" style={{ minHeight: '260px', maxHeight: '400px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                msg.from === 'customer'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-md'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === 'customer' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-slate-400 font-medium bg-slate-50 border-t border-slate-100 px-4 py-2">
          This is a demo chat. Live messaging will be available soon.
        </p>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-100 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Rider Contact Card ────────────────────────────────────────────────────────
const RiderContactCard = ({ rider, onChat }) => {
  const riderName = rider?.rider_name || rider?.user?.first_name || null;
  const riderPhone = rider?.user?.phone || null;
  const vehicleType = rider?.vehicle_type || null;
  const initial = riderName ? riderName.charAt(0).toUpperCase() : null;

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-2.5 border-b border-slate-50 pb-3.5">
        <Bike size={17} className="text-slate-700" />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Delivery Partner</h3>
      </div>

      {riderName ? (
        <>
          {/* Rider identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-black text-base flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{riderName}</p>
              {vehicleType && (
                <p className="text-[11px] text-slate-500 font-bold capitalize">{vehicleType} · Delivery Rider</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {riderPhone ? (
              <a
                href={`tel:${riderPhone}`}
                className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl py-2.5 text-xs font-black transition-colors"
              >
                <Phone size={14} />
                Call Rider
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl py-2.5 text-xs font-black cursor-not-allowed">
                <Phone size={14} />
                Call Rider
              </div>
            )}
            <button
              onClick={onChat}
              className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl py-2.5 text-xs font-black transition-colors cursor-pointer"
            >
              <MessageSquare size={14} />
              Chat
            </button>
          </div>
        </>
      ) : (
        /* Unassigned / loading state */
        <div className="flex items-center gap-3 py-1">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Awaiting Assignment</p>
            <p className="text-[11px] text-slate-400 font-medium">A rider will be assigned shortly</p>
          </div>
        </div>
      )}
    </section>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`orders/${orderId}/`);
        const data = res.data;
        setOrder(data);
        setError(null);

        // Fetch rider info if a shipment exists — non-blocking
        const shipmentId = data.shipment_id;
        if (shipmentId) {
          try {
            const trackRes = await trackingService.getTrackingDetails(shipmentId);
            setRider(trackRes.data?.rider || null);
          } catch {
            // Rider info unavailable — show unassigned state
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const getImageSrc = (product) => {
    if (!product?.primary_image) return 'https://placehold.co/120';
    return product.primary_image.startsWith('http')
      ? product.primary_image
      : `http://127.0.0.1:8000${product.primary_image}`;
  };

  const handleCopyId = (str) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <OrderDetailsHeader />
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <OrderDetailsHeader />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-black text-slate-900">Could Not Load Order</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            {error || 'We had trouble retrieving information for this order.'}
          </p>
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  // Cost breakdown
  const shippingCharge = parseFloat(order.shipping_charge || 0);
  const taxAmount     = parseFloat(order.tax_amount    || 0);
  const totalPrice    = parseFloat(order.total_price   || 0);
  const subtotal      = totalPrice - shippingCharge - taxAmount;
  const orderIdStr    = `#ORD-${String(order.id).padStart(5, '0')}`;
  const isCancelled   = order.status === 'Cancelled';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <OrderDetailsHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── Responsive 12-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN (8 cols) ── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Items list */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-slate-50">
                <ShoppingBag size={17} className="text-slate-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Items in this Order</h3>
              </div>

              <div className="divide-y divide-slate-50">
                {(order.items || []).map((item, idx) => (
                  <div key={item.id ?? idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start">
                    {/* Thumbnail */}
                    <div
                      onClick={() => navigate(`/products/${item.product?.id}`)}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={getImageSrc(item.product)} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4
                        onClick={() => navigate(`/products/${item.product?.id}`)}
                        className="text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {item.product?.name}
                      </h4>

                      <div className="flex flex-wrap gap-1.5">
                        {item.size && (
                          <span className="bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 px-2 py-0.5 rounded-lg">
                            Size: {item.size}
                          </span>
                        )}
                        {item.product?.color && (
                          <span className="bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 px-2 py-0.5 rounded-lg">
                            {item.product.color}
                          </span>
                        )}
                        <span className="bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 px-2 py-0.5 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-slate-900">
                          ₹{Math.round(item.price).toLocaleString('en-IN')}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-slate-400 font-bold">
                            Subtotal ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery status + progress timeline */}
            <DeliveryStatusCard order={order} />
          </div>

          {/* ── RIGHT COLUMN (4 cols) ── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Order ID copy widget */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order ID</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{orderIdStr}</p>
              </div>
              <button
                onClick={() => handleCopyId(orderIdStr)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-black text-indigo-600 transition-colors cursor-pointer"
              >
                {copied ? (
                  <><Check size={13} className="text-emerald-500" /><span className="text-emerald-600">Copied!</span></>
                ) : (
                  <><Copy size={13} /><span>Copy</span></>
                )}
              </button>
            </section>

            {/* Invoice Summary */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-slate-50">
                <Receipt size={17} className="text-slate-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Invoice Summary</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-500 font-bold">
                <div className="flex justify-between">
                  <span>Placed On</span>
                  <span className="text-slate-800">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><CreditCard size={12} />Payment</span>
                  <span className="text-slate-800 uppercase tracking-wide">{order.payment_method || 'Online'}</span>
                </div>

                <div className="border-t border-slate-50 pt-3 space-y-2.5">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-slate-800">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping Fee</span>
                    {shippingCharge > 0
                      ? <span className="text-slate-800">₹{Math.round(shippingCharge).toLocaleString('en-IN')}</span>
                      : <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">Free</span>
                    }
                  </div>
                  <div className="flex justify-between">
                    <span>GST &amp; Taxes</span>
                    <span className="text-slate-800">₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="border-t-2 border-slate-100 pt-3 flex justify-between items-center font-black">
                  <span className="text-slate-900 text-sm">Grand Total</span>
                  <span className="text-indigo-600 text-base">₹{Math.round(totalPrice).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Shipping Details */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-slate-50">
                <MapPin size={17} className="text-slate-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Shipping Details</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Delivery Address</p>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">{order.address}</p>
                </div>
                <div className="border-t border-slate-50 pt-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Primary</p>
                      <p className="text-xs font-extrabold text-slate-800">{order.phone}</p>
                    </div>
                  </div>
                  {order.alternative_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Alternative</p>
                        <p className="text-xs font-extrabold text-slate-800">{order.alternative_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Rider Contact — only when order is not cancelled */}
            {!isCancelled && (
              <RiderContactCard rider={rider} onChat={() => setChatOpen(true)} />
            )}

          </div>
        </div>

        {/* ── Recommendations — full width ── */}
        <section className="border-t border-slate-100 pt-10">
          <RecommendedProducts />
        </section>

      </main>

      {/* Rider chat modal */}
      {chatOpen && (
        <RiderChatModal rider={rider} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
};

export default OrderDetails;
