import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VendorLayout from "../components/vendor/VendorLayout";
import { useAuth } from "../context/AuthContext";

import VendorDashboard from "../pages/vendor/Dashboard/VendorDashboard";
import ProductList from "../pages/vendor/Products/ProductList";
import AddProduct from "../pages/vendor/Products/AddProduct";
import EditProduct from "../pages/vendor/Products/EditProduct";
import OrderList from "../pages/vendor/Orders/OrderList";
import OrderDetails from "../pages/vendor/Orders/OrderDetails";
import PaymentList from "../pages/vendor/Payments/PaymentList";
import VendorDispatchList from "../pages/vendor/Dispatch/VendorDispatchList";

const VendorRoutes = () => {
  const { user, loading, isVendor, isSuperAdmin } = useAuth();

  if (loading) return null;

  // Allow Super Admins to view vendor pages for debugging/support, 
  // otherwise strictly check for vendor role.
  if (!user || (!isVendor && !isSuperAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<VendorLayout />}>

        <Route index element={<VendorDashboard />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        {/* Payments */}
        <Route path="payments" element={<PaymentList />} />

        {/* Dispatch & Tracking */}
        <Route path="dispatch" element={<VendorDispatchList />} />


      </Route>
    </Routes>
  );
};

export default VendorRoutes;