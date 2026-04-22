import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { User, Mail, Phone, Shield, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

const RiderProfile = () => {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });
    
    const [visibility, setVisibility] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: "", type: "" });
    };

    const toggleVisibility = (field) => {
        setVisibility({ ...visibility, [field]: !visibility[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Client-Side Validation
        if (passwords.new_password !== passwords.confirm_password) {
            return setMessage({ text: "Passwords do not match!", type: "error" });
        }
        if (passwords.new_password.length < 6) {
            return setMessage({ text: "New password must be at least 6 characters.", type: "error" });
        }

        setLoading(true);
        try {
            const response = await authService.changePassword({
                old_password: passwords.old_password,
                new_password: passwords.new_password
            });
            setMessage({ text: "Password updated successfully!", type: "success" });
            setPasswords({ old_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            const errorMsg = err.response?.data?.old_password || err.response?.data?.detail || "Failed to update password.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rider Profile</h1>
                    <p className="text-slate-500 font-bold">Manage your personal information and security settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Personal Info */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <User size={120} />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-8">
                                {user?.first_name?.[0] || user?.username?.[0]}
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <p className="font-black text-slate-900">{user?.first_name} {user?.last_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                    <p className="font-bold text-slate-600 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" /> {user?.email}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <p className="font-bold text-slate-600 flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400" /> {user?.phone || "Not specified"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center gap-2">
                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                    {user?.role}
                                </div>
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                    Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Security Card */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={22} />
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px]">Security / Change Password</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {message.text && (
                                <div className={clsx(
                                    "p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-2",
                                    message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                )}>
                                    {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <p className="text-sm font-bold">{message.text}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Old Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Old Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input 
                                            type={visibility.old ? "text" : "password"}
                                            name="old_password"
                                            value={passwords.old_password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('old')}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {visibility.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={visibility.new ? "text" : "password"}
                                                name="new_password"
                                                value={passwords.new_password}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => toggleVisibility('new')}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {visibility.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input 
                                                type={visibility.confirm ? "text" : "password"}
                                                name="confirm_password"
                                                value={passwords.confirm_password}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => toggleVisibility('confirm')}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {visibility.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
                                {loading ? "Updating Credentials..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
                            Keep your login credentials secure. Avoid using common passwords or sharing your account details with anyone. System will log all credential changes for audit purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderProfile;
