import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

const DeliveryLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login({
                username: formData.username,
                password: formData.password
            });

            if (user.role === 'rider') {
                navigate('/rider');
            } else {
                setError("Access Denied: This portal is strictly for Delivery Personnel.");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header Section */}
                <div className="p-10 pb-6 text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/30 text-white rotate-3">
                        <Truck size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Delivery <span className="text-indigo-600 not-italic">Portal</span></h1>
                    <p className="text-slate-400 font-bold mt-2">Professional Logistics Login</p>
                </div>

                <div className="px-10 pb-10">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
                            <AlertCircle size={20} spellCheck />
                            <span className="text-sm font-black uppercase tracking-tight">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                                <User size={14} /> Username / Email
                            </label>
                            <input 
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your ID"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                                <Lock size={14} /> Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm px-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Remember Me</span>
                            </label>
                            <Link to="/forgot-password" size="sm" className="font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest text-[10px]">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter italic"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Log In To Dashboard
                                    <Truck size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm font-bold text-slate-400">Not a delivery boy? <Link to="/login" className="text-indigo-600 hover:underline">Customer Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLogin;
