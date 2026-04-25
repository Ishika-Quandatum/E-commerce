import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Tags, 
  ShoppingBag, 
  CreditCard, 
  X,
  Truck,
  LogOut
} from "lucide-react";
import clsx from "clsx";
import { usePlatform } from "../../context/PlatformContext";
import { useAuth } from "../../context/AuthContext";

const VendorSidebar = ({ isOpen, setIsOpen }) => {
  const { platformName } = usePlatform();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/vendor", icon: LayoutDashboard },
    { name: "Products", path: "/vendor/products", icon: Box },
    { name: "Orders", path: "/vendor/orders", icon: ShoppingBag },
    { name: "Dispatch", path: "/vendor/dispatch", icon: Truck },
    { name: "Payments", path: "/vendor/payments", icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-8 py-8 border-b border-slate-100 mb-4">
          <h2 className="text-2xl font-black tracking-tighter text-brand-navy uppercase italic">
            {platformName} <span className="text-brand-purple not-italic uppercase tracking-normal ml-1">Vendor</span>
          </h2>
          <button 
            className="lg:hidden p-2 rounded-xl hover:bg-brand-soft-gray text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/vendor' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group",
                  isActive 
                    ? "bg-brand-purple text-white shadow-xl shadow-brand-purple/20" 
                    : "text-brand-navy/60 hover:bg-brand-purple-light hover:text-brand-purple"
                )}
              >
                <Icon size={20} className={clsx("transition-colors", isActive ? "text-white" : "text-brand-navy/40 group-hover:text-brand-purple")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-brand-pink hover:bg-brand-pink/5 transition-all font-bold text-sm group"
            >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Logout</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default VendorSidebar;