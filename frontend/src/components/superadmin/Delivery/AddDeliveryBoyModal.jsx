import React, { useState } from "react";
import { X, User, Phone, Mail, MapPin, Loader2, Bike, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { adminService } from "../../../services/api";

const AddDeliveryBoyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    username: "",
    address: "",
    vehicle_type: "Bike",
    license_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminService.createRider(formData);
      setShowResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account. Please try unique username/email.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {showResult ? (
          <div className="p-12 text-center space-y-6">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <ShieldCheck size={48} />
             </div>
             <h2 className="text-3xl font-medium text-slate-900 tracking-tight">Account Created Successfully!</h2>
             <p className="text-slate-500 font-normal max-w-md mx-auto">
               The delivery boy account has been initialized. Please share these credentials with the rider.
             </p>
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 max-w-sm mx-auto text-left space-y-4">
                <div className="flex justify-between">
                   <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Username</span>
                   <span className="text-sm font-medium text-slate-800">{showResult.username || formData.username}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Auto-Generated Password</span>
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm tracking-tighter shadow-sm border border-indigo-100">
                     {showResult.password}
                   </div>
                </div>
             </div>
             <button 
                onClick={() => { setShowResult(null); onClose(); }}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-medium text-sm uppercase tracking-widest hover:scale-105 transition-all"
             >
                Close & Finish
             </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* Left Info Panel */}
            <div className="lg:w-1/3 bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/20" />
                <div className="relative z-10 h-full flex flex-col">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/20">
                        <Bike size={24} />
                    </div>
                    <div className="text-[10px] font-medium text-indigo-400 uppercase tracking-[0.2em] mb-2">Fleet Management</div>
                    <h2 className="text-3xl font-medium tracking-tight leading-tight mb-4">Onboard New Delivery Boy</h2>
                    <p className="text-slate-400 font-normal mb-8">Add a new delivery boy account to the system. The platform will automatically generate a secure password upon submission.</p>
                    
                    <div className="space-y-6 mt-auto">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-normal">1</div>
                            <div>
                                <h4 className="text-sm font-normal text-white leading-none mb-1">Account Info</h4>
                                <p className="text-[11px] text-slate-500">Provide personal and contact details.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-normal">2</div>
                            <div>
                                <h4 className="text-sm font-normal text-white leading-none mb-1">Verify Logistics</h4>
                                <p className="text-[11px] text-slate-500">Enter vehicle and license information.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 p-10 lg:p-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Admin Control</span>
                        <h3 className="text-2xl font-medium text-slate-900 tracking-tight mt-1 underline decoration-indigo-500 decoration-4 underline-offset-4">Registration Form</h3>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-normal animate-in shake duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-indigo-500" /> Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                required
                                type="text" 
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter full name" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={14} className="text-indigo-500" /> Phone Number <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                required
                                type="text" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={14} className="text-indigo-500" /> Email Address <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                required
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="rider@example.com" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={14} className="text-indigo-500" /> Username / ID <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                required
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="unique_rider_id" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-500" /> Home Address
                            </label>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Street, City" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Bike size={14} className="text-indigo-500" /> Vehicle Type
                            </label>
                            <select 
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            >
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                                <option value="Bicycle">Bicycle</option>
                                <option value="Van">Van</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <X size={14} className="text-indigo-500" /> DL Number
                            </label>
                            <input 
                                type="text" 
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleChange}
                                placeholder="License Registration Number" 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col md:flex-row items-center gap-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-medium text-md shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Initialize Rider Account"}
                        </button>
                        <p className="text-[11px] font-normal text-slate-400 max-w-xs leading-relaxed text-center md:text-left italic">
                           Note: The password will be auto-generated and displayed after account initialization.
                        </p>
                    </div>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDeliveryBoyModal;
