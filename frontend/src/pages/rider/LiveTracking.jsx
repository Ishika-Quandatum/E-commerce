import React, { useState, useEffect, useRef } from "react";
import { 
    Phone, MapPin, Clock, Navigation, CheckCircle2, 
    Package, Truck, Map as MapIcon, Timer, Zap,
    ExternalLink, Store, User, AlertCircle, TrendingUp,
    CheckCircle, List, ArrowRight, Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { riderService, trackingService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

import useGoogleDistance from "../../hooks/useGoogleDistance";

const LiveTracking = () => {
    const { user } = useAuth();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const directionsRenderer = useRef(null);

    // Dynamic origin and destination for distance calculation
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);

    // Google Maps Loader
    useEffect(() => {
        if (window.google) {
            setGoogleLoaded(true);
            return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&libraries=geometry,directions`;
        script.async = true;
        script.defer = true;
        script.onload = () => setGoogleLoaded(true);
        document.head.appendChild(script);
    }, []);

    const fetchData = async () => {
        try {
            const [taskRes, statsRes] = await Promise.all([
                riderService.getActiveTask(),
                riderService.getStats()
            ]);
            const data = taskRes.data;
            setShipment(data);
            setStats(statsRes.data);

            if (data) {
                const riderPos = data.current_location ? {
                    lat: parseFloat(data.current_location.latitude),
                    lng: parseFloat(data.current_location.longitude)
                } : null;

                const vendorPos = {
                    lat: parseFloat(data.vendor_info.lat),
                    lng: parseFloat(data.vendor_info.lng)
                };

                const customerPos = {
                    lat: parseFloat(data.customer_info.lat),
                    lng: parseFloat(data.customer_info.lng)
                };

                // Logic: 
                // If status is 'Start Pickup' -> Origin = Rider (or self), Destination = Vendor
                // If status is 'Picked Up' or 'Start Delivery' -> Origin = Rider, Destination = Customer
                if (data.shipment_status === 'Start Pickup') {
                    setDestination(vendorPos);
                } else {
                    setDestination(customerPos);
                }

                if (riderPos) {
                    setOrigin(riderPos);
                } else {
                    // Fallback to getting current browser position for origin if riderPos not yet in DB
                    navigator.geolocation.getCurrentPosition(pos => {
                        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    });
                }
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setShipment(null);
            }
            console.error("Tracking Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const googleMetrics = useGoogleDistance(origin, destination, googleLoaded);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // GPS Sync during active transit
    useEffect(() => {
        if (!shipment) return;
        const inTransit = ['Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached'].includes(shipment.shipment_status);
        if (!inTransit) return;

        const syncInterval = setInterval(() => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        try {
                            await trackingService.updateRiderLocation(shipment.id, {
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude
                            });
                        } catch (err) {
                            console.error("GPS Sync Error:", err);
                        }
                    },
                    (err) => console.error("Geolocation Error:", err),
                    { enableHighAccuracy: true }
                );
            }
        }, 5000); // Every 5s for real-time tracking

        return () => clearInterval(syncInterval);
    }, [shipment?.id, shipment?.shipment_status]);

    // Map logic
    useEffect(() => {
        if (googleLoaded && shipment && mapRef.current) {
            const riderPos = shipment.current_location ? {
                lat: parseFloat(shipment.current_location.latitude),
                lng: parseFloat(shipment.current_location.longitude)
            } : null;

            const vendorPos = {
                lat: parseFloat(shipment.vendor_info.lat),
                lng: parseFloat(shipment.vendor_info.lng)
            };

            const customerPos = {
                lat: parseFloat(shipment.customer_info.lat),
                lng: parseFloat(shipment.customer_info.lng)
            };

            if (!mapInstance.current) {
                mapInstance.current = new window.google.maps.Map(mapRef.current, {
                    center: vendorPos,
                    zoom: 14,
                    styles: MapStyles,
                    disableDefaultUI: true,
                    zoomControl: true
                });
                directionsRenderer.current = new window.google.maps.DirectionsRenderer({
                    map: mapInstance.current,
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: "#6d28d9",
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                    }
                });
            }

            // Route Calculation
            const directionsService = new window.google.maps.DirectionsService();
            const origin = riderPos || vendorPos;
            const destination = shipment.shipment_status === 'Start Pickup' ? vendorPos : customerPos;

            directionsService.route({
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === "OK") {
                    directionsRenderer.current.setDirections(result);
                }
            });

            // Custom Markers (Resetting)
            // In a real app, we'd clear previous markers. For simplicity here:
            new window.google.maps.Marker({ position: vendorPos, map: mapInstance.current, title: "Vendor", icon: VendorMarker });
            new window.google.maps.Marker({ position: customerPos, map: mapInstance.current, title: "Customer", icon: CustomerMarker });
            if (riderPos) {
                new window.google.maps.Marker({ position: riderPos, map: mapInstance.current, title: "You", icon: RiderMarker });
            }
        }
    }, [googleLoaded, shipment]);

    const handleAction = async (status) => {
        if (!shipment) return;
        try {
            await riderService.updateStatus(shipment.id, status);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Connecting to Satellites...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Live <span className="text-brand-purple">Tracking</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time logistics control center.</p>
                </div>
                {stats && (
                    <>
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                                <p className="text-xl font-black text-slate-900">{stats.completed_deliveries}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Navigation size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                                <p className="text-xl font-black text-slate-900">{stats.total_distance_km} <span className="text-xs">KM</span></p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!shipment ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-12 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <MapIcon size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Deliveries</h2>
                    <p className="text-slate-500 max-w-sm mb-8">Go to "My Orders" to accept a new task and start your delivery journey.</p>
                    <button 
                        onClick={() => window.location.href='/rider/orders'}
                        className="bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-brand-purple/20 transition-all"
                    >
                        <List size={20} /> View New Tasks
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Map and Actions */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 h-[500px] relative">
                            <div className="absolute top-6 left-6 z-10">
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-purple animate-ping"></div>
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tracking Active: {shipment.tracking_number}</span>
                                </div>
                            </div>
                            <div ref={mapRef} className="w-full h-full bg-slate-100" />
                        </div>

                        {/* Status Timeline */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                            <div className="flex justify-between items-center min-w-[600px] relative">
                                <div className="absolute top-6 left-8 right-8 h-1 bg-slate-50 z-0"></div>
                                {TimelineStages.map((stage, idx) => {
                                    const isCompleted = isStageCompleted(shipment.shipment_status, stage.id);
                                    const isCurrent = shipment.shipment_status === stage.id;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                                                isCompleted ? "bg-brand-purple text-white shadow-lg" : 
                                                isCurrent ? "bg-white border-4 border-brand-purple text-brand-purple scale-110 shadow-xl" :
                                                "bg-white border-2 border-slate-100 text-slate-300"
                                            )}>
                                                {isCompleted ? <CheckCircle2 size={24} /> : stage.icon}
                                            </div>
                                            <span className={clsx(
                                                "text-[10px] font-black uppercase tracking-tighter",
                                                isCompleted || isCurrent ? "text-brand-purple" : "text-slate-400"
                                            )}>{stage.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Action Card */}
                        <div className="bg-brand-navy rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-navy/30">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Status</p>
                                    <h3 className="text-2xl font-black text-brand-purple-light uppercase italic">{shipment.shipment_status}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Truck size={24} className="text-white/60" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {getActionButtons(shipment.shipment_status, handleAction)}
                            </div>
                        </div>

                        {/* From/To Details */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup From</p>
                                    <h4 className="text-lg font-black text-slate-900">{shipment.vendor_info.shop_name}</h4>
                                    <p className="text-sm font-medium text-slate-500 leading-tight">{shipment.vendor_info.address}</p>
                                    <div className="flex gap-2 mt-3">
                                        <a href={`tel:${shipment.vendor_info.phone}`} className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                            <Phone size={18} />
                                        </a>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${shipment.vendor_info.lat},${shipment.vendor_info.lng}`} target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold">
                                            <Navigation size={14} /> Nav
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deliver To</p>
                                    <h4 className="text-lg font-black text-slate-900">{shipment.customer_info.name}</h4>
                                    <p className="text-sm font-medium text-slate-500 leading-tight">{shipment.customer_info.address}</p>
                                    <div className="flex gap-2 mt-3">
                                        <a href={`tel:${shipment.customer_info.phone}`} className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                                            <Phone size={18} />
                                        </a>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${shipment.customer_info.lat},${shipment.customer_info.lng}`} target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs font-bold">
                                            <Navigation size={14} /> Nav
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex justify-between items-center">
                                Items 
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-black text-slate-400">{shipment.order_items.length}</span>
                            </h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {shipment.order_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-brand-purple">{item.qty}x</span>
                                            <span className="font-bold text-slate-700">{item.name}</span>
                                        </div>
                                        <span className="text-slate-400 font-bold">₹{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helpers
const TimelineStages = [
    { id: 'Assigned', label: 'Assigned', icon: <Package size={18} /> },
    { id: 'Start Pickup', label: 'Heading to Shop', icon: <MapIcon size={18} /> },
    { id: 'Picked Up', label: 'Picked Up', icon: <Smartphone size={18} /> },
    { id: 'Start Delivery', label: 'Out for Delivery', icon: <Navigation size={18} /> },
    { id: 'Delivered', label: 'Delivered', icon: <CheckCircle size={18} /> }
];

const isStageCompleted = (current, stage) => {
    const order = ['Assigned', 'Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached', 'Delivered'];
    return order.indexOf(current) > order.indexOf(stage);
};

const getActionButtons = (status, onAction) => {
    switch(status) {
        case 'Assigned':
            return (
                <button onClick={() => onAction('Start Pickup')} className="w-full bg-brand-purple text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <MapIcon size={24} /> Start Pickup
                </button>
            );
        case 'Start Pickup':
            return (
                <button onClick={() => onAction('Picked Up')} className="w-full bg-emerald-500 text-slate-900 h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <Package size={24} /> Mark Picked Up
                </button>
            );
        case 'Picked Up':
            return (
                <button onClick={() => onAction('Start Delivery')} className="w-full bg-brand-purple text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <Navigation size={24} /> Start Delivery
                </button>
            );
        case 'Start Delivery':
        case 'In Transit':
        case 'Reached':
            return (
                <button onClick={() => onAction('Delivered')} className="w-full bg-emerald-500 text-slate-900 h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <CheckCircle size={24} /> Complete Delivery
                </button>
            );
        default:
            return <div className="text-center text-slate-400 font-bold p-4 border border-dashed border-white/20 rounded-2xl">No actions available</div>;
    }
};

const MapStyles = [
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
    { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
];

const VendorMarker = {
    path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
    scale: 1.5,
    fillColor: "#3b82f6",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#ffffff",
};

const CustomerMarker = {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    scale: 1.5,
    fillColor: "#10b981",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#ffffff",
};

const RiderMarker = {
    path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
    scale: 1.5,
    fillColor: "#6d28d9",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#ffffff",
};

export default LiveTracking;
