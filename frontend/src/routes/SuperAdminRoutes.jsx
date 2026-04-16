import React from "react";
import { Routes, Route } from "react-router-dom";
import VendorManagement from "../pages/superadmin/VendorManagement";
// We can reuse the vendor layout or create a super admin layout
// For now let's create a minimal view
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const SuperAdminRoutes = () => {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) return <div>Loading super admin...</div>;

  if (!isSuperAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/" element={<VendorManagement />} />
      <Route path="/vendors" element={<VendorManagement />} />
    </Routes>
  );
};

export default SuperAdminRoutes;
