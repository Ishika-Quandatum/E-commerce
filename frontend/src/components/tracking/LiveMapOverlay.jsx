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

const LiveMapOverlay = ({ lat, lng, popupText = "Rider's Live Location" }) => {
  const defaultPosition = [28.6139, 77.2090]; // Default fallback location
  const position = (lat && lng) ? [lat, lng] : defaultPosition;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
        </MapContainer>
    </div>
  );
};

export default LiveMapOverlay;
