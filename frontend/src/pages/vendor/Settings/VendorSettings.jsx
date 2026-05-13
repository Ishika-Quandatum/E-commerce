import React, { useState, useEffect, useRef } from "react";
import { 
    User, Store, MapPin, Truck, Save, Upload, 
    X, Check, AlertCircle, Eye, EyeOff, Shield,
    Clock, Calendar, Globe, Trash2, Mail, Loader2, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { vendorService, authService, productService } from "../../../services/api";
import MapPicker from "../../../components/vendor/common/MapPicker";
import { toast } from "react-hot-toast";
import clsx from "clsx";

const VendorSettings = () => {
    const [activeTab, setActiveTab] = useState("shop"); // shop, account, address, logistics
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [data, setData] = useState(null);
    const [previews, setPreviews] = useState({ logo: null, banner: null });
    const [showPassword, setShowPassword] = useState(false);

    const [categories, setCategories] = useState([]);
    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await productService.getCategories({ top_level: 'true' });
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await vendorService.getProfile();
            setData(res.data);
            setPreviews({
                logo: res.data.shop_logo,
                banner: res.data.shop_banner
            });
        } catch (err) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleWorkingDaysToggle = (day) => {
        setData(prev => {
            const currentDays = prev.working_days || [];
            if (currentDays.includes(day)) {
                return { ...prev, working_days: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, working_days: [...currentDays, day] };
            }
        });
    };

    const handleLocateAddress = async (isAuto = false) => {
        if (!data.shop_address || !data.city || !data.pincode) {
            if (!isAuto) toast.error("Enter address, city and pincode first");
            return;
        }

        setGeocodingLoading(true);
        let query = `${data.shop_address}, ${data.city}, ${data.pincode}, India`;
        
        try {
            let response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            let results = await response.json();
            
            // Fallback: If full address fails, try City + Pincode
            if (!results || results.length === 0) {
                query = `${data.city}, ${data.pincode}, India`;
                response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
                results = await response.json();
            }

            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                setData(prev => ({ 
                    ...prev, 
                    location_lat: parseFloat(lat), 
                    location_lng: parseFloat(lon) 
                }));
                if (!isAuto) toast.success("Coordinates updated from address!");
            } else {
                if (!isAuto) toast.error("Could not find precise coordinates for this address.");
            }
        } catch (err) {
            if (!isAuto) toast.error("Geocoding failed. Try manual placement.");
        } finally {
            setGeocodingLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
            setData(prev => ({ ...prev, [type === 'logo' ? 'shop_logo' : 'shop_banner']: file }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            
            // Append only modified/relevant fields based on activeTab
            // For simplicity here, we can send everything or filter
            Object.keys(data).forEach(key => {
                if (key === 'working_days') {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (['shop_logo', 'shop_banner'].includes(key)) {
                    if (data[key] instanceof File) {
                        formData.append(key, data[key]);
                    }
                } else {
                    if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                }
            });

            await vendorService.updateProfile(formData);
            toast.success("Settings updated successfully!");
            fetchSettings();
        } catch (err) {
            console.error("Save Error:", err);
            toast.error(err.response?.data?.error || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Configuration...</p>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <p className="text-slate-500 font-bold">Failed to load shop settings.</p>
            <button onClick={() => fetchSettings()} className="px-6 py-2 bg-brand-purple text-white rounded-xl font-bold">Retry</button>
        </div>
    );

    const tabs = [
        { id: "shop", label: "Shop Branding", icon: Store },
        { id: "account", label: "Account Info", icon: User },
        { id: "address", label: "Location & Pickup", icon: MapPin },
        { id: "logistics", label: "Logistics Flow", icon: Truck },
    ];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control <span className="text-brand-purple">Center</span></h1>
                <p className="text-slate-500 font-medium mt-1">Fine-tune your shop visibility and operations.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-4 p-2 bg-slate-100 rounded-3xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm",
                            activeTab === tab.id 
                                ? "bg-white text-brand-purple shadow-xl shadow-brand-purple/5 border border-slate-100" 
                                : "text-slate-500 hover:text-brand-purple hover:bg-white/50"
                        )}
                    >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <AnimatePresence mode="wait">
                    {activeTab === "shop" && (
                        <motion.div 
                            key="shop"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10"
                        >
                            <div className="space-y-8">
                                {/* Banner Upload */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Banner (Recommended 1200x400)</label>
                                    <div 
                                        onClick={() => bannerInputRef.current.click()}
                                        className="relative h-48 w-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer group overflow-hidden"
                                    >
                                        {previews.banner ? (
                                            <img src={previews.banner} className="w-full h-full object-cover" alt="Banner Preview" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-brand-purple transition-colors">
                                                <Upload size={32} />
                                                <span className="font-bold text-sm">Upload Cover Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="px-4 py-2 bg-white rounded-xl text-brand-purple font-bold text-sm flex items-center gap-2">
                                                <Upload size={16} /> Change Banner
                                            </div>
                                        </div>
                                        <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-10">
                                    {/* Logo Upload */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Logo</label>
                                        <div 
                                            onClick={() => logoInputRef.current.click()}
                                            className="relative w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer group overflow-hidden"
                                        >
                                            {previews.logo ? (
                                                <img src={previews.logo} className="w-full h-full object-cover" alt="Logo Preview" />
                                            ) : (
                                                <Store size={40} className="text-slate-300" />
                                            )}
                                            <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload size={20} className="text-white" />
                                            </div>
                                            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                        </div>
                                    </div>

                                    {/* Name & Type */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Name</label>
                                            <input 
                                                name="shop_name"
                                                value={data.shop_name || ""}
                                                onChange={handleInputChange}
                                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Category</label>
                                            <select 
                                                name="shop_type"
                                                value={data.shop_type || ""}
                                                onChange={handleInputChange}
                                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Description</label>
                                    <textarea 
                                        name="shop_description"
                                        value={data.shop_description || ""}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none resize-none"
                                        placeholder="Tell customers about your shop story, quality, and legacy..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "account" && (
                        <motion.div 
                            key="account"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            name="email"
                                            value={data.email || ""}
                                            onChange={handleInputChange}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            name="pickup_contact"
                                            value={data.pickup_contact || ""}
                                            onChange={handleInputChange}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alternative Contact</label>
                                    <input 
                                        name="alternative_contact"
                                        value={data.alternative_contact || ""}
                                        onChange={handleInputChange}
                                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Password (Leave blank to keep same)</label>
                                    <div className="relative">
                                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            onChange={handleInputChange}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-14 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-purple"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                                <AlertCircle className="text-amber-600 shrink-0" />
                                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                    Changing your email will affect your login credentials. You will be required to log in again with the new email address.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "address" && (
                        <motion.div 
                            key="address"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Street Address</label>
                                        <textarea 
                                            name="shop_address"
                                            value={data.shop_address || ""}
                                            onChange={handleInputChange}
                                            onBlur={() => handleLocateAddress(true)}
                                            rows={3}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold text-slate-700 focus:bg-white focus:border-brand-purple transition-all outline-none resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                            <input name="city" value={data.city || ""} onChange={handleInputChange} onBlur={() => handleLocateAddress(true)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pincode</label>
                                            <input name="pincode" value={data.pincode || ""} onChange={handleInputChange} onBlur={() => handleLocateAddress(true)} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                        Map Location (GPS)
                                            <button 
                                                type="button" 
                                                onClick={() => handleLocateAddress(false)}
                                                disabled={geocodingLoading}
                                                className="text-brand-purple lowercase italic font-bold hover:underline flex items-center gap-1"
                                            >
                                                {geocodingLoading ? <Loader2 size={10} className="animate-spin" /> : <Globe size={10} />}
                                                {geocodingLoading ? "fetching..." : "re-sync from address"}
                                            </button>
                                    </label>
                                    <MapPicker 
                                        lat={parseFloat(data.location_lat) || 28.6139} 
                                        lng={parseFloat(data.location_lng) || 77.2090} 
                                        onChange={({ lat, lng }) => setData(prev => ({ ...prev, location_lat: lat, location_lng: lng }))}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "logistics" && (
                        <motion.div 
                            key="logistics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Pickup & radius */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div>
                                            <p className="text-lg font-black text-slate-900">Pickup Availability</p>
                                            <p className="text-xs font-bold text-slate-400">Riders can see your shop for orders</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setData(prev => ({ ...prev, pickup_availability: !prev.pickup_availability }))}
                                            className={clsx(
                                                "w-14 h-8 rounded-full relative transition-all duration-500",
                                                data.pickup_availability ? "bg-brand-purple" : "bg-slate-300"
                                            )}
                                        >
                                            <div className={clsx(
                                                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500",
                                                data.pickup_availability ? "right-1" : "left-1"
                                            )} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Radius (KM)</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" 
                                                min="1" 
                                                max="100" 
                                                name="delivery_radius"
                                                value={data.delivery_radius || 10}
                                                onChange={handleInputChange}
                                                className="flex-1 accent-brand-purple"
                                            />
                                            <span className="w-16 text-center font-black text-brand-purple text-lg">{data.delivery_radius} KM</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Dispatch Time</label>
                                        <select 
                                            name="estimated_dispatch_time"
                                            value={data.estimated_dispatch_time || ""}
                                            onChange={handleInputChange}
                                            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold outline-none"
                                        >
                                            <option value="Instant">Instant (Within 10 mins)</option>
                                            <option value="30 Minutes">30 Minutes</option>
                                            <option value="1 Hour">1 Hour</option>
                                            <option value="2 Hours">2 Hours</option>
                                            <option value="24 Hours">24 Hours</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Timing & Days */}
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Time</label>
                                            <input type="time" name="opening_time" value={data.opening_time || ""} onChange={handleInputChange} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Time</label>
                                            <input type="time" name="closing_time" value={data.closing_time || ""} onChange={handleInputChange} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Working Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {days.map(day => {
                                                const isActive = data.working_days?.includes(day);
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => handleWorkingDaysToggle(day)}
                                                        className={clsx(
                                                            "px-4 py-2 rounded-xl border text-xs font-black transition-all",
                                                            isActive 
                                                                ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20" 
                                                                : "bg-white text-slate-400 border-slate-200 hover:border-brand-purple/30"
                                                        )}
                                                    >
                                                        {day}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Action */}
                <div className="flex justify-end gap-4 sticky bottom-8 z-10">
                    <button 
                        type="button"
                        onClick={() => fetchSettings()}
                        className="px-8 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-500 shadow-xl hover:bg-slate-50 transition-all"
                    >
                        Reset Changes
                    </button>
                    <button 
                        disabled={saving}
                        className="px-10 py-4 bg-brand-purple text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl shadow-brand-purple/30 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} /> Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorSettings;
