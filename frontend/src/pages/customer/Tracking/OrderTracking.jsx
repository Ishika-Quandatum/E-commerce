import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackingService } from '../../../services/api';
import { 
  Package, MapPin, Navigation, Clock, Phone, MessageSquare, 
  ChevronRight, AlertTriangle, HelpCircle, ShieldCheck, 
  CheckCircle2, Truck, Timer, Info, Store, User, Map as MapIcon,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import useGoogleDistance from '../../../hooks/useGoogleDistance';

const OrderTracking = () => {
    const { id } = useParams(); // shipmentId
    const navigate = useNavigate();
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    // Dynamic origin and destination for distance calculation
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);

    const fetchTracking = async () => {
        try {
            const res = await trackingService.getTrackingDetails(id);
            const data = res.data;
            setTrackingData(data);
            
            // Set dynamic points for Distance calculation
            if (data.customer_info) {
                setDestination({ 
                    lat: parseFloat(data.customer_info.lat), 
                    lng: parseFloat(data.customer_info.lng) 
                });
            }

            const riderPos = data.current_location ? {
                lat: parseFloat(data.current_location.latitude),
                lng: parseFloat(data.current_location.longitude)
            } : null;

            const vendorPos = data.vendor_info ? {
                lat: parseFloat(data.vendor_info.lat),
                lng: parseFloat(data.vendor_info.lng)
            } : null;

            // Logic: Before Pickup -> Vendor to Customer. After Pickup -> Rider to Customer.
            if (['Start Pickup', 'Picked Up', 'Start Delivery', 'In Transit', 'Reached'].includes(data.shipment_status) && riderPos) {
                setOrigin(riderPos);
            } else if (vendorPos) {
                setOrigin(vendorPos);
            }

            setLoading(false);
        } catch (err) {
            console.error("Tracking Error:", err);
            setError(err.response?.data?.error || err.response?.data?.detail || "Unable to load tracking details.");
            setLoading(false);
        }
    };

    const googleMetrics = useGoogleDistance(origin, destination, googleLoaded);

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, 5000); // Poll every 5s for real-time
        return () => clearInterval(interval);
    }, [id]);

    // Google Maps Script Loader
    useEffect(() => {
        if (window.google) {
            setGoogleLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => setGoogleLoaded(true);
        document.head.appendChild(script);
    }, []);

    const mapInstance = useRef(null);
    const directionsRenderer = useRef(null);
    const markers = useRef({ rider: null, vendor: null, customer: null });

    // Map Initialization and Update
    useEffect(() => {
        if (!googleLoaded || !trackingData || !mapRef.current) return;

        const riderPos = (trackingData.current_location && trackingData.current_location.latitude && trackingData.current_location.longitude) ? {
            lat: parseFloat(trackingData.current_location.latitude),
            lng: parseFloat(trackingData.current_location.longitude)
        } : null;
        
        const customerPos = {
            lat: parseFloat(trackingData.customer_info?.lat || 12.9716),
            lng: parseFloat(trackingData.customer_info?.lng || 77.5946)
        };

        const vendorPos = (trackingData.vendor_info && trackingData.vendor_info.lat && trackingData.vendor_info.lng) ? {
            lat: parseFloat(trackingData.vendor_info.lat),
            lng: parseFloat(trackingData.vendor_info.lng)
        } : null;

        // Initialize Map once
        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: customerPos,
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

        const map = mapInstance.current;

        // Update/Create Markers
        if (!markers.current.customer) {
            markers.current.customer = new window.google.maps.Marker({
                position: customerPos,
                map,
                title: "Your Location",
                icon: CustomerMarker
            });
        } else {
            markers.current.customer.setPosition(customerPos);
        }

        if (vendorPos) {
            if (!markers.current.vendor) {
                markers.current.vendor = new window.google.maps.Marker({
                    position: vendorPos,
                    map,
                    title: "Vendor Location",
                    icon: VendorMarker
                });
            } else {
                markers.current.vendor.setPosition(vendorPos);
            }
        }

        if (riderPos) {
            if (!markers.current.rider) {
                markers.current.rider = new window.google.maps.Marker({
                    position: riderPos,
                    map,
                    title: "Rider",
                    icon: RiderMarker
                });
            } else {
                markers.current.rider.setPosition(riderPos);
            }

            // Update Route
            const directionsService = new window.google.maps.DirectionsService();
            const routeOrigin = riderPos;
            const routeDestination = customerPos;

            directionsService.route({
                origin: routeOrigin,
                destination: routeDestination,
                travelMode: window.google.maps.TravelMode.DRIVING
            }, (result, status) => {
                if (status === "OK") {
                    directionsRenderer.current.setDirections(result);
                }
            });

            // Auto-fit bounds occasionally or when significantly moved
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(customerPos);
            bounds.extend(riderPos);
            if (vendorPos) bounds.extend(vendorPos);
            map.fitBounds(bounds, 80);
        }
    }, [googleLoaded, trackingData]);

    // Marker/Style Definitions
    const MapStyles = [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
        { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
        { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
    ];

    const CustomerMarker = {
        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
        scale: 10,
        fillColor: "#10b981",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff"
    };

    const VendorMarker = {
        path: window.google?.maps?.SymbolPath?.BACKWARD_CLOSED_ARROW || 0,
        scale: 6,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff"
    };

    const RiderMarker = {
        path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
        scale: 1.5,
        fillColor: "#6d28d9",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff"
    };

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

    const stages = [
        { label: 'Confirmed', statuses: ['Dispatch Queue', 'Assigned'], icon: <Package size={18} /> },
        { label: 'Pickup', statuses: ['Start Pickup'], icon: <Store size={18} /> },
        { label: 'Picked Up', statuses: ['Picked Up'], icon: <Truck size={18} /> },
        { label: 'Delivering', statuses: ['Start Delivery', 'In Transit', 'Reached'], icon: <Navigation size={18} /> },
        { label: 'Arrived', statuses: ['Delivered'], icon: <CheckCircle2 size={18} /> }
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
                            <p className="text-brand-purple-light/40 mt-1 font-medium">Live progress updates for your delivery</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-brand-purple-light/40 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Arrival</p>
                                    <p className="text-lg font-black">
                                        {googleMetrics.duration !== '0 min' ? googleMetrics.duration : (trackingData.eta ? new Date(trackingData.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Calculating...')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-brand-purple-light/40 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-lg font-black uppercase tracking-tighter text-emerald-400">{trackingData.shipment_status}</p>
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
                        
                        {/* Delivery Progress Timeline */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-10 flex items-center gap-2">
                                <Clock className="text-brand-purple" />
                                Delivery Progress
                            </h3>
                            
                            <div className="relative mt-8 mb-4 px-4">
                                {/* Track Line Background */}
                                <div className="absolute top-6 left-12 right-12 h-[2px] bg-slate-100 -translate-y-1/2 z-0"></div>
                                
                                {/* Track Line Filled */}
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
                                            <div key={idx} className="flex flex-col items-center w-12 sm:w-24">
                                                <motion.div 
                                                    whileHover={{ scale: 1.1 }}
                                                    className={clsx(
                                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 bg-white",
                                                        isPast && "bg-brand-purple text-white shadow-lg border border-brand-purple",
                                                        isCurrent && "border-[3px] border-brand-purple text-brand-purple shadow-xl bg-white",
                                                        isFuture && "border-2 border-slate-100 text-slate-300 bg-white"
                                                    )}
                                                >
                                                    {isPast ? <CheckCircle2 size={24} /> : stage.icon}
                                                </motion.div>
                                                <div className="text-center mt-4 hidden sm:block">
                                                    <p className={clsx(
                                                        "text-[10px] font-black uppercase tracking-tight transition-colors",
                                                        isPast || isCurrent ? "text-brand-purple" : "text-slate-400"
                                                    )}>
                                                        {stage.label}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Live Google Map */}
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 h-[550px] relative z-0">
                            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live Rider Tracking</span>
                                </div>
                            </div>
                            <div ref={mapRef} className="w-full h-full" />
                        </div>
                    </div>

                    {/* Right Column: Information Cards */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Rider Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900">Delivery Executive</h3>
                                <div className="bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {trackingData.shipment_status === 'Delivered' ? 'Completed' : 'On the way'}
                                </div>
                            </div>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-900">{trackingData.rider_info?.name || "Rider Partner"}</h4>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                                        {trackingData.rider_info?.vehicle || 'Verified Rider'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a 
                                    href={`tel:${trackingData.rider_info?.phone}`}
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

                        {/* Location Summary */}
                        <div className="bg-brand-navy rounded-[2.5rem] p-8 shadow-2xl shadow-brand-navy/30 text-white">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black">Route Summary</h3>
                                <MapIcon size={18} className="text-white/40" />
                            </div>

                            <div className="space-y-6 relative">
                                <div className="absolute left-5 top-8 bottom-8 w-px bg-white/10 border-l border-dashed border-white/20"></div>
                                
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Store size={18} className="text-brand-purple-light" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Pickup From</p>
                                        <p className="text-sm font-bold text-white leading-tight">{trackingData.vendor_info?.shop_name || "Vendor Store"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Deliver To</p>
                                        <p className="text-sm font-bold text-white leading-tight">{trackingData.customer_info?.address || "Your Address"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Distance</p>
                                    <p className="text-lg font-black text-white">
                                        {googleMetrics.distance && googleMetrics.distance !== '0.0 km' ? googleMetrics.distance : (trackingData.distance || 'Calculating...')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">ETA</p>
                                    <p className="text-lg font-black text-white">
                                        {googleMetrics.duration && googleMetrics.duration !== '0 min' ? googleMetrics.duration : '~15 Mins'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-6">Order Items</h3>
                            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {trackingData.order_items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs">
                                                {item.qty}x
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-400">₹{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
