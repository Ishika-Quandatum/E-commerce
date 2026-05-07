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
import OrderTracking from '../pages/customer/Tracking/OrderTracking'
import TrackOrder from '../pages/customer/Tracking/TrackOrder'
import AboutUs from '../pages/customer/AboutUs'
import ContactUs from '../pages/customer/ContactUs'
import NewArrivals from '../pages/customer/NewArrivals'
import BestSellers from '../pages/customer/BestSellers'
import Offers from '../pages/customer/Offers'
import Categories from '../pages/customer/Categories'
import TrackOrderSearch from '../pages/customer/Tracking/TrackOrderSearch'
import ShippingInfo from '../pages/customer/ShippingInfo'
import Returns from '../pages/customer/Returns'

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
        <Route path="/tracking/:id" element={<OrderTracking />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/track-order" element={<TrackOrderSearch />} />
        <Route path="/shipping-info" element={<ShippingInfo />} />
        <Route path="/returns" element={<Returns />} />
      </Routes>
      <Footer />
    </>
  )
}

export default CustomerRoutes