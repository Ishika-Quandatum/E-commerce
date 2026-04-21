import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Tags, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  UserCircle,
  X,
  ChevronDown,
  ChevronRight,
  MapPin,
  Bike
} from "lucide-react";
import clsx from "clsx";

const SuperAdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Vendors", path: "/admin/vendors", icon: Users },
    { name: "Categories", path: "/admin/categories", icon: Tags },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Payments", 
      path: "/admin/payments", 
      icon: CreditCard,
      subItems: [
        { name: "Customer Transactions", path: "/admin/payments/customers" },
        { name: "Vendor Transactions", path: "/admin/payments/vendors" },
      ]
    },
    { name: "Delivery Boys", path: "/admin/delivery-boys", icon: Bike },
    { name: "Tracking", path: "/admin/tracking", icon: MapPin },
    { name: "Settings", path: "/admin/settings", icon: Tags },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-8 py-8">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            QuanStore <span className="text-indigo-500 not-italic uppercase tracking-normal ml-1">Admin</span>
          </h2>
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-slate-800 text-slate-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">Main Navigation</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <div key={item.name} className="space-y-1">
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={20} className={clsx("transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                  <span>{item.name}</span>
                  {item.subItems ? (
                    <div className="ml-auto">
                      {isActive || location.pathname.startsWith(item.path) ? (
                        <ChevronDown size={14} className="opacity-50" />
                      ) : (
                        <ChevronRight size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  ) : (
                    isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                    )
                  )}
                </Link>
                {item.subItems && (isActive || location.pathname.startsWith(item.path)) && (
                  <div className="ml-9 space-y-1 pt-1 animate-in slide-in-from-top-1 duration-300">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setIsOpen(false)}
                          className={clsx(
                            "block px-4 py-2 text-[13px] font-bold rounded-xl transition-all",
                            isSubActive ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-white"
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
            <div className="bg-slate-800/50 rounded-[2rem] p-4 border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-xs">SA</div>
                    <div>
                        <div className="text-xs font-bold text-white leading-none mb-1">Super Admin</div>
                        <div className="text-[10px] text-slate-500 font-medium">Control Center</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminSidebar;
