import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home, Navigation, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const RiderLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Mobile-Friendly Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900">
            <Navigation size={18} />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic">Rider<span className="text-emerald-400 not-italic">App</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-slate-900" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Persistent Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-around z-40 max-w-md mx-auto shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        <button 
          onClick={() => navigate("/rider")}
          className="flex flex-col items-center gap-1 text-indigo-600 transition-colors"
        >
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Tasks</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
          <Bell size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Alerts</span>
        </button>
        <div className="w-12 h-12 bg-slate-900 rounded-full -mt-10 flex items-center justify-center text-white shadow-xl shadow-slate-900/20 border-4 border-slate-50">
           <Navigation size={22} />
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
          <Navigation size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">History</span>
        </button>
        <button 
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
            {user?.username?.slice(0,1).toUpperCase()}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default RiderLayout;
