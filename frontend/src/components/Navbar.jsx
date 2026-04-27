import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { platformName } = usePlatform();
  const navigate = useNavigate();

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Branding Logic: Extract parts for styling with robust fallback
  const displayName = (platformName || 'QUANSTORE').toUpperCase();
  const logoMain = displayName.length > 2 ? displayName.substring(0, displayName.length - 1) : displayName;
  const logoLast = displayName.length > 2 ? displayName.substring(displayName.length - 1) : "";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-brand-purple uppercase italic flex items-center">
              <span>{logoMain}</span>
              {logoLast && (
                <span className="text-brand-orange not-italic font-black text-3xl -ml-0.5 transform -translate-y-0.5">{logoLast}</span>
              )}
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/products" className="text-brand-navy/70 hover:text-brand-purple font-bold transition-all text-sm uppercase tracking-widest relative group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all group-hover:w-full" />
              </Link>
              <Link to="/categories" className="text-brand-navy/70 hover:text-brand-purple font-bold transition-all text-sm uppercase tracking-widest relative group">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all group-hover:w-full" />
              </Link>
              <Link to="/about-us" className="text-brand-navy/70 hover:text-brand-purple font-bold transition-all text-sm uppercase tracking-widest relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all group-hover:w-full" />
              </Link>
              
              {user && user.role === 'superadmin' && (
                <Link to="/admin" className="bg-brand-purple/5 hover:bg-brand-purple/10 px-4 py-2 rounded-xl text-brand-purple font-bold text-xs transition-all border border-brand-purple/10">Admin</Link>
              )}
              {user && user.role === 'vendor' && (
                <Link to="/vendor" className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-brand-orange/20 hover:scale-105 transition-transform">Vendor Panel</Link>
              )}
              {(!user || user.role === 'user') && (
                <Link to="/become-seller" className="text-brand-purple font-black text-xs uppercase tracking-tighter hover:text-brand-purple/80 transition-colors">Become Partner</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-brand-soft-gray rounded-2xl px-4 py-2 gap-2 border border-slate-200 focus-within:border-brand-purple/30 focus-within:bg-white transition-all">
              <Search size={18} className="text-brand-navy/40" />
              <input 
                type="text" 
                placeholder="Search premium goods..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-brand-navy/30 text-brand-navy font-medium"
              />
            </div>

            <Link to="/cart" className="relative p-2.5 text-brand-navy/70 hover:text-brand-purple transition-all bg-brand-soft-gray rounded-2xl border border-slate-100 group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center shadow-lg shadow-brand-pink/40">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="p-2.5 text-brand-navy/70 hover:text-brand-purple transition-all bg-brand-soft-gray rounded-2xl">
                  <User size={22} />
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2.5 text-brand-navy/40 hover:text-brand-pink transition-all"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-brand-purple text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-purple/20 active:scale-95 hover:bg-brand-purple/90"
              >
                Sign In
              </Link>
            )}
            
            <button className="md:hidden p-2 text-brand-navy/60 hover:text-brand-purple">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
