import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerRoutes from './routes/CustomerRoutes';
import AdminRoutes from './routes/AdminRoutes';

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Customer routes */}
        <Route path="/*" element={<CustomerRoutes />} />

        {/* Admin routes */}
       <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;