import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw,
  Key
} from "lucide-react";
import clsx from "clsx";

const AccountSettings = () => {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast("Security credentials updated successfully!");
      setFormData({ currentPassword: "", newPassword: "" });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
              "fixed top-10 right-10 z-50 px-8 py-4 rounded-2xl shadow-2xl font-medium text-xs uppercase tracking-widest flex items-center gap-3",
              notification.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            )}
          >
            <CheckCircle2 size={18} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tighter">
          Account <span className="text-indigo-600">Settings</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Manage your security and login credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Login Credentials Card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Login Credentials</h3>
          </div>
          
          <div className="p-12 space-y-8 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Username</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={user?.username || "admin"} 
                  readOnly
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  readOnly
                  className="w-full pl-14 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:outline-none transition-all"
                />
                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                  Edit
                </button>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
              <p className="text-sm text-indigo-600/80 leading-relaxed font-medium">
                Your account is protected with industry-standard encryption. We recommend changing your password every 90 days.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Key size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-12 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Password</label>
              <div className="relative group">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">New Password</label>
              <div className="relative group">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter a strong new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit"
                disabled={loading || !formData.currentPassword || !formData.newPassword}
                className={clsx(
                  "w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100",
                  loading && "cursor-not-allowed"
                )}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Lock size={20} />}
                {loading ? "Updating..." : "Update Security Credentials"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
