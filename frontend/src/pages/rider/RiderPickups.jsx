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

    const tabs = [
        { id: "Assigned", label: "To Pickup", icon: <Package size={18} /> },
        { id: "Picked Up", label: "Collected", icon: <Truck size={18} /> },
        { id: "Delivered to Vendor", label: "Completed", icon: <CheckCircle2 size={18} /> },
    ];

    useEffect(() => {
        fetchPickups();
    }, [activeTab]);

    const fetchPickups = async () => {
        setLoading(true);
        try {
            const res = await returnService.getReturnRequests({ status: activeTab });
            setPickups(res.data);
        } catch (err) {
            console.error("Error fetching pickups", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await returnService.updateReturnStatus(id, { status });
            fetchPickups();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
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
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-brand-blue shrink-0 mt-1" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Pickup Location</p>
                                        <p className="text-sm font-bold text-slate-600 line-clamp-1">Customer Address for Order #{pickup.order}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package size={18} className="text-slate-400 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Items</p>
                                        <p className="text-sm font-bold text-slate-600">{pickup.items.length} items to collect</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex gap-3">
                                <a href={`tel:${pickup.phone || ''}`} className="p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">
                                    <Phone size={20} />
                                </a>
                                {activeTab === "Assigned" && (
                                    <button 
                                        onClick={() => handleAction(pickup.id, 'Picked Up')}
                                        className="flex-1 md:flex-none bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold"
                                    >
                                        Mark Picked Up
                                    </button>
                                )}
                                {activeTab === "Picked Up" && (
                                    <button 
                                        onClick={() => handleAction(pickup.id, 'Delivered to Vendor')}
                                        className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold"
                                    >
                                        Deliver to Vendor
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
