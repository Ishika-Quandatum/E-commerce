import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              QuanStore
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Shop</Link>
              <Link to="/categories" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Categories</Link>
              {isAdmin && <Link to="/admin" className="text-red-500 hover:text-red-600 font-semibold transition-colors">Admin</Link>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 focus-within:ring-2 ring-primary-500/20 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>

            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
                  <User size={24} />
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-primary-500/25 active:scale-95"
              >
                Sign In
              </Link>
            )}
            
            <button className="md:hidden p-2 text-slate-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
