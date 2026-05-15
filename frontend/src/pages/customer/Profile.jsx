import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api';
import { Package, MapPin, Phone, User as UserIcon, Calendar, Clock, RotateCcw, Wallet, Mail, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import ReturnRequestModal from '../../components/customer/ReturnRequestModal';
import { returnService, authService } from '../../services/api';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        const res = await authService.getProfile();
        setWallet(res.data.wallet);
      } catch (err) {
        console.error("Error fetching wallet", err);
      }
    };
    if (user) fetchWallet();
  }, [user]);

  const handleUpdatePasswords = async () => {
    if (!passwords.current || !passwords.new) {
      setError("Please fill in both current and new passwords.");
      return;
    }
    if (passwords.new.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await authService.changePassword({
        old_password: passwords.current,
        new_password: passwords.new
      });
      setSuccess("Password updated successfully!");
      setPasswords({ current: '', new: '' });
      alert("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password", err);
      const msg = err.response?.data?.old_password || err.response?.data?.new_password || err.response?.data?.error || "Failed to update password. Please check your current password.";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  const renderProfileDetails = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Top Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xl shadow-primary-100/50">
            <UserIcon size={64} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.first_name} {user.last_name}</h2>
              <p className="text-slate-400 font-bold mt-1">@{user.username} • {user.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={18} className="text-primary-500" />
                <span className="text-sm font-bold uppercase tracking-wider">Joined April 2026</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Package size={18} className="text-primary-500" />
                <span className="text-sm font-bold uppercase tracking-wider">{orders.length} Total Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-center bg-indigo-50/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-indigo-100 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200">
                <Wallet size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">My Wallet</h3>
            </div>
            <p className="text-5xl font-black text-indigo-600 italic tracking-tighter">₹{wallet?.balance || '0.00'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Available for Shopping</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Login Credentials Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Login Credentials</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Username</p>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  value={user.username} 
                  readOnly 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-700 outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email Address</p>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  value={user.email} 
                  readOnly 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-16 text-sm font-bold text-slate-700 outline-none"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand-orange uppercase tracking-tighter hover:text-brand-orange/80 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
            <p className="text-xs font-medium text-indigo-600/80 leading-relaxed">
              Your account is protected with industry-standard encryption. We recommend changing your password every 90 days.
            </p>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <Key size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Security & Password</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Password</p>
              <div className="relative group">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                />
                <button 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-3">New Password</p>
              <div className="relative group">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter a strong new password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                />
                <button 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100">{error}</p>}
          {success && <p className="text-emerald-600 text-xs font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-100">{success}</p>}

          <button 
            onClick={handleUpdatePasswords}
            disabled={updating}
            className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {updating ? 'Updating...' : 'Update Security Credentials'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                            <img
                              src={item.product?.primary_image ? (item.product.primary_image.startsWith('http') ? item.product.primary_image : `http://127.0.0.1:8000${item.product.primary_image}`) : "https://placehold.co/100"}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product?.name}</p>
                            <p className="text-xs text-slate-500">
                              Qty: {item.quantity}
                              {item.size && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-600 font-black uppercase text-[8px] border border-primary-100">
                                  {item.size}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm font-bold text-primary-600">₹{item.price}</div>
                            {order.status === 'Delivered' && (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => navigate(`/products/${item.product?.id}?write_review=true`)}
                                  className="text-[10px] font-black text-white bg-brand-blue px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-slate-900 transition-all shadow-md shadow-brand-blue/10 text-center"
                                >
                                  Write Review
                                </button>
                                {item.can_return ? (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForReturn(order);
                                      setIsReturnModalOpen(true);
                                    }}
                                    className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg uppercase tracking-tighter hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-1"
                                  >
                                    <RotateCcw size={10} /> Return
                                  </button>
                                ) : item.return_status ? (
                                  <div className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter text-center flex items-center justify-center gap-1 border ${
                                    item.return_status === 'Refund Processed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    ['Refund Rejected', 'Return Rejected by Vendor'].includes(item.return_status) ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    item.return_status === 'Refund Approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    item.return_status === 'Admin Review' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                    {item.return_status === 'Return Requested' ? 'Return Requested' :
                                     item.return_status === 'Refund Processed' ? 'Refunded' :
                                     item.return_status === 'Refund Approved' ? 'Refund Approved' :
                                     item.return_status === 'Refund Rejected' ? 'Refund Rejected' :
                                     item.return_status === 'Return Rejected by Vendor' ? 'Return Rejected' :
                                     item.return_status === 'Admin Review' ? 'Under Review' :
                                     'Return In Progress'}
                                  </div>
                                ) : null}
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
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <main className="w-full">
        {activeTab === 'profile' ? renderProfileDetails() : renderOrderHistory()}
      </main>

      {selectedOrderForReturn && (
        <ReturnRequestModal 
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          order={selectedOrderForReturn}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default Profile;
