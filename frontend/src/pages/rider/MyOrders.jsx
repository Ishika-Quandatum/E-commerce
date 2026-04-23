import React, { useState, useEffect } from "react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Package, 
  Truck,
  XCircle,
  Search,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, riderService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const MyOrders = () => {
    const [activeTab, setActiveTab] = useState("Assigned");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: "New", label: "New Tasks", icon: <Package size={18} /> },
        { id: "Assigned", label: "Assigned", icon: <CheckCircle2 size={18} /> },
        { id: "Picked Up", label: "In Transit", icon: <Truck size={18} /> },
        { id: "Delivered", label: "Completed", icon: <CheckCircle2 size={18} /> },
    ];

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === "New") {
                res = await riderService.getOpenQueue();
            } else {
                res = await adminService.getRiderTasks();
            }
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching tasks", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            if (activeTab === "New" && status === "Assigned") {
                await riderService.acceptShipment(id);
                setActiveTab("Assigned"); // Move to Assigned tab
            } else if (status === "Delivered") {
                await riderService.markDelivered(id);
                setActiveTab("Delivered"); // Move to Completed tab
            } else if (status === "Picked Up") {
                await riderService.updateStatus(id, "In Transit");
                setActiveTab("Picked Up"); // Move to In Transit tab
            } else {
                await riderService.updateStatus(id, status);
            }
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                    Delivery <span className="text-brand-blue">Tasks</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Manage your active and completed deliveries.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar max-w-2xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                            activeTab === tab.id 
                            ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-[1.02]" 
                            : "text-slate-500 hover:text-brand-blue hover:bg-slate-50"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search/Filter */}
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm max-w-xl">
                 <Search size={20} className="text-slate-300" />
                 <input 
                    type="text" 
                    placeholder="Search by ID or customer..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                 />
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1,2,3,4].map(i => (
                            <div key={i} className="bg-white h-64 rounded-[32px] animate-pulse border border-slate-100" />
                        ))
                    ) : orders.filter(o => {
                        if (activeTab === "New") return true; // open_queue returns only new tasks
                        if (activeTab === "Assigned") return o.status === "Assigned";
                        if (activeTab === "Picked Up") return o.status === "In Transit" || o.status === "Picked Up";
                        if (activeTab === "Delivered") return o.status === "Delivered";
                        return false;
                    }).length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <Package size={64} className="mb-4 opacity-10" />
                            <p className="font-bold text-lg text-slate-500">No orders in this category</p>
                            <p className="text-sm">New assignments will appear here automatically.</p>
                        </div>
                    ) : orders.filter(o => {
                        if (activeTab === "New") return true;
                        if (activeTab === "Assigned") return o.status === "Assigned";
                        if (activeTab === "Picked Up") return o.status === "In Transit" || o.status === "Picked Up";
                        if (activeTab === "Delivered") return o.status === "Delivered";
                        return false;
                    }).map((order, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            key={order.id}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col overflow-hidden group"
                        >
                            {/* Card Header */}
                            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</span>
                                        <span className="text-xs font-black text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-lg">#{order.tracking_number?.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-blue transition-colors">
                                        {order.customer_name}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-emerald-600">$12.50</div>
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 justify-end uppercase">
                                        <Clock size={10} /> 15 mins ago
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8 space-y-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin size={20} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Delivery Address</p>
                                        <p className="text-sm font-bold text-slate-600 line-clamp-2 leading-relaxed">
                                            {order.address || "123 Business Way, Commercial Zone, Tech City, 56001"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                        <Package size={18} className="text-slate-400" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">Payment</p>
                                            <p className="text-xs font-bold text-slate-700">COD</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">Distance</p>
                                            <p className="text-xs font-bold text-slate-700">3.2 km</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="px-8 pb-8 flex items-center gap-3">
                                <a 
                                    href={`tel:${order.phone || '555-0199'}`}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Phone size={18} /> Call
                                </a>
                                
                                {activeTab === "Assigned" && (
                                    <button 
                                        onClick={() => handleAction(order.id, 'Picked Up')}
                                        className="flex-[2] bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/20 active:scale-95"
                                    >
                                        <Truck size={18} /> Mark Picked Up
                                    </button>
                                )}

                                {activeTab === "Picked Up" && (
                                    <button 
                                        onClick={() => handleAction(order.id, 'Delivered')}
                                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                    >
                                        <CheckCircle2 size={18} /> Complete Delivery
                                    </button>
                                )}

                                {activeTab === "New" && (
                                    <div className="flex gap-2 flex-[2]">
                                         <button 
                                            className="flex-1 bg-rose-500 text-white p-4 rounded-2xl flex justify-center items-center shadow-lg shadow-rose-500/20"
                                            onClick={() => handleAction(order.id, 'Rejected')}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button 
                                            className="flex-[3] bg-brand-blue text-white p-4 rounded-2xl font-bold shadow-lg shadow-brand-blue/20"
                                            onClick={() => handleAction(order.id, 'Assigned')}
                                        >
                                            Accept Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyOrders;
