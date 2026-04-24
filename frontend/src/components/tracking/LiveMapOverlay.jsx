import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix typical Leaflet icon routing issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AnimatedRoute = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if(lat && lng) map.flyTo([lat, lng], 16, { duration: 1.5 });
    }, [lat, lng, map]);
    return null;
};

const LiveMapOverlay = ({ lat, lng, fleet = [], popupText = "Rider's Live Location", height = "400px", zoom = 13 }) => {
  const defaultPosition = [28.6139, 77.2090]; // Default fallback location (New Delhi)
  const position = (lat && lng) ? [lat, lng] : defaultPosition;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Single Rider Mode */}
            {(lat && lng) && (
                <>
                    <AnimatedRoute lat={lat} lng={lng} />
                    <Marker position={position}>
                        <Popup className="font-bold text-indigo-600">
                            🏍️ {popupText}
                        </Popup>
                    </Marker>
                </>
            )}

            {/* Fleet Mode (Global Dashboard) */}
            {fleet && fleet.length > 0 && fleet.map((rider) => (
                <Marker 
                    key={rider.id} 
                    position={[rider.current_lat, rider.current_lng]}
                >
                    <Popup>
                        <div className="p-1">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Rider</p>
                            <p className="text-sm font-black text-slate-900 mb-2">{rider.user?.get_full_name || rider.user?.username}</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Live Signal</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    </div>
  );
};

export default LiveMapOverlay;
