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
  ExternalLink,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, riderService, trackingService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

const MyOrders = () => {
    const [activeTab, setActiveTab] = useState("Assigned");
    const [viewMode, setViewMode] = useState("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: "New", label: "New Tasks", icon: <Package size={18} /> },
        { id: "Assigned", label: "Assigned", icon: <CheckCircle2 size={18} /> },
        { id: "Picked Up", label: "In Transit", icon: <Truck size={18} /> },
        { id: "Delivered", label: "Completed", icon: <CheckCircle2 size={18} /> },
    ];

    // Real-Time GPS Tracking Logic
    useEffect(() => {
        let interval;
        const inTransitOrders = orders.filter(o => o.status === 'In Transit' || o.status === 'Picked Up');
        
        if (inTransitOrders.length > 0) {
            console.log("GPS: Tracking active for", inTransitOrders.length, "tasks");
            interval = setInterval(() => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            for (const order of inTransitOrders) {
                                try {
                                    await trackingService.updateRiderLocation(order.id, { latitude, longitude });
                                } catch (err) {
                                    console.error("GPS Sync Error for Order", order.id, err);
                                }
                            }
                        },
                        (error) => console.error("Geolocation Error", error),
                        { enableHighAccuracy: true }
                    );
                }
            }, 10000); // 10 seconds
        }

        return () => clearInterval(interval);
    }, [orders]);

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
                setActiveTab("Assigned");
            } else if (status === "Delivered") {
                await riderService.markDelivered(id);
                alert("Delivery completed successfully! Wallet and COD logs updated.");
                setActiveTab("Delivered");
            } else if (status === "Picked Up") {
                await riderService.updateStatus(id, "In Transit");
                setActiveTab("Picked Up");
            } else {
                await riderService.updateStatus(id, status);
            }
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    const filteredOrders = (orders || []).filter(o => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            (o.customer_name && o.customer_name.toLowerCase().includes(searchLower)) || 
            (o.tracking_number && o.tracking_number.toLowerCase().includes(searchLower)) ||
            (o.id && String(o.id).includes(searchLower));
        
        if (!matchesSearch) return false;

        if (activeTab === "New") return true;
        if (activeTab === "Assigned") return o.status === "Assigned";
        if (activeTab === "Picked Up") return o.status === "In Transit" || o.status === "Picked Up";
        if (activeTab === "Delivered") return o.status === "Delivered";
        return false;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                    Delivery <span className="text-brand-purple">Tasks</span>
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
                            ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-[1.02]" 
                            : "text-slate-500 hover:text-brand-purple hover:bg-slate-50"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search/Filter & View Toggle */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between max-w-5xl">
                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm w-full md:max-w-xl">
                     <Search size={20} className="text-slate-300" />
                     <input 
                        type="text" 
                        placeholder="Search by ID or customer..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm self-end md:self-auto">
                    <button 
                        onClick={() => setViewMode("grid")}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode("list")}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6" 
                : "flex flex-col gap-4"
            }>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1,2,3,4].map(i => (
                            <div key={i} className="bg-white h-64 rounded-[32px] animate-pulse border border-slate-100" />
                        ))
                    ) : filteredOrders.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <Package size={64} className="mb-4 opacity-10" />
                            <p className="font-bold text-lg text-slate-500">No orders found</p>
                            <p className="text-sm">Try adjusting your search or check another tab.</p>
                        </div>
                    ) : filteredOrders.map((order, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            key={order.id}
                            className={clsx(
                                "bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex overflow-hidden group",
                                viewMode === 'grid' ? "flex-col" : "flex-col md:flex-row items-center"
                            )}
                        >
                            {/* Card Header / Left side in list */}
                            <div className={clsx(
                                "p-8 border-slate-50 flex justify-between",
                                viewMode === 'grid' ? "border-b items-start" : "border-b md:border-b-0 md:border-r w-full md:w-72 flex-col gap-2 shrink-0"
                            )}>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</span>
                                        <span className="text-xs font-black text-brand-purple bg-brand-purple/5 px-2 py-1 rounded-lg">#{order.tracking_number?.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-purple transition-colors truncate">
                                        {order.customer_name}
                                    </h3>
                                </div>
                                <div className={viewMode === 'grid' ? "text-right" : "text-left"}>
                                    <div className="text-lg font-black text-emerald-600">₹{parseFloat(order.estimated_earning || 0).toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                        <Clock size={10} /> {(() => {
                                            const diff = Math.floor((new Date() - new Date(order.created_at)) / 1000);
                                            if (diff < 60) return "Just now";
                                            if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
                                            if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                                            return `${Math.floor(diff / 86400)} days ago`;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body / Middle in list */}
                            <div className={clsx(
                                "p-8 space-y-6 flex-1",
                                viewMode === 'list' && "flex items-center justify-between gap-8 space-y-0"
                            )}>
                                <div className={clsx("flex items-start gap-4", viewMode === 'list' ? "max-w-xs" : "")}>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin size={20} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Delivery Address</p>
                                        <p className="text-sm font-bold text-slate-600 line-clamp-1 leading-relaxed">
                                            {order.address || "123 Business Way, Commercial Zone, Tech City, 56001"}
                                        </p>
                                    </div>
                                </div>

                                <div className={clsx(
                                    "grid gap-4",
                                    viewMode === 'grid' ? "grid-cols-2" : "flex items-center gap-8"
                                )}>
                                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                        <Package size={18} className="text-slate-400" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">Payment</p>
                                            <p className="text-xs font-bold text-slate-700">
                                                {(() => {
                                                    if (!order.payment_method) return 'Cash on Delivery';
                                                    const m = order.payment_method.toLowerCase();
                                                    if (m === 'cod' || m.includes('cash')) return 'Cash on Delivery';
                                                    if (m === 'upi' || m.includes('card') || m.includes('online')) return 'UPI / Card';
                                                    return order.payment_method;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">Distance</p>
                                            <p className="text-xs font-bold text-slate-700">{order.distance || 0} km</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions / Right in list */}
                            <div className={clsx(
                                "px-8 pb-8 flex items-center gap-3",
                                viewMode === 'grid' ? "" : "pb-8 md:pb-0 md:pr-8 w-full md:w-auto"
                            )}>
                                <a 
                                    href={`tel:${order.phone || '555-0199'}`}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Phone size={18} /> Call
                                </a>
                                
                                {activeTab === "Assigned" && (
                                    <button 
                                        onClick={() => handleAction(order.id, 'Picked Up')}
                                        className="flex-[2] bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/20 active:scale-95 min-w-[140px]"
                                    >
                                        <Truck size={18} /> Mark Picked Up
                                    </button>
                                )}

                                {activeTab === "Picked Up" && (
                                    <button 
                                        onClick={() => handleAction(order.id, 'Delivered')}
                                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 min-w-[160px]"
                                    >
                                        <CheckCircle2 size={18} /> Complete Delivery
                                    </button>
                                )}

                                {activeTab === "New" && (
                                    <div className="flex gap-2 flex-[2] min-w-[180px]">
                                         <button 
                                            className="flex-1 bg-rose-500 text-white p-4 rounded-2xl flex justify-center items-center shadow-lg shadow-rose-500/20"
                                            onClick={() => handleAction(order.id, 'Rejected')}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button 
                                            className="flex-[3] bg-brand-purple text-white p-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20"
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
