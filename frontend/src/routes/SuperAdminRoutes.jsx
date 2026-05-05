import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SuperAdminLayout from "../components/superadmin/SuperAdminLayout";
import AdminDashboard from "../pages/superadmin/Dashboard/AdminDashboard";
import VendorManagement from "../pages/superadmin/VendorManagement";
import CategoryList from "../pages/superadmin/Categories/CategoryList";
import AddCategory from "../pages/superadmin/Categories/AddCategory";
import EditCategory from "../pages/superadmin/Categories/EditCategory";
import AdminProductList from "../pages/superadmin/Products/AdminProductList";
import ProductReviews from "../pages/superadmin/Products/ProductReviews";
import AdminOrderList from "../pages/superadmin/Orders/AdminOrderList";
import AdminPaymentList from "../pages/superadmin/Payments/AdminPaymentList";
import CustomerTransactions from "../pages/superadmin/Payments/CustomerTransactions";
import VendorTransactions from "../pages/superadmin/Payments/VendorTransactions";
import CODCollections from "../pages/superadmin/Payments/CODCollections";
import RiderTransactions from "../pages/superadmin/Payments/RiderTransactions";
import RiderSettlements from "../pages/superadmin/Payments/RiderSettlements";
import AdminUserList from "../pages/superadmin/Users/AdminUserList";
import Settings from "../pages/superadmin/Settings";
import TrackingDashboard from "../pages/superadmin/Tracking/TrackingDashboard";
import DeliveryBoyList from "../pages/superadmin/Delivery/DeliveryBoyList";

const SuperAdminRoutes = () => {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isSuperAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/" element={<SuperAdminLayout />}>
        <Route index element={<VendorManagement />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vendors" element={<VendorManagement />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />

        {/* View Only Modules */}
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/reviews" element={<ProductReviews />} />
        <Route path="orders" element={<AdminOrderList />} />
        <Route path="payments" element={<AdminPaymentList />} />
        <Route path="payments/customers" element={<CustomerTransactions />} />
        <Route path="payments/vendors" element={<VendorTransactions />} />
        <Route path="payments/cod-collections" element={<CODCollections />} />
        <Route path="payments/rider-transactions" element={<RiderTransactions />} />
        <Route path="payments/settlements" element={<RiderSettlements />} />
        <Route path="users" element={<AdminUserList />} />
        
        {/* Delivery Boy Management */}
        <Route path="delivery-boys" element={<DeliveryBoyList />} />

        {/* Tracking */}
        <Route path="tracking" element={<TrackingDashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;
