import { useEffect, useRef, useState } from 'react';

/**
 * Hook for Live Tracking via WebSockets
 * @param {string} trackingNumber - The shipment tracking number
 * @param {boolean} isRider - If true, will attempt to send GPS updates
 */
export const useLiveTracking = (trackingNumber, isRider = false) => {
    const [location, setLocation] = useState(null);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!trackingNumber) return;

        const token = localStorage.getItem('access_token');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${wsProtocol}://${window.location.hostname}:8000/ws/tracking/${trackingNumber}/?token=${token}`;

        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            console.log('WS Connected');
            setConnected(true);
            
            // If rider, start watching position
            if (isRider && navigator.geolocation) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        if (socketRef.current?.readyState === WebSocket.OPEN) {
                            socketRef.current.send(JSON.stringify({
                                lat: latitude,
                                lng: longitude
                            }));
                        }
                    },
                    (err) => console.error("GPS Error", err),
                    { enableHighAccuracy: true, maximumAge: 10000 }
                );
            }
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLocation(data);
        };

        socketRef.current.onclose = () => {
            console.log('WS Disconnected. Reconnecting...');
            setConnected(false);
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            // Attempt reconnect after 3 seconds
            setTimeout(() => {
                // Re-trigger effect by some state if needed, or recursive call
            }, 3000);
        };

        return () => {
            socketRef.current?.close();
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [trackingNumber, isRider]);

    return { location, connected };
};
