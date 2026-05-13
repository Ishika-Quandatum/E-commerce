import React, { useState, useEffect } from "react";
import { 
    Store, MapPin, Phone, Mail, Clock, Calendar, 
    Box, Users, Star, ShoppingBag, Globe, Info,
    ExternalLink, ShieldCheck, ChevronRight, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { vendorService } from "../../../services/api";
import clsx from "clsx";

const VendorProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await vendorService.getProfile();
            setProfile(res.data);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Portal...</p>
        </div>
    );

    if (!profile) return <div>Failed to load profile.</div>;

    const stats = [
        { label: "Followers", value: profile.followers_count, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Products", value: profile.products_count, icon: Box, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Rating", value: profile.rating, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "Total Orders", value: profile.total_orders_count, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Hero Section / Branding */}
            <div className="relative">
                <div className="h-64 md:h-80 w-full rounded-[2.5rem] overflow-hidden bg-slate-200 shadow-xl border border-white">
                    {profile.shop_banner ? (
                        <img src={profile.shop_banner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-purple to-brand-navy flex items-center justify-center">
                            <Store size={80} className="text-white/10" />
                        </div>
                    )}
                </div>

                <div className="absolute -bottom-16 left-8 md:left-16 flex flex-col md:flex-row items-end gap-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-slate-100 overflow-hidden shrink-0">
                        {profile.shop_logo ? (
                            <img src={profile.shop_logo} alt="Logo" className="w-full h-full object-cover rounded-[2rem]" />
                        ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-[2rem]">
                                <Store size={48} className="text-slate-300" />
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-4 md:mb-6 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{profile.shop_name}</h1>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100">
                                <ShieldCheck size={12} /> Verified
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                            <Globe size={16} /> {profile.shop_type} • Since {new Date(profile.created_at).getFullYear()}
                        </p>
                    </div>

                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-24">
                {/* Left Sidebar: Stats & Contact */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm grid grid-cols-2 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Info Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Info size={20} className="text-brand-purple" /> Contact Info
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.pickup_contact || 'Not set'}</p>
                                </div>
                            </div>

                            {profile.alternative_contact && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alt Contact</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.alternative_contact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shop Timing */}
                    <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-navy/20 space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <Clock size={20} className="text-brand-purple-light" /> Shop Timing
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-sm font-bold">Operating Hours</span>
                                </div>
                                <span className="text-xs font-black text-brand-purple-light uppercase">
                                    {profile.opening_time?.slice(0, 5) || '09:00'} - {profile.closing_time?.slice(0, 5) || '21:00'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Working Days</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.working_days && profile.working_days.length > 0 ? profile.working_days.map((day) => (
                                        <span key={day} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold">{day}</span>
                                    )) : (
                                        <span className="text-xs font-bold text-white/60 italic">Mon, Tue, Wed, Thu, Fri, Sat</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Description */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">About {profile.shop_name}</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            {profile.shop_description || "Welcome to our store! We provide high-quality products and excellent service to our customers. Stay tuned for exciting offers and new arrivals."}
                        </p>
                    </div>

                    {/* Location Section */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pickup Location</h3>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${profile.location_lat},${profile.location_lng}`}
                                target="_blank"
                                className="text-brand-purple font-black text-xs uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                Open in Maps <ExternalLink size={14} />
                            </a>
                        </div>
                        
                        <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-purple shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">{profile.city}, {profile.state}</p>
                                <p className="text-sm font-medium text-slate-500 max-w-md">{profile.shop_address}</p>
                                <p className="text-xs font-black text-brand-purple mt-2 uppercase tracking-widest">Pincode: {profile.pincode}</p>
                            </div>
                        </div>

                        {/* Visual Map Placeholder or mini-map */}
                        <div className="h-64 bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-200">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+6d28d9(${profile.location_lng},${profile.location_lat})/${profile.location_lng},${profile.location_lat},14/800x400?access_token=YOUR_MAPBOX_TOKEN')] bg-cover bg-center" />
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                                <div className="p-4 bg-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-brand-purple text-white flex items-center justify-center shadow-lg shadow-brand-purple/20">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">Shop GPS Fixed</p>
                                        <p className="text-[10px] font-bold text-slate-400 italic">Accurate for Pickup Dispatch</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistics Section */}
                    <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                            <div className="flex items-center gap-2">
                                <div className={clsx("w-3 h-3 rounded-full", profile.pickup_availability ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500")} />
                                <p className="text-lg font-black text-slate-800">{profile.pickup_availability ? "Open for Pickup" : "Currently Offline"}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Radius</p>
                            <p className="text-lg font-black text-slate-800">{profile.delivery_radius} <span className="text-sm text-slate-400">KM</span></p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Time</p>
                            <p className="text-lg font-black text-slate-800">{profile.estimated_dispatch_time || "Within 24 Hours"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
