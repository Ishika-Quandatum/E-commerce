import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Store, ShoppingBag, Truck, CheckCircle } from 'lucide-react';

const VendorSignup = () => {
  const { user, completeSignup, vendorStatus } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: '',
    shop_type: 'Grocery',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If user is already an approved vendor, they shouldn't be here
  useEffect(() => {
    if (user?.role === 'vendor' && vendorStatus === 'Approved') {
      navigate('/vendor');
    }
  }, [user, vendorStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await vendorService.signup(formData);
      completeSignup(res.data);
      navigate('/vendor');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
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
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Vendor Registration</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            {user ? 'Apply with your current account details' : 'Register a new account or sign in to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {!user && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className={user ? '' : 'pt-2 border-t border-slate-100 mt-2'}>
                <label className="block text-sm font-medium text-slate-700 mb-1 text-primary-600">Shop Name</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. My Awesome Shop"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 text-primary-600">Shop Type</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white"
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

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Submitting...' : user ? 'Apply as Seller' : 'Register as Seller'}
            </button>
          </form>

          {!user && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
