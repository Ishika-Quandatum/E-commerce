import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, ChevronRight, AlertCircle, MapPin, Phone, CreditCard, ShoppingBag, Receipt } from 'lucide-react';
import api from '../../../services/api';
import OrderDetailsHeader from '../../../components/customer/orders/OrderDetailsHeader';
import DeliveryStatusCard from '../../../components/customer/orders/DeliveryStatusCard';
import RecommendedProducts from '../../../components/customer/orders/RecommendedProducts';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`orders/${orderId}/`);
        setOrder(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getImageSrc = (product) => {
    if (!product?.primary_image) return 'https://placehold.co/100';
    return product.primary_image.startsWith('http')
      ? product.primary_image
      : `http://127.0.0.1:8000${product.primary_image}`;
  };

  const handleCopyId = (idString) => {
    navigator.clipboard.writeText(idString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <OrderDetailsHeader />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-black animate-pulse uppercase tracking-wider text-xs">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <OrderDetailsHeader />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Could Not Load Order</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            {error || 'We had trouble retrieving the information for this order.'}
          </p>
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  // Cost calculation
  const shippingCharge = parseFloat(order.shipping_charge || 0);
  const taxAmount = parseFloat(order.tax_amount || 0);
  const totalPrice = parseFloat(order.total_price || 0);
  const subtotal = totalPrice - shippingCharge - taxAmount;
  const orderIdStr = `#ORD-${order.id.toString().padStart(5, '0')}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Premium Navigation Header */}
      <OrderDetailsHeader />

      {/* Main Details Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Dual-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Items & Status Timeline) — Spans 8 cols on desktop */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            
            {/* Product Section */}
            <section className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <ShoppingBag size={20} className="text-slate-800" />
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Items in this Order
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {(order.items || []).map((item, idx) => (
                  <div key={item.id || idx} className="flex gap-4 md:gap-6 py-6 first:pt-0 last:pb-0 items-start">
                    
                    {/* Enlarged Product Thumbnail */}
                    <div 
                      onClick={() => navigate(`/products/${item.product?.id}`)}
                      className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[1.5rem] overflow-hidden border border-slate-200 bg-white flex-shrink-0 cursor-pointer hover:opacity-90 hover:shadow-sm transition-all duration-300"
                    >
                      <img
                        src={getImageSrc(item.product)}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Metadata & Specifications */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h4 
                        onClick={() => navigate(`/products/${item.product?.id}`)}
                        className="text-sm md:text-base font-extrabold text-slate-800 line-clamp-2 leading-snug hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {item.product?.name}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {item.size && (
                          <span className="inline-flex items-center bg-slate-50 border border-slate-100 text-[10px] sm:text-xs font-black uppercase text-slate-600 px-2.5 py-0.5 rounded-lg">
                            Size: {item.size}
                          </span>
                        )}
                        {item.product?.color && (
                          <span className="inline-flex items-center bg-slate-50 border border-slate-100 text-[10px] sm:text-xs font-black uppercase text-slate-600 px-2.5 py-0.5 rounded-lg">
                            Color: {item.product.color}
                          </span>
                        )}
                        <span className="inline-flex items-center bg-slate-50 border border-slate-100 text-[10px] sm:text-xs font-black uppercase text-slate-600 px-2.5 py-0.5 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm md:text-base font-black text-slate-900">
                          ₹{Math.round(item.price).toLocaleString('en-IN')}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-slate-400 font-bold">
                            Subtotal: ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Visual Progress Status Card */}
            <DeliveryStatusCard order={order} />

          </div>

          {/* Right Column (Invoice Summary & Shipping Details) — Spans 4 cols on desktop */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            
            {/* Quick Actions (Order ID Clipboard Copy Widget) */}
            <section className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order ID</p>
                <p className="font-black text-slate-900 text-sm tracking-tight">{orderIdStr}</p>
              </div>

              <button
                onClick={() => handleCopyId(orderIdStr)}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600 font-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </section>

            {/* Order Invoice Summary */}
            <section className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Receipt size={20} className="text-slate-800" />
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Invoice Summary
                </h3>
              </div>

              <div className="space-y-4 font-bold text-xs md:text-sm text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Placed On</span>
                  <span className="text-slate-800">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={14} />
                    Payment Mode
                  </span>
                  <span className="text-slate-800 uppercase tracking-wide">{order.payment_method || 'Online Card'}</span>
                </div>

                <div className="border-t border-slate-50 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="text-slate-800">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping Fee</span>
                    {shippingCharge > 0 ? (
                      <span className="text-slate-800">₹{Math.round(shippingCharge).toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-emerald-600 uppercase font-black tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Free</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GST &amp; Taxes</span>
                    <span className="text-slate-800">₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="border-t-[2px] border-slate-100 pt-4 flex justify-between items-center font-black">
                  <span className="text-slate-900 text-sm md:text-base">Grand Total</span>
                  <span className="text-indigo-600 text-lg md:text-xl tracking-tight">₹{Math.round(totalPrice).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Shipping details */}
            <section className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <MapPin size={20} className="text-slate-800" />
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Shipping Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Delivery Address</p>
                  <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">
                    {order.address}
                  </p>
                </div>

                <div className="border-t border-slate-50 pt-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Primary Phone</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-1">{order.phone}</p>
                    </div>
                  </div>

                  {order.alternative_phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Alternative Phone</p>
                        <p className="text-xs font-extrabold text-slate-800 mt-1">{order.alternative_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>

        </div>

        {/* Recommended Products Grid — Spans the full width of the container */}
        <section className="border-t border-slate-100 pt-12">
          <RecommendedProducts />
        </section>

      </main>
    </div>
  );
};

export default OrderDetails;
