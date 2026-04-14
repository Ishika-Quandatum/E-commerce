import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";

import AdminDashboard from "../pages/admin/Dashborad/AdminDashboard";
import ProductList from "../pages/admin/Products/ProductList";
import AddProduct from "../pages/admin/Products/AddProduct";
import EditProduct from "../pages/admin/Products/EditProduct";
import OrderList from "../pages/admin/Orders/OrderList";
import OrderDetails from "../pages/admin/Orders/OrderDetails";
import PaymentList from "../pages/admin/Payments/PaymentList";
import CategoryList from "../pages/admin/Categories/CategoryList";
import AddCategory from "../pages/admin/Categories/AddCategory";
import EditCategory from "../pages/admin/Categories/EditCategory";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>

        <Route index element={<AdminDashboard />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        {/* Payments */}
        <Route path="payments" element={<PaymentList />} />

        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />

      </Route>
    </Routes>
  );
};

export default AdminRoutes;