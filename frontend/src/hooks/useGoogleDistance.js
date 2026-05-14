import { useState, useEffect } from 'react';

/**
 * Hook to calculate distance and ETA between two points using Google Maps Distance Matrix API
 */
const useGoogleDistance = (origin, destination, googleLoaded) => {
    const [result, setResult] = useState({
        distance: '0.0 km',
        duration: '0 min',
        loading: false,
        error: null
    });

    useEffect(() => {
        if (!googleLoaded || !origin || !destination || !window.google) return;

        const calculateDistance = () => {
            const service = new window.google.maps.DistanceMatrixService();
            
            setResult(prev => ({ ...prev, loading: true }));

            service.getDistanceMatrix(
                {
                    origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
                    destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    unitSystem: window.google.maps.UnitSystem.METRIC,
                },
                (response, status) => {
                    if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                        const element = response.rows[0].elements[0];
                        setResult({
                            distance: element.distance.text,
                            duration: element.duration.text,
                            loading: false,
                            error: null
                        });
                    } else {
                        // Fallback to Haversine if Google fails
                        const dist = haversineDistance(origin, destination);
                        setResult({
                            distance: `${dist.toFixed(1)} km`,
                            duration: `${Math.round(dist * 3)} mins`, // Rough estimate (20km/h)
                            loading: false,
                            error: status === 'OK' ? 'Element error' : status
                        });
                    }
                }
            );
        };

        calculateDistance();
    }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, googleLoaded]);

    return result;
};

// Helper for Haversine fallback
const haversineDistance = (p1, p2) => {
    const R = 6371; // km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default useGoogleDistance;
