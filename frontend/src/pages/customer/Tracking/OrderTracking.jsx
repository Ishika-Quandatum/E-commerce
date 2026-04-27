import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackingService } from '../../../services/api';
import { 
  Package, MapPin, Navigation, Clock, Phone, MessageSquare, 
  ChevronRight, AlertTriangle, HelpCircle, ShieldCheck, 
  CheckCircle2, Truck, Timer, Info, MoreHorizontal
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

let RiderIcon = L.divIcon({
    html: `<div class="bg-brand-purple p-2 rounded-full border-2 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
});

let CustomerIcon = L.divIcon({
    html: `<div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Auto-fit Component
const MapAutoCenter = ({ riderPos, customerPos }) => {
    const map = useMap();
    useEffect(() => {
        if (riderPos && customerPos) {
            const bounds = L.latLngBounds([riderPos, customerPos]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (customerPos) {
            map.setView(customerPos, 15);
        }
    }, [riderPos, customerPos, map]);
    return null;
};

const OrderTracking = () => {
    const { id } = useParams(); // shipmentId
    const navigate = useNavigate();
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTracking = async () => {
        try {
            const res = await trackingService.getTrackingDetails(id);
            setTrackingData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Tracking Error:", err);
            setError(err.response?.data?.error || err.response?.data?.detail || "Unable to load tracking details.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Initializing Live Tracking...</p>
            </div>
        </div>
    );

    if (error || !trackingData) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md">
                <AlertTriangle size={64} className="text-amber-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tracking Not Available</h2>
                <p className="text-slate-500 mb-8">{error || "We couldn't find any live tracking data for this order."}</p>
                <button onClick={() => navigate('/profile')} className="bg-brand-purple text-white px-8 py-3 rounded-2xl font-bold">
                    Back to Profile
                </button>
            </div>
        </div>
    );

    const riderPos = trackingData.current_location ? [parseFloat(trackingData.current_location.latitude), parseFloat(trackingData.current_location.longitude)] : null;
    const customerPos = [parseFloat(trackingData.customer_location.lat), parseFloat(trackingData.customer_location.lng)];
    const routePoints = trackingData.location_history?.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]) || [];

    const stages = [
        { label: 'Order Received', statuses: ['Pending', 'Dispatch Queue'], icon: <Package size={18} /> },
        { label: 'Processing', statuses: ['Assigned'], icon: <ChevronRight size={18} /> },
        { label: 'Packed', statuses: ['Packed'], icon: <Package size={18} /> },
        { label: 'Shipped', statuses: ['Dispatched'], icon: <Truck size={18} /> },
        { label: 'Out for Delivery', statuses: ['In Transit', 'Picked Up', 'Reached'], icon: <Navigation size={18} /> },
        { label: 'Delivered', statuses: ['Delivered'], icon: <CheckCircle2 size={18} /> }
    ];

    const currentStatus = trackingData.shipment_status;
    const currentStatusIndex = stages.findIndex(s => s.statuses.includes(currentStatus));
    const displayStatusIndex = currentStatusIndex === -1 ? (currentStatus === 'Delivered' ? stages.length - 1 : 0) : currentStatusIndex;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Section */}
            <div className="bg-brand-navy text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-brand-purple-light/60 text-sm font-bold uppercase tracking-[0.2em] mb-2">
                                <ShieldCheck size={16} />
                                <span>Secured Tracking</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Order #{trackingData.tracking_number}</h1>
                            <p className="text-brand-purple-light/40 mt-1 font-medium">Tracking is active for your package delivery</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-brand-purple-light/40 text-[10px] font-black uppercase tracking-widest mb-1">Expected By</p>
                                    <p className="text-lg font-black">
                                        {trackingData.eta && !isNaN(new Date(trackingData.eta).getTime()) 
                                            ? new Date(trackingData.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                            : 'Today'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-brand-purple-light/40 text-[10px] font-black uppercase tracking-widest mb-1">Payment</p>
                                    <p className="text-lg font-black uppercase tracking-tighter">{trackingData.payment_method}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Timeline and Map */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 2. Delivery Timeline */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-10 flex items-center gap-2">
                                <Clock className="text-brand-purple" />
                                Delivery Timeline
                            </h3>
                            
                            <div className="relative mt-8 mb-4">
                                {/* Track Line Background (Dashed) */}
                                <div className="absolute top-6 left-12 right-12 h-[2px] border-t-2 border-dashed border-slate-300 -translate-y-1/2 z-0"></div>
                                
                                {/* Track Line Filled (Solid Purple) */}
                                <div className="absolute top-6 left-12 right-12 h-[2px] -translate-y-1/2 z-0">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(displayStatusIndex / (stages.length - 1)) * 100}%` }}
                                        className="h-full bg-brand-purple shadow-[0_0_10px_rgba(109,40,217,0.5)]"
                                    />
                                </div>

                                {/* Timeline Points */}
                                <div className="relative flex justify-between z-10">
                                    {stages.map((stage, idx) => {
                                        const isPast = idx < displayStatusIndex;
                                        const isCurrent = idx === displayStatusIndex;
                                        const isFuture = idx > displayStatusIndex;
                                        
                                        return (
                                            <div key={idx} className="flex flex-col items-center w-24 relative">
                                                <div className="relative flex items-center justify-center w-12 h-12">
                                                    {isCurrent && (
                                                        <div className="absolute inset-[-12px] rounded-full bg-brand-purple/10 scale-100"></div>
                                                    )}
                                                    {isCurrent && (
                                                        <div className="absolute inset-0 rounded-full bg-brand-purple/20 animate-ping"></div>
                                                    )}
                                                    <motion.div 
                                                        whileHover={{ scale: 1.1 }}
                                                        className={clsx(
                                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 bg-white",
                                                            isPast && "bg-brand-purple text-white shadow-lg shadow-brand-purple/30 border border-brand-purple",
                                                            isCurrent && "border-[3px] border-brand-purple text-brand-purple shadow-lg shadow-brand-purple/20",
                                                            isFuture && "border-2 border-slate-200 text-slate-400"
                                                        )}
                                                    >
                                                        {isPast ? <CheckCircle2 size={24} strokeWidth={2.5} /> : React.cloneElement(stage.icon, { size: 20 })}
                                                    </motion.div>
                                                </div>
                                                <div className="text-center mt-5 flex flex-col items-center">
                                                    <p className={clsx(
                                                        "text-[10px] sm:text-xs font-black uppercase tracking-tight transition-colors leading-tight mb-1",
                                                        isPast || isCurrent ? "text-brand-purple" : "text-slate-500"
                                                    )}>
                                                        {stage.label}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400">
                                                        {isPast || isCurrent 
                                                            ? `${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}, ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}` 
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. Live Map Section */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 h-[500px] relative z-0 group">
                            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live GPS Enabled</span>
                                </div>
                            </div>

                            <MapContainer center={customerPos} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <MapAutoCenter riderPos={riderPos} customerPos={customerPos} />
                                
                                {customerPos && (
                                    <Marker position={customerPos} icon={CustomerIcon}>
                                        <Popup>
                                            <div className="font-bold">Your Delivery Location</div>
                                            <div className="text-xs text-slate-500">{trackingData.customer_location.address}</div>
                                        </Popup>
                                    </Marker>
                                )}

                                {riderPos && (
                                    <>
                                        <Marker position={riderPos} icon={RiderIcon}>
                                            <Popup>
                                                <div className="font-bold">Rider: {trackingData.rider_info.name}</div>
                                                <div className="text-xs text-brand-purple font-bold">In Transit</div>
                                            </Popup>
                                        </Marker>
                                        {routePoints.length > 0 && (
                                            <Polyline 
                                                positions={[riderPos, ...routePoints, customerPos]} 
                                                pathOptions={{ color: '#6D28D9', weight: 4, dashArray: '8, 12', lineCap: 'round' }} 
                                            />
                                        )}
                                    </>
                                )}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Right Column: Cards */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* 4. Rider Info Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900">Rider Partner</h3>
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse"></span>
                                    On the way
                                </div>
                            </div>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                                    <Truck size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">{trackingData.rider_info.name}</h4>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                                        {trackingData.rider_info.vehicle || 'Rider Partner'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a 
                                    href={`tel:${trackingData.rider_info.phone}`}
                                    className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-brand-purple hover:text-white text-slate-900 h-14 rounded-2xl font-bold transition-all border border-slate-100"
                                >
                                    <Phone size={18} />
                                    <span>Call</span>
                                </a>
                                <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-brand-purple hover:text-white text-slate-900 h-14 rounded-2xl font-bold transition-all border border-slate-100">
                                    <MessageSquare size={18} />
                                    <span>Chat</span>
                                </button>
                            </div>
                        </div>

                        {/* 5. Delivery Stats */}
                        <div className="bg-brand-purple rounded-[2.5rem] p-8 shadow-2xl shadow-brand-purple/30 text-white">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black">Delivery Stats</h3>
                                <Info size={18} className="text-white/40" />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Navigation size={18} />
                                        </div>
                                        <span className="font-bold text-brand-purple-light/60">Distance</span>
                                    </div>
                                    <span className="text-xl font-black tracking-tight">2.4 km</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Timer size={18} />
                                        </div>
                                        <span className="font-bold text-brand-purple-light/60">Arrival</span>
                                    </div>
                                    <span className="text-xl font-black tracking-tight">12 Mins</span>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-purple-light/40">
                                        <span>Last GPS Update</span>
                                        <span>{trackingData.current_location ? new Date(trackingData.current_location.timestamp).toLocaleTimeString() : 'Now'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Order Summary */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                                Order Items
                                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-lg">{trackingData.order_items?.length} Items</span>
                            </h3>
                            
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {trackingData.order_items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img 
                                                src={item.image ? `http://127.0.0.1:8000${item.image}` : 'https://placehold.co/100'} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                alt={item.name} 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                                            <p className="text-xs font-bold text-slate-400">Qty: {item.qty} × ${item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 7. Help Section */}
                        <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                            <div className="flex items-center gap-3 mb-6">
                                <HelpCircle className="text-amber-600" />
                                <h3 className="text-lg font-black text-amber-900">Need Help?</h3>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full bg-white hover:bg-amber-100 text-amber-800 h-12 rounded-2xl font-bold text-sm transition-all border border-amber-200">
                                    Report Delivery Issue
                                </button>
                                <button className="w-full bg-amber-600 text-white h-12 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-amber-600/20">
                                    Contact Support
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
