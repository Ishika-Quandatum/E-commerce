import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerRoutes from './routes/CustomerRoutes';
import VendorRoutes from './routes/VendorRoutes';
import SuperAdminRoutes from './routes/SuperAdminRoutes';

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Customer routes */}
        <Route path="/*" element={<CustomerRoutes />} />

        {/* Vendor routes */}
        <Route path="/vendor/*" element={<VendorRoutes />} />

        {/* Super Admin routes */}
        <Route path="/admin/*" element={<SuperAdminRoutes />} />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;