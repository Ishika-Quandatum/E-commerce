import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, Loader2, Bike, Lock, ShieldCheck, Save } from "lucide-react";
import { adminService } from "../../../services/api";

const EditDeliveryBoyModal = ({ isOpen, onClose, rider, onSuccess }) => {
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

  useEffect(() => {
    if (rider) {
      setFormData({
        full_name: `${rider.user.first_name} ${rider.user.last_name || ""}`.trim(),
        phone: rider.user.phone || "",
        email: rider.user.email || "",
        username: rider.user.username || "",
        address: rider.user.address || "",
        vehicle_type: rider.vehicle_type || "Bike",
        license_number: rider.license_number || "",
      });
    }
  }, [rider]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminService.updateRider(rider.id, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update account. Please try unique username/email.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rider) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="flex flex-col lg:flex-row">
            {/* Left Info Panel */}
            <div className="lg:w-1/3 bg-indigo-600 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 h-full flex flex-col">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <Save size={24} />
                    </div>
                    <div className="text-[10px] font-medium text-indigo-100 uppercase tracking-[0.2em] mb-2">Edit Mode</div>
                    <h2 className="text-3xl font-medium tracking-tight leading-tight mb-4">Modify Rider Profile</h2>
                    <p className="text-indigo-100 font-normal mb-8 opacity-80">Update the logistical details and account information for {rider.user.username}.</p>
                    
                    <div className="space-y-4 mt-auto p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
                        <div className="text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-2">Current Capacity</div>
                        <div className="flex justify-between items-center text-sm font-normal">
                           <span>Assigned Orders</span>
                           <span className="bg-white text-indigo-600 px-3 py-1 rounded-lg">{rider.assigned_orders_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 p-10 lg:p-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Admin Control</span>
                        <h3 className="text-2xl font-medium text-slate-900 tracking-tight mt-1">Update Details</h3>
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
                                <User size={14} className="text-indigo-500" /> Full Name
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
                                <Phone size={14} className="text-indigo-500" /> Phone Number
                            </label>
                            <input 
                                required
                                type="text" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={14} className="text-indigo-500" /> Email Address
                            </label>
                            <input 
                                required
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-normal focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} className="text-indigo-500" /> Username
                            </label>
                            <input 
                                required
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-slate-200 cursor-not-allowed border-none rounded-2xl text-sm font-normal outline-none"
                                disabled
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
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-medium text-md shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
          </div>
      </div>
    </div>
  );
};

export default EditDeliveryBoyModal;
