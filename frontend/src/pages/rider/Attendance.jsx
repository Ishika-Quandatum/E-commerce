import React, { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  History as HistoryIcon,
  Timer,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { adminService } from "../../services/api";

const Attendance = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await adminService.getRiderAttendance();
            const logs = res.data;
            setHistory(logs);
            
            // Check if there's an active session (punch in without punch out)
            const active = logs.find(log => !log.check_out);
            if (active) {
                setIsPunchedIn(true);
                setActiveSession(active);
            } else {
                setIsPunchedIn(false);
                setActiveSession(null);
            }
        } catch (err) {
            console.error("Error fetching attendance", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePunch = async () => {
        setLoading(true);
        try {
            if (isPunchedIn) {
                await adminService.punchOut();
            } else {
                await adminService.punchIn();
            }
            fetchAttendance();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
                        Attendance <span className="text-brand-blue">Hub</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your work sessions and daily availability.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <Calendar size={20} className="text-brand-blue" />
                    <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Punch Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-700 ${isPunchedIn ? 'bg-emerald-500' : 'bg-brand-blue'}`} />
                        
                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl transition-all duration-500 group-hover:scale-110 ${isPunchedIn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Clock size={40} className={isPunchedIn ? 'animate-pulse' : ''} />
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                            {isPunchedIn ? "You are on Duty" : "Ready to Start?"}
                        </h2>
                        <p className="text-slate-500 font-bold mb-10 max-w-sm">
                            {isPunchedIn 
                                ? `Working since ${new Date(activeSession.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                                : "Punch in to start receiving new delivery assignments nearby."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
                            <button 
                                onClick={handlePunch}
                                disabled={loading}
                                className={`flex-1 w-full py-5 rounded-[24px] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                    isPunchedIn 
                                    ? "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600" 
                                    : "bg-brand-blue text-white shadow-brand-blue/30 hover:bg-brand-blue-hover"
                                }`}
                            >
                                <CheckCircle2 size={24} />
                                {isPunchedIn ? "Punch Out" : "Punch In Now"}
                            </button>
                        </div>

                        {activeSession && (
                            <div className="mt-8 flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Timer size={16} className="text-brand-blue" />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Time</span>
                                </div>
                                <div className="w-px h-4 bg-slate-200" />
                                <span className="font-title font-black text-brand-blue">
                                    Calculating...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black font-title">Quick Stats</h3>
                            <Clock size={18} className="text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue">
                                        <Timer size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Total Hours</span>
                                </div>
                                <span className="font-black text-slate-900">142.5h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-brand-orange">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Days Present</span>
                                </div>
                                <span className="font-black text-slate-900">22</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-lg font-bold mb-4 opacity-80">Shift Efficiency</h3>
                        <div className="text-4xl font-black mb-2">94%</div>
                        <p className="text-xs font-bold opacity-70">You're in the top 10% of riders this week!</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <HistoryIcon size={24} />
                        </div>
                        <h3 className="text-xl font-black font-title text-slate-900 tracking-tight">Personal Attendance Logs</h3>
                    </div>
                    <button className="text-brand-blue font-bold text-sm hover:underline">Download Report</button>
                </div>

                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest px-4">Date</th>
                                <th className="pb-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest px-4">Check In</th>
                                <th className="pb-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest px-4">Check Out</th>
                                <th className="pb-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest px-4">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-slate-400">
                                        <Clock size={48} className="mx-auto mb-4 opacity-10" />
                                        <p className="font-bold">No history available yet.</p>
                                    </td>
                                </tr>
                            ) : history.map((log, idx) => (
                                <tr key={idx} className="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-6 px-4">
                                        <span className="text-sm font-black text-slate-900">{new Date(log.date).toLocaleDateString()}</span>
                                    </td>
                                    <td className="py-6 px-4 uppercase tracking-tighter">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-sm font-bold text-slate-600">{new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 uppercase tracking-tighter">
                                        {log.check_out ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                <span className="text-sm font-bold text-slate-600 font-title">{new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-black text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-lg">Active Session</span>
                                        )}
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <span className="text-sm font-black text-slate-900">{log.working_hours} h</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {history.length > 5 && (
                    <div className="mt-8 pt-8 border-t border-slate-50 flex justify-center">
                        <button className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-brand-blue transition-colors">
                            View Older High Records <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
