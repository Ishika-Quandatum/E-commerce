import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/customer/Home'
import ProductList from '../pages/customer/ProductList'
import ProductDetail from '../pages/customer/ProductDetail'
import Cart from '../pages/customer/Cart'
import Checkout from '../pages/customer/Checkout'
import Login from '../pages/customer/Login'
import Register from '../pages/customer/Register'
import Profile from '../pages/customer/Profile'
import VendorSignup from '../pages/customer/VendorSignup'
import TrackOrder from '../pages/customer/Tracking/TrackOrder'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CustomerRoutes = () => {
  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/become-seller" element={<VendorSignup />} />
        <Route path="/track-order/:trackingNumber" element={<TrackOrder />} />
      </Routes>
      <Footer />
    </>
  )
}

export default CustomerRoutes