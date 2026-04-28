import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { UserCircle, Shield, Mail, Calendar, Search, Filter, MoreHorizontal } from "lucide-react";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming adminService has a getUsers method or similar
    // For now, using mock data or empty list if service call fails
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        // If the backend doesn't have a direct "all users" for superadmin yet, 
        // we might need a specifically tuned endpoint. For now, empty or mock.
      const res = await adminService.getVendors(); // Using vendors as a proxy if users list is not available
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-medium text-slate-900 tracking-tight uppercase italic">User <span className="text-indigo-600 not-italic uppercase tracking-normal">Direct</span></h1>
          <p className="mt-1 text-slate-500 font-medium lowercase">Aggregated database of cross-platform merchant and customer profiles.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Trace identity..." className="outline-none text-sm font-medium w-40" />
            </div>
            <button className="bg-slate-900 text-white p-2.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
                <Filter size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[3rem] p-8 flex flex-col items-center text-center group hover:bg-slate-900 hover:text-white transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-24 h-24 rounded-full bg-slate-50 p-1 border-4 border-slate-100 mb-6 group-hover:border-slate-800 transition-all duration-500 overflow-hidden relative">
                <div className="w-full h-full bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-medium text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 uppercase italic">
                    {user.user?.name?.charAt(0) || user.name?.charAt(0) || "U"}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium tracking-tight mb-1">{user.user?.name || user.name || "Anonymous User"}</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    <Shield size={12} strokeWidth={3} /> {user.role || "Vendor"}
                </span>
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-slate-50 group-hover:border-slate-800 transition-all duration-500">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white/40">
                        <Mail size={16} />
                        <span className="text-[10px] font-medium uppercase tracking-widest tracking-tighter">Endpoint</span>
                    </div>
                    <span className="text-xs font-normal truncate max-w-[150px]">{user.user?.email || user.email || "hidden@quanstore.net"}</span>
                </div>
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white/40">
                        <Calendar size={16} />
                        <span className="text-[10px] font-medium uppercase tracking-widest">Enrolled</span>
                    </div>
                    <span className="text-xs font-normal">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <button className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-colors flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all lg:translate-y-4 group-hover:translate-y-0">
                Audit Profile <MoreHorizontal size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUserList;
