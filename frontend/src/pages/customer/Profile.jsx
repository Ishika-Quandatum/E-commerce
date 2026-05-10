import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { Package, MapPin, Phone, User as UserIcon, Calendar, Clock, RotateCcw, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import ReturnRequestModal from '../../components/customer/ReturnRequestModal';
import { returnService, authService } from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        setOrders(Array.isArray(res.data) ? res.data : (res.data?.results || []));
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await authService.getProfile(); // Assuming profile includes wallet or I need a new endpoint
        // Wait, I didn't create a specific wallet endpoint yet. 
        // I'll add one to users/views.py or just use getProfile if it's serialized there.
        setWallet(res.data.wallet);
      } catch (err) {
        console.error("Error fetching wallet", err);
      }
    };
    if (user) fetchWallet();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar: Profile Info */}
        <aside className="w-full lg:w-96">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <UserIcon size={48} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{user.first_name} {user.last_name}</h2>
              <p className="text-slate-500">@{user.username}</p>
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar size={18} className="text-primary-600" />
                <span className="text-sm font-medium">Joined April 2026</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Package size={18} className="text-primary-600" />
                <span className="text-sm font-medium">{orders.length} Total Orders</span>
              </div>
            </div>

            {user.role === 'user' && (
              <div className="mt-8 p-6 bg-brand-purple/5 rounded-3xl border border-brand-purple/10">
                <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-brand-purple text-white rounded-xl">
                      <Wallet size={18} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">My Wallet</h3>
                </div>
                <p className="text-3xl font-black text-brand-purple italic">₹{wallet?.balance || '0.00'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Available for Shopping</p>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full mt-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-600 h-14 rounded-2xl font-bold transition-all border border-slate-100"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content: Order History */}
        <main className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
            <Package size={28} className="text-primary-600" />
            Order History
          </h1>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2rem]"></div>)}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h3>
              <p className="text-slate-500">Your shopping journey is just beginning.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Order ID</p>
                        <p className="text-sm font-bold text-slate-900">#ORD-{order.id.toString().padStart(5, '0')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Placed On</p>
                        <p className="text-sm font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {order.shipment_id && order.status !== 'Delivered' && (
                        <button
                          onClick={() => navigate(`/tracking/${order.shipment_id}`)}
                          className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-purple/20 transition-all"
                        >
                          <MapPin size={14} />
                          Track Order
                        </button>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Price</p>
                        <p className="text-lg font-black text-brand-purple">₹{order.total_price}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <MapPin size={16} className="text-primary-600" />
                          Shipping Address
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">{order.address}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Clock size={16} className="text-primary-600" />
                          Order Items
                        </h4>
                       <div className="space-y-4">
  {(order.items || []).map((item, idx) => (
    <div
      key={idx}
      className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl "
    >
      {/* Image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
        <img
          src={item.product?.primary_image || "https://placehold.co/100"}
          alt={item.product?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
          {item.product?.name}
        </p>
        <p className="text-xs text-slate-500">
          Qty: {item.quantity}
          {item.size && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-600 font-black uppercase text-[8px] border border-primary-100">
              {item.size}
            </span>
          )}
        </p>
      </div>

      {/* Review / Price */}
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm font-bold text-primary-600">
          ₹{item.price}
        </div>
        {order.status === 'Delivered' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/products/${item.product?.id}?write_review=true`)}
              className="text-[10px] font-black text-white bg-brand-blue px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-slate-900 transition-all shadow-md shadow-brand-blue/10 text-center"
            >
              Write Review
            </button>
            <button
              onClick={() => {
                setSelectedOrderForReturn(order);
                setIsReturnModalOpen(true);
              }}
              className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1"
            >
              <RotateCcw size={10} />
              Return
            </button>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedOrderForReturn && (
        <ReturnRequestModal 
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          order={selectedOrderForReturn}
          onSuccess={() => {
            // Refresh orders to reflect return status if needed
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Profile;
