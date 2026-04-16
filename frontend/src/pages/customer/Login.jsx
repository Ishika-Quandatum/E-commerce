import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { authService, cartService } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  const addPendingProduct = async () => {
    const pendingProduct = localStorage.getItem("pending_cart_product");
    const token = localStorage.getItem("access_token");

    if (pendingProduct && token) {
      try {
        await cartService.addToCart({
          product_id: pendingProduct,
          quantity: 1,
        });

        localStorage.removeItem("pending_cart_product");
      } catch (err) {
        console.error("Auto cart error", err);
      }
    }
  };

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
    } else {
      navigate("/", { replace: true });
    }

  } catch (err) {
    setError('Invalid username or password');
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
              Username
            </label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:ring-2 ring-primary-500/20 outline-none"
              placeholder="Your username"
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
            <input
              required
              type="password"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:ring-2 ring-primary-500/20 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
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