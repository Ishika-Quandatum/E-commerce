import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Navigation, 
  Search, 
  Filter, 
  UserPlus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import api, { adminService } from '../../../services/api';
import DispatchStats from '../../../components/vendor/Dispatch/DispatchStats';
import AssignRiderModal from '../../../components/vendor/Dispatch/AssignRiderModal';
import DispatchConfirmationModal from '../../../components/vendor/Dispatch/DispatchConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const VendorDispatchList = () => {
    const [shipments, setShipments] = useState([]);
    const [stats, setStats] = useState({});
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Dispatch Queue");
    
    // Modals state
    const [activeShipmentId, setActiveShipmentId] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);

    const tabs = [
        { id: "Dispatch Queue", label: "Queue", icon: <Clock size={16} />, color: "bg-amber-500" },
        { id: "Assigned", label: "Assigned", icon: <UserPlus size={16} />, color: "bg-indigo-500" },
        { id: "In Transit", label: "In Transit", icon: <Truck size={16} />, color: "bg-blue-500" },
        { id: "Delivered", label: "Delivered", icon: <CheckCircle2 size={16} />, color: "bg-emerald-500" },
        { id: "Rejected", label: "Rejected", icon: <XCircle size={16} />, color: "bg-rose-500" },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shipRes, statsRes, ridersRes] = await Promise.all([
                api.get('tracking/shipments/'),
                api.get('tracking/shipments/dashboard_stats/'),
                api.get('tracking/riders/available_riders/')
            ]);
            setShipments(shipRes.data);
            setStats(statsRes.data);
            setRiders(ridersRes.data);
        } catch (err) {
            console.error("Failed to fetch dispatch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAutoAssign = async (id) => {
        try {
            const res = await adminService.autoAssignRider(id);
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "No nearby riders available.");
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await adminService.updateShipmentStatus(id, status);
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const confirmRiderAssignment = async (riderId) => {
        try {
            await api.post(`tracking/shipments/${activeShipmentId}/assign_rider/`, { rider_id: riderId });
            setShowAssignModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to assign rider", err);
        }
    };

    const confirmDispatch = async (weight) => {
        try {
            await api.post(`tracking/shipments/${selectedShipment.id}/finalize_dispatch/`, { parcel_weight: weight });
            setShowDispatchModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to dispatch", err);
        }
    };

    const filteredShipments = shipments.filter(s => s.status === activeTab);

    return (
        <div className="p-4 lg:p-8 space-y-10 animate-in fade-in duration-700 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                          <Navigation size={24} />
                       </div>
                       <h1 className="text-4xl font-black text-slate-900 tracking-tight font-title">Dispatch <span className="text-brand-blue font-black uppercase">Center</span></h1>
                    </div>
                    <p className="text-slate-400 font-bold max-w-xl">
                        Logistics control tower. Manage rider assignments and real-time fulfillment logs.
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh Data
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {tabs.slice(0, 4).map((tab, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white", tab.color)}>
                                {tab.icon}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 leading-none mb-1">
                            {shipments.filter(s => s.status === tab.id).count || shipments.filter(s => s.status === tab.id).length}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{tab.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar max-w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all shrink-0 uppercase tracking-widest",
                            activeTab === tab.id 
                                ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20 scale-[1.02]" 
                                : "text-slate-400 hover:text-brand-blue hover:bg-slate-50"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* List View */}
                <div className="xl:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-[32px] animate-pulse border border-slate-50" />)}
                            </div>
                        ) : filteredShipments.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white rounded-[40px] border border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-slate-300"
                            >
                                <Package size={64} className="mb-4 opacity-10" />
                                <p className="font-black text-xl text-slate-400 font-title tracking-tight">No shipments in {activeTab}</p>
                                <p className="text-sm font-bold text-slate-300">New items will appear here when pushed from orders.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredShipments.map((shipment) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={shipment.id}
                                        className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all p-8 group flex flex-col md:flex-row gap-8"
                                    >
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-900 tracking-tighter italic">#{shipment.tracking_number.slice(-8).toUpperCase()}</span>
                                                    <div className="h-4 w-px bg-slate-100" />
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID: #{shipment.order_id}</span>
                                                </div>
                                                {shipment.rider && (
                                                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Rider: {shipment.rider?.user?.username}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                        <MapPin size={18} className="text-brand-blue" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                                                        <p className="text-sm font-bold text-slate-600 line-clamp-2 leading-relaxed">{shipment.address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                        <Package size={18} className="text-brand-orange" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Info</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate uppercase tracking-tighter">{shipment.customer_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">Parcel: {shipment.parcel_weight}kg</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 min-w-[200px]">
                                            {shipment.status === 'Dispatch Queue' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleAutoAssign(shipment.id)}
                                                        className="flex-1 w-full bg-slate-900 border border-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <RefreshCw size={14} className="animate-spin-slow" /> Auto Assign (Geo)
                                                    </button>
                                                    <button 
                                                        onClick={() => { setActiveShipmentId(shipment.id); setShowAssignModal(true); }}
                                                        className="flex-1 w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <UserPlus size={14} /> Manual Select
                                                    </button>
                                                </>
                                            )}

                                            {shipment.status === 'Assigned' && (
                                               <button 
                                                    onClick={() => { setSelectedShipment(shipment); setShowDispatchModal(true); }}
                                                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                                               >
                                                   Verify & Dispatch
                                               </button>
                                            )}

                                            {shipment.status === 'Rejected' && (
                                                <button 
                                                    onClick={() => { setActiveShipmentId(shipment.id); setShowAssignModal(true); }}
                                                    className="w-full bg-rose-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-all"
                                                >
                                                    Reassign Rider
                                                </button>
                                            )}

                                            <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tracking View / Sidebar */}
                <div className="space-y-8">
                     <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group min-h-[500px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black font-title">Live Map View</h3>
                                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                     Live Tracking
                                </div>
                            </div>
                            
                            {/* Map Placeholder */}
                            <div className="w-full h-[320px] bg-slate-800 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center text-center p-6 space-y-4">
                                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center border border-slate-600">
                                    <MapPin size={32} className="text-brand-blue animate-bounce" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                                    Leaflet Rendering Window
                                </p>
                                <span className="text-[10px] text-slate-500 font-medium">Tracking {riders.filter(r => r.availability_status === 'Online').length} Active Riders</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Available Riders</span>
                                    <span className="text-emerald-500 font-black text-sm uppercase tracking-tighter">
                                        {riders.filter(r => r.availability_status === 'Online').length} Nearby
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                    * Auto-assignment uses internal Haversine distance from center to rider's current lat/lng.
                                </p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Modals */}
            <AssignRiderModal 
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                riders={riders}
                onAssign={confirmRiderAssignment}
            />

            <DispatchConfirmationModal 
                isOpen={showDispatchModal}
                onClose={() => setShowDispatchModal(false)}
                shipment={selectedShipment}
                onConfirm={confirmDispatch}
            />
        </div>
    );
};

export default VendorDispatchList;
