import React, { useState } from 'react';
import { User as UserIcon, Mail, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../../services/api';

/**
 * SecurityCard — fully self-contained.
 * Manages its own password state and calls authService directly.
 * Only needs `user` prop for displaying read-only credentials.
 */
const SecurityCard = ({ user }) => {
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePasswords = async () => {
    if (!passwords.current || !passwords.new) {
      setError('Please fill in both current and new passwords.');
      return;
    }
    if (passwords.new.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await authService.changePassword({
        old_password: passwords.current,
        new_password: passwords.new,
      });
      setSuccess('Password updated successfully!');
      setPasswords({ current: '', new: '' });
      alert('Password updated successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.old_password ||
        err.response?.data?.new_password ||
        err.response?.data?.error ||
        'Failed to update password. Please check your current password.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
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
          <h2 className="text-xl font-bold text-slate-900">Security &amp; Password</h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Password</p>
            <div className="relative group">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
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
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter a strong new password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
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
  );
};

export default SecurityCard;
