import React, { useState, useEffect } from "react";
import { 
  Bike, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Users, 
  Zap, 
  MapPin, 
  Clock, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { adminService } from "../../../services/api";
import AddDeliveryBoyModal from "../../../components/superadmin/Delivery/AddDeliveryBoyModal";
import EditDeliveryBoyModal from "../../../components/superadmin/Delivery/EditDeliveryBoyModal";
import clsx from "clsx";

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-200 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{subtext}</span>
    </div>
    <div className="text-3xl font-black text-slate-800 tracking-tighter">{value}</div>
    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{title}</p>
  </div>
);

const DeliveryBoyList = () => {
    const [riders, setRiders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRider, setSelectedRider] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionError, setActionError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ridersRes, statsRes] = await Promise.all([
                adminService.getRiders(),
                adminService.getRiderStats()
            ]);
            setRiders(ridersRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Failed to fetch fleet data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (rider) => {
        setSelectedRider(rider);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this delivery boy? This will permanently remove their account.")) return;
        
        setActionError("");
        try {
            await adminService.deleteRider(id);
            fetchData();
        } catch (err) {
            setActionError(err.response?.data?.error || "Failed to delete rider.");
        }
    };


    const filteredRiders = riders.filter(r => 
        r.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${r.user.first_name} ${r.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                          <Bike size={20} />
                       </div>
                       <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Logistics Control</h2>
                   </div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Fleet <span className="text-indigo-600 not-italic uppercase tracking-normal">Management</span></h1>
                   <p className="text-slate-400 font-bold mt-2 max-w-xl">Monitor your delivery partners, track fleet availability, and onboard new personnel in real-time.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all"
                >
                   <Plus size={18} /> Add Delivery Boy
                </button>
            </div>

            {actionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center justify-between">
                    <span>{actionError}</span>
                    <button onClick={() => setActionError("")} className="text-rose-400 hover:text-rose-600 font-black">X</button>
                </div>
            )}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                   title="Total Riders" 
                   value={stats.total_delivery_boys || 0} 
                   icon={Users} 
                   color="bg-indigo-600" 
                   subtext="CAPACITY" 
                />
                <StatCard 
                   title="Active Fleet" 
                   value={stats.active_riders || 0} 
                   icon={Zap} 
                   color="bg-emerald-500" 
                   subtext="APPROVED" 
                />
                <StatCard 
                   title="Online Now" 
                   value={stats.online_now || 0} 
                   icon={MapPin} 
                   color="bg-amber-500" 
                   subtext="LIVE" 
                />
                <StatCard 
                   title="Pending Deliveries" 
                   value={stats.pending_deliveries || 0} 
                   icon={Clock} 
                   color="bg-rose-500" 
                   subtext="QUEUED" 
                />
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                {/* Search & Filters */}
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black" size={18} />
                        <input 
                           type="text" 
                           placeholder="Search by ID, Name, or Email..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                           <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rider Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Availability</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registered</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRiders.map((rider) => (
                                <tr key={rider.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {rider.user.username.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm tracking-tight">{rider.user.first_name} {rider.user.last_name || rider.user.username}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{rider.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Mail size={12} className="text-slate-300" /> {rider.user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Phone size={12} className="text-slate-300" /> {rider.user.phone || "N/A"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black tracking-tighter">
                                            {rider.assigned_orders_count || 0} Orders
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={clsx(
                                            "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                            rider.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                        )}>
                                            {rider.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-2 h-2 rounded-full", rider.availability_status === 'Online' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                            <span className="text-xs font-bold text-slate-700">{rider.availability_status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-slate-500 italic">
                                        {new Date(rider.join_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(rider)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(rider.id)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Simulation */}
                <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">Showing {filteredRiders.length} of {riders.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ChevronLeft size={20} /></button>
                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20">1</div>
                        <button className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            <AddDeliveryBoyModal 
               isOpen={showAddModal} 
               onClose={() => setShowAddModal(false)}
               onSuccess={fetchData}
            />

            <EditDeliveryBoyModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                rider={selectedRider}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default DeliveryBoyList;
