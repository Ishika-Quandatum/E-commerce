import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Share, MapPin, CheckCircle, Smartphone } from 'lucide-react';

const ActiveDelivery = () => {
    // Rider's active task
    const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.2090 });
    const trackingNumber = "TRK-934M1";

    // Open connection to push coordinates
    const { sendMessage } = useWebSocket(`ws://127.0.0.1:8000/ws/tracking/${trackingNumber}/`, {
        shouldReconnect: () => true,
    });

    const simulateMovement = () => {
        const newLat = currentLocation.lat + 0.0001;
        const newLng = currentLocation.lng + 0.0001;
        setCurrentLocation({ lat: newLat, lng: newLng });
        
        // Broadcast location to WebSocket!
        sendMessage(JSON.stringify({ lat: newLat, lng: newLng }));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-6">Delivery In Progress</h2>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-slate-700/50 p-4 rounded-2xl">
                        <MapPin className="text-emerald-400" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                            <p className="font-bold text-white">423 Block A, Sector 4, Noida</p>
                        </div>
                    </div>

                    <button 
                        onClick={simulateMovement}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Share size={20} /> Broadcast GPS Update
                    </button>

                    <button className="w-full bg-emerald-500 hover:bg-emerald-400 py-4 rounded-xl font-black text-lg transition-colors flex items-center justify-center gap-2 text-slate-900">
                        <Smartphone size={20} /> Verify Customer OTP
                    </button>
                    
                    <p className="text-center text-xs text-slate-500 font-bold">
                        Current Coordinates: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ActiveDelivery;
