import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RiderLayout from "../components/rider/RiderLayout";
import RiderDashboard from "../pages/rider/RiderDashboard";
import MyOrders from "../pages/rider/MyOrders";
import Attendance from "../pages/rider/Attendance";
import RiderWallet from "../pages/rider/RiderWallet";
import RiderEarnings from "../pages/rider/RiderEarnings";
import ActiveDelivery from "../pages/rider/ActiveDelivery";
import RiderProfile from "../pages/rider/RiderProfile";

// Stub components for remaining pages
const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
        <p>This layout is ready for the {title} content.</p>
    </div>
);

const RiderRoutes = () => {
  const { user, loading, isRider } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 text-brand-blue font-black">
        Initializing Portal...
    </div>
  );

  if (!user || !isRider) {
    return <Navigate to="/delivery/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<RiderLayout />}>
        <Route index element={<RiderDashboard />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="wallet" element={<RiderWallet />} />
        <Route path="earnings" element={<RiderEarnings />} />
        <Route path="tracking" element={<Placeholder title="Live Tracking" />} />
        <Route path="notifications" element={<Placeholder title="Notifications" />} />
        <Route path="profile" element={<RiderProfile />} />
        <Route path="settings" element={<Placeholder title="Account Settings" />} />
        
        {/* Legacy / Compatibility routes */}
        <Route path="active/:trackingNumber" element={<ActiveDelivery />} />
      </Route>
    </Routes>
  );
};

export default RiderRoutes;
