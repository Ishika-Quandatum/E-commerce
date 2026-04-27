import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  ChevronDown, 
  ShoppingBag,
  Heart,
  ChevronRight,
  Phone,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';
import { productService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { platformName } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
    setIsMegaMenuOpen(false);
  };

  const handleSubCategoryClick = (parentSlug, subSlug) => {
    navigate(`/products?category=${parentSlug}&subcategory=${subSlug}`);
    setIsMegaMenuOpen(false);
  };

  return (
    <nav 
      className={clsx(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-lg py-2" 
          : "bg-white py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-purple rounded-2xl flex items-center justify-center shadow-lg shadow-brand-purple/20 group-hover:rotate-12 transition-transform">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-brand-navy uppercase italic">
              {platformName || 'Rainbow Store'}
            </span>
          </Link>

          {/* 2. CENTER MENU (Desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className={clsx("nav-link", location.pathname === '/' && "active")}>Home</Link>
            <Link to="/products" className={clsx("nav-link", location.pathname === '/products' && "active")}>Shop</Link>
            
            {/* Categories Mega Menu Trigger */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className={clsx("nav-link flex items-center gap-1", isMegaMenuOpen && "text-brand-purple")}>
                Categories <ChevronDown size={14} className={clsx("transition-transform", isMegaMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[800px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-0 h-[450px]">
                      {/* Sidebar */}
                      <div className="col-span-1 bg-slate-50 p-6 space-y-2 border-r border-slate-100 overflow-y-auto">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/40 mb-4 px-3">Top Categories</h4>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setActiveCategory(cat)}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={clsx(
                              "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all text-left",
                              activeCategory?.id === cat.id 
                                ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20" 
                                : "text-brand-navy/60 hover:bg-white hover:text-brand-purple"
                            )}
                          >
                            {cat.name} <ChevronRight size={14} />
                          </button>
                        ))}
                      </div>

                      {/* Content Area */}
                      <div className="col-span-3 p-10 bg-white">
                        {activeCategory ? (
                          <div className="space-y-8">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                              <div>
                                <h3 className="text-2xl font-black text-brand-navy">{activeCategory.name}</h3>
                                <p className="text-xs font-medium text-brand-text-gray mt-1 uppercase tracking-widest">Explore our premium selection</p>
                              </div>
                              <button 
                                onClick={() => handleCategoryClick(activeCategory.slug)}
                                className="text-brand-purple font-black text-xs uppercase tracking-widest hover:gap-2 flex items-center transition-all"
                              >
                                View All <ChevronRight size={14} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                              {activeCategory.children && activeCategory.children.length > 0 ? (
                                activeCategory.children.map(sub => (
                                  <button 
                                    key={sub.id}
                                    onClick={() => handleSubCategoryClick(activeCategory.slug, sub.slug)}
                                    className="flex items-start gap-4 group text-left"
                                  >
                                    <div className="w-12 h-12 bg-brand-purple/5 rounded-2xl flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                                      <LayoutGrid size={20} />
                                    </div>
                                    <div>
                                      <h5 className="font-black text-brand-navy group-hover:text-brand-purple transition-colors">{sub.name}</h5>
                                      <p className="text-[10px] font-medium text-brand-text-gray uppercase tracking-widest mt-1">Discover items</p>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="col-span-2 py-10 text-center">
                                  <p className="text-slate-400 font-bold italic">More subcategories coming soon!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-brand-purple-light rounded-full flex items-center justify-center mb-6">
                               <LayoutGrid size={32} className="text-brand-purple" />
                            </div>
                            <h4 className="text-lg font-black text-brand-navy">Select a Category</h4>
                            <p className="text-sm font-medium text-brand-text-gray max-w-xs mt-2">Hover over the list on the left to explore specific collections.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about-us" className={clsx("nav-link", location.pathname === '/about-us' && "active")}>About Us</Link>
            <Link to="/contact-us" className={clsx("nav-link", location.pathname === '/contact-us' && "active")}>Contact Us</Link>
          </div>

          {/* 3. RIGHT ICONS (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <div className="relative group">
               <button className="icon-btn">
                  <Search size={20} />
               </button>
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative icon-btn group">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-brand-pink/30 animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/profile" className="flex items-center gap-3 px-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-brand-purple-light flex items-center justify-center text-brand-purple shadow-inner">
                    <User size={18} />
                  </div>
                  <div className="hidden xl:block">
                     <p className="text-[10px] font-black text-brand-text-gray uppercase tracking-widest leading-none mb-1">Welcome back</p>
                     <p className="text-xs font-black text-brand-navy leading-none">{user.first_name || 'Member'}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="icon-btn text-slate-300 hover:text-brand-pink ml-1"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="ml-4 bg-brand-navy text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-purple transition-all shadow-xl active:scale-95">
                Sign In
              </Link>
            )}
          </div>

          {/* 4. MOBILE TOGGLE */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden icon-btn"
          >
            <Menu size={24} />
          </button>

        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[200] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[201] lg:hidden p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-purple rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="text-white" size={20} />
                  </div>
                  <span className="text-xl font-black text-brand-navy uppercase italic">{platformName}</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="icon-btn">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    to={link.path}
                    className={clsx(
                      "block text-2xl font-black uppercase italic tracking-tighter",
                      location.pathname === link.path ? "text-brand-purple" : "text-brand-navy"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="pt-6 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/40">Shop by Categories</p>
                   <div className="grid grid-cols-2 gap-4">
                      {categories.slice(0, 4).map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className="bg-slate-50 p-4 rounded-2xl text-left hover:bg-brand-purple-light transition-all group"
                        >
                           <h5 className="font-black text-brand-navy text-xs uppercase group-hover:text-brand-purple">{cat.name}</h5>
                        </button>
                      ))}
                   </div>
                </div>
              </nav>

              <div className="pt-10 border-t border-slate-100 space-y-4">
                 {user ? (
                   <>
                    <Link to="/profile" className="flex items-center gap-4 p-4 bg-brand-purple-light rounded-[2rem]">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-purple shadow-sm">
                          <User size={24} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-brand-navy leading-none mb-1">{user.first_name}</p>
                          <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">View Profile</p>
                       </div>
                    </Link>
                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full py-5 rounded-[2rem] border-2 border-brand-pink/20 text-brand-pink font-black text-sm uppercase tracking-widest"
                    >
                      Logout
                    </button>
                   </>
                 ) : (
                   <Link to="/login" className="block w-full py-6 bg-brand-purple text-white rounded-[2rem] text-center font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-purple/20">
                     Sign In to Account
                   </Link>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .nav-link {
          @apply text-brand-navy/70 hover:text-brand-purple font-black text-sm uppercase tracking-widest transition-all relative py-2;
        }
        .nav-link.active {
          @apply text-brand-purple;
        }
        .nav-link::after {
          content: '';
          @apply absolute bottom-0 left-0 w-0 h-0.5 bg-brand-purple transition-all;
        }
        .nav-link:hover::after, .nav-link.active::after {
          @apply w-full;
        }
        .icon-btn {
          @apply p-2.5 text-brand-navy/70 hover:text-brand-purple hover:bg-brand-purple/5 rounded-2xl transition-all border border-transparent active:scale-90;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
