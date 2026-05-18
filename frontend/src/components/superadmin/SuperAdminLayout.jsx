import React, { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, UserCircle, LogOut, User, ChevronDown, Shield, Package } from "lucide-react";
import clsx from "clsx";
import AddDeliveryBoyModal from "./Delivery/AddDeliveryBoyModal";

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddRiderOpen, setIsAddRiderOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const handleOpenModal = () => setIsAddRiderOpen(true);
    window.addEventListener('open-add-delivery-boy-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-delivery-boy-modal', handleOpenModal);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGlobalSearch = (e) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div 
      className="flex bg-slate-50 flex-col lg:flex-row h-screen overflow-hidden antialiased text-slate-900" 
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}
    >
      
      <SuperAdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-96 border border-transparent focus-within:border-indigo-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                <Search size={18} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search catalog products (Press Enter)..." 
                    className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    onKeyDown={handleGlobalSearch}
                />
            </div>
          </div>

          <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group">
                  <Bell size={20} />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium uppercase">
                      {user?.first_name ? (
                        `${user.first_name.substring(0, 1)}${user?.last_name ? user.last_name.substring(0, 1) : ""}`
                      ) : (
                        user?.username?.substring(0, 2) || "AD"
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block leading-tight">
                        {user?.first_name || user?.username || "Admin"}
                      </span>
                    </div>
                    <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                </button>
 
                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-60 bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100">
                          <p className="text-lg font-bold text-slate-900 truncate mb-0.5">
                            {user?.first_name || user?.username || "Admin"}
                          </p>
                          <p className="text-xs font-medium text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/admin/account-settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all group"
                          >
                            <User size={18} className="text-slate-400 group-hover:text-indigo-600" />
                            <span className="text-sm font-medium">My Profile</span>
                          </Link>
                          <Link 
                            to="/admin/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 transition-all group"
                          >
                            <Package size={18} className="text-slate-400 group-hover:text-indigo-600" />
                            <span className="text-sm font-medium">My Orders</span>
                          </Link>
                        </div>
                        <div className="p-2 border-t border-slate-50">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />   
          </div>
        </main>
      </div>

      <AddDeliveryBoyModal 
        isOpen={isAddRiderOpen} 
        onClose={() => setIsAddRiderOpen(false)} 
        onSuccess={() => window.dispatchEvent(new Event('rider-onboarded'))} 
      />
    </div>
  );
};

export default SuperAdminLayout;
