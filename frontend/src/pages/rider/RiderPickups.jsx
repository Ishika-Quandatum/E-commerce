import React, { useState, useEffect } from "react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck,
  RotateCcw,
  Search,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { returnService } from "../../services/api";
import clsx from "clsx";

const RiderPickups = () => {
    const [activeTab, setActiveTab] = useState("Assigned");
    const [searchTerm, setSearchTerm] = useState("");
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Track which item is being updated

    const tabs = [
        { id: "Pickup Assigned", label: "To Pickup", icon: <Package size={18} />, statuses: ["Approved by Vendor", "Pickup Assigned"] },
        { id: "Picked Up from Customer", label: "Collected", icon: <Truck size={18} />, statuses: ["Picked Up from Customer"] },
        { id: "Delivered to Vendor", label: "Completed", icon: <CheckCircle2 size={18} />, statuses: ["Delivered to Vendor", "Vendor Confirmed Received", "Inspection Started", "Refund Approved", "Refund Processed"] },
    ];

    useEffect(() => {
        fetchPickups();
    }, [activeTab]);

    const fetchPickups = async () => {
        setLoading(true);
        try {
            // Find statuses for current tab
            const currentTab = tabs.find(t => t.id === activeTab);
            const statuses = currentTab?.statuses || [activeTab];
            
            // We'll fetch all and filter client-side for simplicity if backend filter is limited, 
            // or just use the first status if that's all backend supports.
            // But let's assume we can fetch all and filter.
            const res = await returnService.getReturnRequests();
            const allReturns = res.data;
            setPickups(allReturns.filter(p => statuses.includes(p.status)));
        } catch (err) {
            console.error("Error fetching pickups", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setActionLoading(id);
        try {
            await returnService.updateReturnStatus(id, { status });
            fetchPickups();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredPickups = (pickups || []).filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return !searchTerm || 
            (p.customer_name && p.customer_name.toLowerCase().includes(searchLower)) || 
            (p.id && String(p.id).includes(searchLower));
    });

    return (
        <div className="space-y-8 pb-20 p-6 md:p-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Return <span className="text-brand-purple">Pickups</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Manage return collection tasks from customers.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar max-w-2xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                            activeTab === tab.id 
                            ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" 
                            : "text-slate-500 hover:text-brand-purple hover:bg-slate-50"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1,2].map(i => <div key={i} className="bg-white h-48 rounded-[32px] animate-pulse border border-slate-100" />)
                    ) : filteredPickups.length === 0 ? (
                        <div className="py-20 bg-white rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center">
                            <RotateCcw size={64} className="mb-4 opacity-10" />
                            <p className="font-bold text-lg text-slate-500">No pickups found</p>
                            <p className="text-sm font-medium mt-1">Check back later for new tasks.</p>
                        </div>
                    ) : filteredPickups.map((pickup) => (
                        <motion.div
                            layout
                            key={pickup.id}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 group"
                        >
                            <div className="w-full md:w-64">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Return ID</span>
                                    <span className="text-xs font-black text-brand-purple">#RET-{pickup.id.toString().padStart(5, '0')}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">{pickup.customer_name}</h3>
                                <p className="text-sm font-bold text-slate-500 mt-1">Refund: ₹{pickup.refund_amount}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-tight">Order #{pickup.order}</span>
                                    <span className={clsx(
                                        "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tight",
                                        pickup.status === 'Pickup Assigned' ? "bg-emerald-100 text-emerald-600" : "bg-brand-blue/10 text-brand-blue"
                                    )}>
                                        {pickup.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-brand-blue shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Customer Pickup</p>
                                            <p className="text-sm font-bold text-slate-600 line-clamp-2">{pickup.pickup_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone size={18} className="text-emerald-500 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Customer Contact</p>
                                            <p className="text-sm font-bold text-slate-600">{pickup.customer_phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Truck size={18} className="text-brand-purple shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Delivery to Vendor</p>
                                            <p className="text-sm font-bold text-slate-900">{pickup.vendor_name}</p>
                                            <p className="text-xs font-bold text-slate-500 line-clamp-1">{pickup.vendor_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Package size={18} className="text-slate-400 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Items to Collect</p>
                                            <div className="flex flex-col gap-1">
                                                {pickup.items.map((item, idx) => (
                                                    <p key={idx} className="text-sm font-bold text-slate-600">
                                                        • {item.quantity}x {item.product_name}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex md:flex-col gap-3">
                                <a href={`tel:${pickup.customer_phone || ''}`} className="flex-1 md:flex-none p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                    <Phone size={20} />
                                    <span className="md:hidden">Call Customer</span>
                                </a>
                                {activeTab === "Pickup Assigned" && pickup.status === "Approved by Vendor" && (
                                    <button 
                                        onClick={() => handleAction(pickup.id, 'Pickup Assigned')}
                                        disabled={actionLoading === pickup.id}
                                        className="flex-[2] md:flex-none bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === pickup.id ? "Processing..." : "Claim Pickup"}
                                    </button>
                                )}
                                {activeTab === "Pickup Assigned" && pickup.status === "Pickup Assigned" && (
                                    <button 
                                        onClick={() => handleAction(pickup.id, 'Picked Up from Customer')}
                                        disabled={actionLoading === pickup.id}
                                        className="flex-[2] md:flex-none bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === pickup.id ? "Processing..." : "Mark Collected"}
                                    </button>
                                )}
                                {activeTab === "Picked Up from Customer" && (
                                    <button 
                                        onClick={() => handleAction(pickup.id, 'Delivered to Vendor')}
                                        disabled={actionLoading === pickup.id}
                                        className="flex-[2] md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === pickup.id ? "Processing..." : "Mark Completed"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RiderPickups;
