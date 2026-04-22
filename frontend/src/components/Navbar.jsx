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
    <nav className="sticky top-0 z-50 bg-brand-blue shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20 text-white">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase italic flex items-center">
              <span>{logoMain}</span>
              {logoLast && (
                <span className="text-brand-orange not-italic font-black text-3xl -ml-0.5 transform -translate-y-0.5">{logoLast}</span>
              )}
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/products" className="text-white/80 hover:text-white font-bold transition-all text-sm uppercase tracking-widest">Shop</Link>
              <Link to="/categories" className="text-white/80 hover:text-white font-bold transition-all text-sm uppercase tracking-widest">Categories</Link>
              
              {user && user.role === 'superadmin' && (
                <Link to="/admin" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white font-bold text-xs transition-all border border-white/10">Admin</Link>
              )}
              {user && user.role === 'vendor' && (
                <Link to="/vendor" className="bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-brand-orange/20">Vendor Panel</Link>
              )}
              {(!user || user.role === 'user') && (
                <Link to="/become-seller" className="text-emerald-400 hover:text-emerald-300 font-black text-xs uppercase tracking-tighter">Become Partner</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-white/10 rounded-2xl px-4 py-2 gap-2 border border-white/10 focus-within:bg-white/20 transition-all">
              <Search size={18} className="text-white/60" />
              <input 
                type="text" 
                placeholder="Search premium goods..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-white/40 text-white font-medium"
              />
            </div>

            <Link to="/cart" className="relative p-2.5 text-white/80 hover:text-white transition-all bg-white/10 rounded-2xl border border-white/5 mx-2">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center shadow-lg shadow-brand-orange/40">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="p-2.5 text-white/80 hover:text-white transition-all bg-white/10 rounded-2xl">
                  <User size={22} />
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2.5 text-white/60 hover:text-white transition-all"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-white text-brand-blue px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 border border-white"
              >
                Sign In
              </Link>
            )}
            
            <button className="md:hidden p-2 text-white/60 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
