import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RiderLayout from "../components/rider/RiderLayout";
import ActiveDelivery from "../pages/rider/ActiveDelivery";

// We can create a RiderLayout later if needed, for now we can use a simple wrapper
const RiderRoutes = () => {
  const { user, loading, isRider } = useAuth();

  if (loading) return null;

  // Strictly check for rider role
  if (!user || !isRider) {
    return <Navigate to="/delivery/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<RiderLayout />}>
        <Route index element={<ActiveDelivery />} />
        <Route path="active/:trackingNumber" element={<ActiveDelivery />} />
      </Route>
    </Routes>
  );
};

export default RiderRoutes;
