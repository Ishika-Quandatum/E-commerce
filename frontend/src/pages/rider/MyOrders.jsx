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
        const inTransitOrders = (orders || []).filter(o => 
            ['Picked Up', 'Start Delivery', 'In Transit', 'Reached'].includes(o.status)
        );
        
        if (inTransitOrders.length > 0) {
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
            } else {
                await riderService.updateStatus(id, status);
                if (status === 'Picked Up') setActiveTab("Picked Up");
                if (status === 'Start Delivery') setActiveTab("Picked Up");
            }
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    const filterOrders = () => {
        const searchLower = searchTerm.toLowerCase();
        const filtered = (orders || []).filter(o => {
            const matchesSearch = !searchTerm || 
                (o.customer_name && o.customer_name.toLowerCase().includes(searchLower)) || 
                (o.tracking_number && o.tracking_number.toLowerCase().includes(searchLower)) ||
                (o.id && String(o.id).includes(searchLower));
            return matchesSearch;
        });

        if (activeTab === "New") return filtered.filter(o => o.status === 'Dispatch Queue' || o.status === 'Pending');
        if (activeTab === "Assigned") return filtered.filter(o => o.status === 'Assigned' || o.status === 'Start Pickup');
        if (activeTab === "Picked Up") return filtered.filter(o => ['Picked Up', 'Start Delivery', 'In Transit', 'Reached'].includes(o.status));
        if (activeTab === "Delivered") return filtered.filter(o => o.status === 'Delivered');
        return [];
    };

    const filteredOrders = filterOrders();

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
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-brand-purple text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-brand-purple/20">
                                        ID
                                    </div>
                                    <span className="text-sm font-black text-slate-900 tracking-tight">#{order.tracking_number?.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Earning</div>
                                        <div className="text-lg font-black text-emerald-600 leading-none">₹{parseFloat(order.estimated_earning || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        order.status === 'Assigned' ? "bg-blue-50 text-blue-600" :
                                        order.status === 'Start Pickup' ? "bg-amber-50 text-amber-600" :
                                        order.status === 'Picked Up' ? "bg-purple-50 text-purple-600" :
                                        order.status === 'Start Delivery' ? "bg-orange-50 text-orange-600" :
                                        "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body: Dual Address Workflow */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                {/* Connector Line */}
                                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-slate-100">
                                    <ChevronRight size={16} className="text-slate-300 mx-auto -mt-2" />
                                </div>

                                {/* FROM: Vendor */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                                            <Package size={16} />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">FROM: VENDOR</h4>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-brand-blue/30 transition-colors">
                                        <h5 className="font-black text-slate-900 mb-1">{order.vendor_info?.shop_name || "Vendor Shop"}</h5>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3 leading-relaxed">
                                            {order.vendor_info?.address || "Shop Address not available"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={`tel:${order.vendor_info?.phone}`}
                                                className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
                                            >
                                                <Phone size={12} /> Call Shop
                                            </a>
                                            <a 
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.vendor_info?.lat},${order.vendor_info?.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all"
                                            >
                                                <ExternalLink size={12} /> Maps
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* TO: Customer */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <MapPin size={16} />
                                        </div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">TO: CUSTOMER</h4>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-emerald-500/30 transition-colors">
                                        <h5 className="font-black text-slate-900 mb-1">{order.customer_info?.name || "Customer"}</h5>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3 leading-relaxed">
                                            {order.customer_info?.address || "Address not available"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={`tel:${order.customer_info?.phone}`}
                                                className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
                                            >
                                                <Phone size={12} /> Call Customer
                                            </a>
                                            <a 
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer_info?.lat},${order.customer_info?.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all"
                                            >
                                                <ExternalLink size={12} /> Maps
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-6 bg-slate-50/30 border-t border-slate-50">
                                {activeTab === "New" && (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAction(order.id, 'Rejected')}
                                            className="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} /> Decline
                                        </button>
                                        <button 
                                            onClick={() => handleAction(order.id, 'Assigned')}
                                            className="flex-[2] bg-brand-purple text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <Package size={18} /> Accept Task
                                        </button>
                                    </div>
                                )}

                                {activeTab === "Assigned" && (
                                    <div className="flex gap-3">
                                        {order.status === 'Assigned' ? (
                                            <button 
                                                onClick={() => handleAction(order.id, 'Start Pickup')}
                                                className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <Truck size={18} /> Start Pickup
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(order.id, 'Picked Up')}
                                                className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <CheckCircle2 size={18} /> Mark Picked Up
                                            </button>
                                        )}
                                    </div>
                                )}

                                {activeTab === "Picked Up" && (
                                    <div className="flex gap-3">
                                        {order.status === 'Picked Up' ? (
                                            <button 
                                                onClick={() => handleAction(order.id, 'Start Delivery')}
                                                className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <Navigation size={18} /> Start Delivery
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAction(order.id, 'Delivered')}
                                                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <CheckCircle2 size={18} /> Complete Delivery
                                            </button>
                                        )}
                                    </div>
                                )}

                                {activeTab === "Delivered" && (
                                    <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-bold text-sm">
                                        <CheckCircle2 size={18} /> Successfully Delivered
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
