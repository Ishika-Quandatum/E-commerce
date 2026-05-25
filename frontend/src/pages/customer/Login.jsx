import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { authService, cartService } from '../../services/api';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const addPendingProduct = async () => {
    const pendingProduct = localStorage.getItem("pending_cart_product");
    const pendingQuantity = localStorage.getItem("pending_cart_quantity") || 1;
    const pendingSize = localStorage.getItem("pending_cart_size");
    const token = localStorage.getItem("access_token");

    if (pendingProduct && token) {
      try {
        await cartService.addToCart({
          product_id: pendingProduct,
          quantity: parseInt(pendingQuantity),
          size: pendingSize ? JSON.parse(pendingSize) : null
        });

        localStorage.removeItem("pending_cart_product");
        localStorage.removeItem("pending_cart_quantity");
        localStorage.removeItem("pending_cart_size");
        
        toast.success("Item added to cart!", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: '🛒'
        });
      } catch (err) {
        console.error("Auto cart error", err);
      }
    }
  };

  useEffect(() => {
    addPendingProduct();
  }, []);

  // LOGIN SUBMIT
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const user = await login(formData);   

    console.log("USER DATA:", user);

    const isSuper =
      user?.role === "superadmin" ||
      user?.role === "admin" ||
      user?.is_staff ||
      user?.is_superuser;

    if (isSuper) {
      navigate("/admin", { replace: true });
    } else if (user?.role === "vendor") {
      navigate("/vendor", { replace: true });
    } else if (user?.role === "rider") {
      navigate("/rider", { replace: true });
    } else {
      // Redirect back to the page they came from (e.g. product page), or home
      const redirectTo = sessionStorage.getItem("redirect_after_login");
      sessionStorage.removeItem("redirect_after_login");
      navigate(redirectTo || "/", { replace: true });
    }

    } catch (err) {
    setError(err.response?.data?.detail || 'Invalid username/email or password');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-500">
            Sign in to your account and continue your journey.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Username / Email
            </label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 h-14 focus:ring-2 ring-primary-500/20 outline-none"
              placeholder="Your username or email"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 pr-12 h-14 focus:ring-2 ring-primary-500/20 outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.09.387-2.12 1.05-3M6.53 6.53A9.956 9.956 0 0112 5c5 0 9 4 9 7a9.97 9.97 0 01-2.347 3.653M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-lg active:scale-95"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-600 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;