import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Store, ShoppingBag, Truck, CheckCircle, MapPin, Phone, Map, Loader2, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VendorSignup = () => {
  const { user, completeSignup, vendorStatus } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: '',
    shop_type: 'Grocery',
    shop_address: '',
    city: '',
    state: '',
    pincode: '',
    pickup_contact: '',
    location_lat: null,
    location_lng: null,
  });
  const [loading, setLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If user is already an approved vendor, they shouldn't be here
  useEffect(() => {
    if (user?.role === 'vendor' && vendorStatus === 'Approved') {
      navigate('/vendor');
    }
  }, [user, vendorStatus, navigate]);

  const fetchCoordinates = async () => {
    if (!formData.shop_address || !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please fill in all address fields first");
      return;
    }

    setGeocodingLoading(true);
    
    // Smart Search Strategy: Try multiple combinations if one fails
    const searchQueries = [
      `${formData.shop_address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
      `${formData.city}, ${formData.state}, ${formData.pincode}`,
      `${formData.pincode}, India`
    ];

    try {
      let foundData = null;
      
      for (const query of searchQueries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          foundData = data[0];
          break; // Found it!
        }
      }
      
      if (foundData) {
        const { lat, lon } = foundData;
        setFormData(prev => ({ ...prev, location_lat: parseFloat(lat), location_lng: parseFloat(lon) }));
        toast.success("Location verified and coordinates captured!", {
          icon: '📍',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.error("Location not found. Please check your address details.");
      }
    } catch (err) {
      toast.error("Geocoding failed. Please check your network.");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location_lat || !formData.location_lng) {
      toast.error("Please click 'Choose Shop Location' to verify your address coordinates.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await vendorService.signup(formData);
      completeSignup(res.data);
      toast.success("Application submitted successfully!");
      navigate('/vendor');
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        // Handle DRF style errors: { "field": ["error"] }
        const messages = Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ');
        setError(messages || 'Failed to submit application.');
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'vendor' && vendorStatus === 'Pending') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
        <p className="text-slate-600 mb-8">
          Your vendor application is currently under review by our team. We will notify you once your shop is ready!
        </p>
        <button 
          onClick={() => navigate('/vendor')}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Become a Seller on <span className="text-primary-600">QuanStore</span>
        </h1>
        <p className="mt-4 text-xl text-slate-500">
          Join thousands of businesses and start selling your products to millions of customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Info Column */}
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reach Millions</h3>
              <p className="text-slate-600">Access our massive customer base and grow your business exponentialy.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Easy Catalog Management</h3>
              <p className="text-slate-600">List products, manage stock, and set prices with our intuitive dashboard.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Seamless Logistics</h3>
              <p className="text-slate-600">Focus on your business while we handle the complicated fulfillment infrastructure.</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vendor Registration</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Marketplace Logistics Ready</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Section 1: Business Details */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                   <ShoppingBag size={12} className="text-primary-600" /> Shop Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {!user && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                          <input 
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                          <input 
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Account Password</label>
                        <input 
                          type="password"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                          placeholder="Min 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Shop Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-bold text-primary-700"
                        placeholder="e.g. My Awesome Shop"
                        value={formData.shop_name}
                        onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Shop Category</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium appearance-none"
                        value={formData.shop_type}
                        onChange={(e) => setFormData({...formData, shop_type: e.target.value})}
                      >
                        <option value="Grocery">Grocery</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Logistics & Location */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                   <Truck size={12} className="text-primary-600" /> Pickup Logistics
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
                      <Phone size={10} /> Pickup Contact Number
                    </label>
                    <input 
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.pickup_contact}
                      onChange={(e) => setFormData({...formData, pickup_contact: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Complete Shop Address</label>
                    <textarea 
                      required
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium resize-none"
                      placeholder="Floor, Building, Street name..."
                      value={formData.shop_address}
                      onChange={(e) => setFormData({...formData, shop_address: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">City</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                        placeholder="Coimbatore"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">State</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                        placeholder="Tamil Nadu"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Pincode</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                        placeholder="641001"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={fetchCoordinates}
                      disabled={geocodingLoading}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${formData.location_lat ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                    >
                      {geocodingLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : formData.location_lat ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Map size={18} />
                      )}
                      {formData.location_lat ? 'Location Verified' : 'Choose Shop Location'}
                    </button>
                    {formData.location_lat && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                         <Navigation size={10} /> Lat: {formData.location_lat.toFixed(4)} | Lng: {formData.location_lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                 <Truck size={16} className="shrink-0" />
                 {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || geocodingLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl shadow-primary-500/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing Application...
                </>
              ) : (
                <>
                  {user ? 'Apply as Seller' : 'Create Account & Register'}
                  <Truck size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center space-y-3">
            {!user ? (
              <>
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
                <p className="text-xs text-slate-400">
                  Just want to shop?{' '}
                  <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
                    Create a customer account
                  </Link>
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Logged in as <span className="font-bold text-slate-600">{user.email}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
