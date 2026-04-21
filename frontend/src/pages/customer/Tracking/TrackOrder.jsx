import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import LiveMapOverlay from '../../../components/tracking/LiveMapOverlay';
import { MapPin, Navigation, CheckCircle, Package } from 'lucide-react';
import api from '../../../services/api'; // using default axios instance

const TrackOrder = () => {
    const { trackingNumber } = useParams();
    const [shipment, setShipment] = useState(null);
    const [liveLocation, setLiveLocation] = useState({ lat: null, lng: null });

    // Assuming local Django WS testing path
    const WS_URL = `ws://127.0.0.1:8000/ws/tracking/${trackingNumber}/`;
    
    const { lastJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => console.log('WebSocket connection opened.'),
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastJsonMessage !== null) {
            setLiveLocation({
                lat: lastJsonMessage.lat,
                lng: lastJsonMessage.lng
            });
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await api.get(`tracking/shipments/`);
                // In a real scenario, we'd have a detail endpoint by tracking number.
                // For now, let's find it in the list or assume the first for demo if trackingNumber is 'live'
                const found = res.data.find(s => s.tracking_number === trackingNumber || s.id.toString() === trackingNumber);
                if (found) setShipment(found);
            } catch (err) {
                console.error("Failed to fetch tracking meta", err);
            }
        };
        fetchMeta();
    }, [trackingNumber]);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Track Your Shipment</h1>
                <p className="text-slate-500 font-medium">Tracking #: <span className="font-bold text-indigo-600">{trackingNumber}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Status Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest">Delivery Status</h3>
                        
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                                    <Package size={16} />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                    <div className="font-bold text-indigo-600">Dispatched</div>
                                </div>
                            </div>

                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl animate-pulse">
                                    <Navigation size={16} />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                    <div className="font-bold text-amber-600">In Transit</div>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    {shipment?.delivery_otp && (
                        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-600/30 text-center">
                            <p className="text-indigo-200 font-medium text-sm mb-1">Delivery OTP</p>
                            <h2 className="text-4xl font-black tracking-widest">{shipment.delivery_otp}</h2>
                            <p className="text-xs text-indigo-300 mt-3 font-medium">Do not share this OTP over the phone. Only share it when the rider reaches your location.</p>
                        </div>
                    )}
                </div>

                {/* Map Column */}
                <div className="md:col-span-2 space-y-6">
                    <LiveMapOverlay lat={liveLocation.lat} lng={liveLocation.lng} popupText={shipment?.rider?.user?.username || "Rider"} />

                    {shipment?.rider && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                🏍️
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{shipment.rider.user.username}</h4>
                                <p className="text-xs font-bold text-slate-400">VEHICLE: {shipment.rider.vehicle_number}</p>
                            </div>
                            <div className="ml-auto bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                Arriving Soon
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
