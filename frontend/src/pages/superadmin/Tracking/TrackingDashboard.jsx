import React, { useState } from 'react';
import LiveMapOverlay from '../../../components/tracking/LiveMapOverlay';
import { Users, Truck, AlertTriangle } from 'lucide-react';

const TrackingDashboard = () => {
    // For admin to see all riders, normally we'd pull from API
    // Here we just render the master map
    const [stats] = useState({
        activeRiders: 14,
        deliveriesInProgress: 28,
        exceptions: 2
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global Tracking Dashboard</h1>
                <p className="text-slate-500 font-medium">Real-time overview of all riders and active shipments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Riders</p>
                        <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.activeRiders}</h2>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Users size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">In Transit</p>
                        <h2 className="text-4xl font-black text-slate-900 mt-2">{stats.deliveriesInProgress}</h2>
                    </div>
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                        <Truck size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-rose-100 flex items-center justify-between shadow-sm shadow-rose-100">
                    <div>
                        <p className="text-sm font-bold text-rose-400 uppercase tracking-widest">Failed/Delayed</p>
                        <h2 className="text-4xl font-black text-rose-600 mt-2">{stats.exceptions}</h2>
                    </div>
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                        <AlertTriangle size={28} />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-2 shadow-xl shadow-slate-200/40 relative z-0">
                {/* 
                 For admin, you would ideally map over multiple riders and render multiple <Marker>s inside one <MapContainer>.
                 Here we just reuse the LiveMapOverlay for visual demonstration on the dashboard.
                 */}
                <LiveMapOverlay lat={28.6139} lng={77.2090} popupText="All Active Zones" />
            </div>
            
        </div>
    );
};

export default TrackingDashboard;
