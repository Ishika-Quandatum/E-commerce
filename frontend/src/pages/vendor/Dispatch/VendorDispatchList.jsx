import React, { useState, useEffect } from 'react';
import { Package, Truck, Navigation, Search, Filter } from 'lucide-react';
import api from '../../../services/api';
import DispatchStats from '../../../components/vendor/Dispatch/DispatchStats';
import DispatchTable from '../../../components/vendor/Dispatch/DispatchTable';
import AssignRiderModal from '../../../components/vendor/Dispatch/AssignRiderModal';
import DispatchConfirmationModal from '../../../components/vendor/Dispatch/DispatchConfirmationModal';

const VendorDispatchList = () => {
    const [shipments, setShipments] = useState([]);
    const [stats, setStats] = useState({});
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [activeShipmentId, setActiveShipmentId] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shipRes, statsRes, ridersRes] = await Promise.all([
                api.get('tracking/shipments/'),
                api.get('tracking/shipments/dashboard_stats/'),
                api.get('tracking/available_riders/')
            ]);
            setShipments(shipRes.data);
            setStats(statsRes.data);
            setRiders(ridersRes.data);
        } catch (err) {
            console.error("Failed to fetch dispatch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`tracking/shipments/${id}/update_dispatch_status/`, { status });
            fetchData(); // Refresh
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleAssignRider = (id) => {
        setActiveShipmentId(id);
        setShowAssignModal(true);
    };

    const confirmRiderAssignment = async (riderId) => {
        try {
            await api.post(`tracking/shipments/${activeShipmentId}/assign_rider/`, { rider_id: riderId });
            setShowAssignModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to assign rider", err);
        }
    };

    const handleDispatchClick = (shipment) => {
        setSelectedShipment(shipment);
        setShowDispatchModal(true);
    };

    const confirmDispatch = async (weight) => {
        try {
            await api.post(`tracking/shipments/${selectedShipment.id}/dispatch/`, { parcel_weight: weight });
            setShowDispatchModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to dispatch", err);
        }
    };

    if (loading && shipments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                      <Truck size={20} />
                   </div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Dispatch <span className="text-indigo-600 not-italic">& Shipments</span></h1>
                </div>
                <p className="text-slate-400 font-bold max-w-2xl">
                    Professional fulfillment command center. Manage orders from packing to final mile delivery.
                </p>
            </div>

            {/* Stats */}
            <DispatchStats stats={stats} />

            {/* Alerts Section (Optional/Future) */}
            <div className="flex items-center gap-4 p-6 bg-rose-50 border border-rose-100 rounded-[2rem]">
               <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Navigation size={24} />
               </div>
               <div>
                  <h4 className="font-black text-rose-900 leading-none mb-1">Live Shipment Intelligence</h4>
                  <p className="text-sm font-bold text-rose-600">You have {stats.ready_to_dispatch || 0} parcels waiting for rider assignment. High priority.</p>
               </div>
            </div>

            {/* Main Table */}
            <DispatchTable 
                shipments={shipments}
                onAssignRider={handleAssignRider}
                onDispatch={handleDispatchClick}
                onUpdateStatus={handleUpdateStatus}
                onPrintLabel={(s) => alert(`Printing Label for Order #${s.order_id}`)}
            />

            {/* Modals */}
            <AssignRiderModal 
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                riders={riders}
                onAssign={confirmRiderAssignment}
            />

            <DispatchConfirmationModal 
                isOpen={showDispatchModal}
                onClose={() => setShowDispatchModal(false)}
                shipment={selectedShipment}
                onConfirm={confirmDispatch}
            />
        </div>
    );
};

export default VendorDispatchList;
