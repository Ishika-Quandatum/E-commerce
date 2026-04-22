import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  Tags, 
  ShoppingBag, 
  CreditCard, 
  X,
  Truck
} from "lucide-react";
import clsx from "clsx";

const VendorSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-8 py-8 border-b border-slate-50">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Partner<span className="text-brand-blue">Box</span>
          </h2>
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/vendor' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm",
                  isActive 
                    ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-blue"
                )}
              >
                <Icon size={20} className={clsx("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-brand-blue")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default VendorSidebar;