import React, { useState } from "react";
import { Outlet } from "react-router-dom";  
import SuperAdminSidebar from "./SuperAdminSidebar";
import { Menu, Bell, Search, UserCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const navigate = useNavigate();

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
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
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
              <button className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">SA</div>
                  <span className="text-sm font-normal text-slate-700 group-hover:text-indigo-600 transition-colors hidden sm:block">Admin Center</span>
              </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 bg-slate-50/50 overflow-y-auto">
          <Outlet />   
        </main>
      </div>

    </div>
  );
};

export default SuperAdminLayout;
