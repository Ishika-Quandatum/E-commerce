import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import RiderSidebar from "./RiderSidebar";
import { Menu, User, Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const RiderLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            <RiderSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Dashboard Header */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:bg-white transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search orders..." 
                                className="bg-transparent border-none outline-none text-sm w-48 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-6">
                        <div className="flex items-center gap-1">
                            <button className="p-3 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-2xl transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
                            </button>
                        </div>
                        
                        <div className="w-px h-8 bg-slate-100 mx-2 hidden sm:block" />

                        <div className="flex items-center gap-3 pl-2">
                           <div className="text-right hidden sm:block">
                               <p className="text-xs font-black text-slate-900 leading-none mb-1">
                                    {user?.first_name} {user?.last_name}
                               </p>
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    Availability: Online
                               </p>
                           </div>
                           <div className="w-11 h-11 bg-slate-100 rounded-2xl border-2 border-slate-50 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-slate-400" />
                                )}
                           </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default RiderLayout;
