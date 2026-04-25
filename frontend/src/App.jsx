import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerRoutes from './routes/CustomerRoutes';
import VendorRoutes from './routes/VendorRoutes';
import SuperAdminRoutes from './routes/SuperAdminRoutes';
import RiderRoutes from './routes/RiderRoutes';
import DeliveryLogin from './pages/delivery/DeliveryLogin';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Delivery Login (Rider) */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />

        {/* Vendor routes */}
        <Route path="/vendor/*" element={<VendorRoutes />} />

        {/* Super Admin routes */}
        <Route path="/admin/*" element={<SuperAdminRoutes />} />

        {/* Rider routes */}
        <Route path="/rider/*" element={<RiderRoutes />} />

        {/* Customer routes (Catch-all) */}
        <Route path="/*" element={<CustomerRoutes />} />
      </Routes>
    </Router>
  );
};

export default App;