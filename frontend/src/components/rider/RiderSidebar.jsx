import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MapPin, 
  DollarSign, 
  Bell, 
  Clock, 
  Wallet, 
  UserCircle, 
  Settings, 
  LogOut,
  Truck,
  X 
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import { usePlatform } from "../../context/PlatformContext";

const RiderSidebar = ({ isOpen, setIsOpen }) => {
  const { platformName } = usePlatform();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/rider", icon: LayoutDashboard },
    { name: "My Orders", path: "/rider/orders", icon: ShoppingBag },
    { name: "Live Tracking", path: "/rider/tracking", icon: MapPin },
    { name: "Wallet / COD", path: "/rider/wallet", icon: Wallet },
    { name: "Salary / Earnings", path: "/rider/earnings", icon: DollarSign },
    { name: "Notifications", path: "/rider/notifications", icon: Bell },
    { name: "Attendance", path: "/rider/attendance", icon: Clock },
    { name: "Profile", path: "/rider/profile", icon: UserCircle },
    { name: "Settings", path: "/rider/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-8 py-8">
            <Link to="/rider" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <Truck size={22} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">
                    {platformName}<span className="text-indigo-600 not-italic border-l border-slate-200 ml-2 pl-2 tracking-widest text-[10px]">RIDER</span>
                </h2>
            </Link>
          <button 
            className="lg:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4 opacity-50 font-title">Main Portal</div>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-[15px] group",
                  isActive 
                    ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue"
                )}
              >
                <Icon size={20} className={clsx("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-brand-blue")} />
                <span>{item.name}</span>
                {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                )}
              </Link>
            );
          })}

          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-[15px] text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 mt-4 group"
          >
            <LogOut size={20} className="text-rose-400 group-hover:text-rose-600 transition-colors" />
            <span>Logout</span>
          </button>
        </nav>

        <div className="p-6">
            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-brand-blue">DB</div>
                    <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-900 truncate">Delivery Partner</div>
                        <div className="text-[10px] text-emerald-500 font-black flex items-center gap-1 uppercase tracking-tighter">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Active Now
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default RiderSidebar;
