import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Search, ChevronDown, ChevronRight, LayoutGrid, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';
import Profile from '../pages/customer/Profile';
import { productService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { platformName } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories({ top_level: 'true' });
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
    setIsMegaMenuOpen(false);
  };

  const handleSubCategoryClick = (parentSlug, subSlug) => {
    navigate(`/products?category=${parentSlug}&subcategory=${subSlug}`);
    setIsMegaMenuOpen(false);
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Branding Logic: Extract parts for styling with robust fallback
  const displayName = (platformName || 'QUANSTORE').toUpperCase();
  const logoMain = displayName.length > 2 ? displayName.substring(0, displayName.length - 1) : displayName;
  const logoLast = displayName.length > 2 ? displayName.substring(displayName.length - 1) : "";

  return (
    <>
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
              <Link to="/products" className="text-brand-navy/70 hover:text-brand-purple transition-all text-sm uppercase tracking-widest relative group">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all group-hover:w-full" />
              </Link>
              <div 
                className="relative group h-full flex items-center"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button 
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  className={clsx(
                    "text-brand-navy/70 hover:text-brand-purple transition-all text-sm uppercase tracking-widest relative group flex items-center gap-1",
                    isMegaMenuOpen && "text-brand-purple"
                  )}
                >
                  Categories <ChevronDown size={14} className={clsx("transition-transform", isMegaMenuOpen && "rotate-180")} />
                  <span className={clsx(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-brand-purple transition-all",
                    isMegaMenuOpen ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </button>

                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-10 left-0 mt-4 w-[1000px] max-w-[calc(100vw-2rem)] bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex z-[100]"
                    >
                      {/* Sidebar */}
                      <div className="w-[320px] bg-slate-50 p-6 space-y-2 border-r border-slate-100 overflow-y-auto max-h-[500px] custom-scrollbar shrink-0">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/40 mb-4 px-3">Top Categories</h4>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setActiveCategory(cat)}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={clsx(
                              "w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all text-left",
                              activeCategory?.id === cat.id 
                                ? "bg-brand-purple text-white shadow-xl shadow-brand-purple/20" 
                                : "text-brand-navy/70 hover:bg-white hover:text-brand-purple hover:shadow-sm"
                            )}
                          >
                            <span className="truncate pr-2">{cat.name}</span> <ChevronRight size={16} className={clsx(activeCategory?.id === cat.id ? "text-white" : "text-brand-navy/30")} />
                          </button>
                        ))}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-10 bg-white max-h-[500px] overflow-y-auto custom-scrollbar">
                        {activeCategory ? (
                          <div className="space-y-8">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                              <div>
                                <h3 className="text-3xl font-black text-brand-navy">{activeCategory.name}</h3>
                                <p className="text-xs font-bold text-brand-text-gray mt-2 uppercase tracking-widest">Explore our premium selection</p>
                              </div>
                              <button 
                                onClick={() => handleCategoryClick(activeCategory.slug)}
                                className="text-brand-purple font-black text-xs uppercase tracking-widest hover:gap-2 flex items-center transition-all px-4 py-2 bg-brand-purple/5 hover:bg-brand-purple/10 rounded-xl"
                              >
                                View All <ChevronRight size={14} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                              {activeCategory.children && activeCategory.children.length > 0 ? (
                                activeCategory.children.map(sub => (
                                  <button 
                                    key={sub.id}
                                    onClick={() => handleSubCategoryClick(activeCategory.slug, sub.slug)}
                                    className="flex items-center gap-4 group text-left p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                                  >
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all shadow-sm group-hover:shadow-brand-purple/20 shrink-0">
                                      <LayoutGrid size={22} />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-brand-navy group-hover:text-brand-purple transition-colors text-base">{sub.name}</h5>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Discover items</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="col-span-2 py-16 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                    <LayoutGrid size={24} />
                                  </div>
                                  <p className="text-slate-500 font-bold">More subcategories coming soon!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-24 h-24 bg-brand-purple-light rounded-full flex items-center justify-center mb-6 shadow-inner">
                               <LayoutGrid size={40} className="text-brand-purple" />
                            </div>
                            <h4 className="text-2xl font-black text-brand-navy">Select a Category</h4>
                            <p className="text-sm font-medium text-brand-text-gray max-w-sm mt-3 leading-relaxed">Hover over the list on the left to explore specific collections in our premium catalog.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              
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

            <Link to="/cart" className="relative p-2.5 text-brand-navy/70 hover:text-brand-orange transition-all bg-brand-soft-gray rounded-2xl border border-slate-100 group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center shadow-lg shadow-brand-orange/40">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <Link to="/profile" className="relative p-2.5 text-brand-navy/70 hover:text-brand-orange transition-all bg-brand-soft-gray rounded-2xl border border-slate-100 flex items-center justify-center">
                  <User size={22} className="group-hover:scale-110 transition-transform" />
                  {user?.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] text-center shadow-lg shadow-brand-orange/40">
                      {user.unreadCount}
                    </span>
                  )}
                </Link>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-slate-100 mb-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.first_name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-brand-purple hover:bg-slate-50 transition-colors">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-brand-purple hover:bg-slate-50 transition-colors">
                      <Package size={16} /> My Orders
                    </Link>
                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-slate-100 pt-3"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="relative p-2.5 text-brand-navy/70 hover:text-brand-purple transition-all bg-brand-soft-gray rounded-2xl border border-slate-100 group hidden sm:flex">
                  <User size={22} className="group-hover:scale-110 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="bg-brand-purple text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-purple/20 active:scale-95 hover:bg-brand-purple/90"
                >
                  Sign In
                </Link>
              </>
            )}
            
            <button className="md:hidden p-2 text-brand-navy/60 hover:text-brand-purple">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default Navbar;
