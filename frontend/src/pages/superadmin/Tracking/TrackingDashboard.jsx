
import React, { useState, useEffect } from 'react';
import LiveMapOverlay from '../../../components/tracking/LiveMapOverlay';
import { Users, Truck, AlertTriangle, Loader2 } from 'lucide-react';
import { trackingService, riderService } from '../../../services/api';

const TrackingDashboard = () => {
    const [stats, setStats] = useState({
        active_riders: 0,
        in_transit_orders: 0,
        failed_delayed_orders: 0
    });
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, ridersRes] = await Promise.all([
                trackingService.getGlobalTrackingSummary(),
                riderService.getRiders()
            ]);
            setStats(statsRes.data);
            // Filter riders who have valid coordinates for the map
            const allRiders = Array.isArray(ridersRes.data) ? ridersRes.data : (ridersRes.data.results || []);
            setRiders(allRiders.filter(r => r.current_lat && r.current_lng));
        } catch (err) {
            console.error("Failed to fetch tracking data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats.active_riders) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-brand-blue animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Syncing Live Fleet Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global Tracking Dashboard</h1>
                    <p className="text-slate-500 font-medium">Real-time overview of all riders and active shipments.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-xs font-bold text-emerald-500">{new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Riders</p>
                        <h2 className="text-5xl font-black text-slate-900 mt-2 tracking-tighter">{stats.active_riders}</h2>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                        <Users size={32} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">In Transit</p>
                        <h2 className="text-5xl font-black text-slate-900 mt-2 tracking-tighter">{stats.in_transit_orders}</h2>
                    </div>
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
                        <Truck size={32} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-rose-100 flex items-center justify-between shadow-sm shadow-rose-100 hover:shadow-xl hover:shadow-rose-500/5 transition-all group">
                    <div>
                        <p className="text-xs font-black text-rose-400 uppercase tracking-[0.2em]">Failed/Delayed</p>
                        <h2 className="text-5xl font-black text-rose-600 mt-2 tracking-tighter">{stats.failed_delayed_orders}</h2>
                    </div>
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform">
                        <AlertTriangle size={32} />
                    </div>
                </div>
            </div>

            <div className="bg-white border-4 border-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/60 relative z-0">
                <LiveMapOverlay 
                    fleet={riders} 
                    zoom={12}
                    height="600px"
                />
            </div>
            
        </div>
    );
};

export default TrackingDashboard;
