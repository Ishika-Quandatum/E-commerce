import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";

const MapPicker = ({ lat, lng, onChange }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        // Handle Google Maps Auth Failure
        window.gm_authFailure = () => {
            console.error("Google Maps Authentication Failed (Invalid API Key)");
            setAuthError(true);
        };

        if (window.google && window.google.maps && window.google.maps.Map) {
            setGoogleLoaded(true);
            return;
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            const checkInterval = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.Map) {
                    setGoogleLoaded(true);
                    clearInterval(checkInterval);
                }
            }, 500);
            return () => clearInterval(checkInterval);
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Even after onload, the internal modules might take a few ms
            const checkInternal = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.Map) {
                    setGoogleLoaded(true);
                    clearInterval(checkInternal);
                }
            }, 100);
        };
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (googleLoaded && mapRef.current && !authError) {
            // Safety check: ensure google.maps is fully initialized
            if (!window.google || !window.google.maps || !window.google.maps.Map) return;

            const initialPos = { lat: parseFloat(lat) || 28.6139, lng: parseFloat(lng) || 77.2090 };

            if (!mapInstance.current) {
                mapInstance.current = new window.google.maps.Map(mapRef.current, {
                    center: initialPos,
                    zoom: 15,
                    styles: MapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                markerInstance.current = new window.google.maps.Marker({
                    position: initialPos,
                    map: mapInstance.current,
                    draggable: true,
                    animation: window.google.maps.Animation.DROP,
                });

                window.google.maps.event.addListener(markerInstance.current, 'dragend', () => {
                    const pos = markerInstance.current.getPosition();
                    onChange({ lat: pos.lat(), lng: pos.lng() });
                });

                mapInstance.current.addListener('click', (e) => {
                    markerInstance.current.setPosition(e.latLng);
                    onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                });
            } else {
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
                mapInstance.current.setCenter(newPos);
                markerInstance.current.setPosition(newPos);
            }
        }
    }, [googleLoaded, lat, lng, authError]);

    const handleCurrentLocation = () => {
        if ("geolocation" in navigator && mapInstance.current) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                mapInstance.current.setCenter(newPos);
                markerInstance.current.setPosition(newPos);
                onChange(newPos);
            });
        }
    };

    return (
        <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-slate-200 group">
            {(!googleLoaded || authError) && (
                <div className="absolute inset-0 z-10 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                    {authError ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                                <Search size={24} className="text-red-500" />
                            </div>
                            <p className="text-sm font-black text-slate-800">Invalid API Key</p>
                            <p className="text-[11px] text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                                The Google Maps API key provided is invalid or has expired. Please update it in <code className="bg-slate-100 px-1 rounded">MapPicker.jsx</code> to enable the interactive map.
                            </p>
                        </>
                    ) : (
                        <>
                            <Loader2 size={32} className="text-brand-purple animate-spin mb-2" />
                            <p className="text-sm font-bold text-slate-500">Initializing Interactive Map...</p>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Connecting to Google Maps services...</p>
                        </>
                    )}
                </div>
            )}
            <div ref={mapRef} className="w-full h-full bg-slate-50" />
            
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                        <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinates Selected</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}</p>
                    </div>
                </div>
            </div>

            {!authError && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button 
                        type="button"
                        onClick={handleCurrentLocation}
                        className="p-3 bg-white text-brand-purple rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all group/btn"
                        title="Use Current Location"
                    >
                        <Navigation size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

const MapStyles = [
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
    { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e2e8f0" }] }
];

export default MapPicker;
