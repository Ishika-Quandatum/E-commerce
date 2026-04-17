import React from "react";
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, Pencil } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
          Platform <span className="text-indigo-600 not-italic uppercase tracking-normal">Settings</span>
        </h1>
        <p className="text-slate-500 font-medium">Configure global platform parameters and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                    <Shield className="text-indigo-600" size={24} />
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Security & Access</h3>
                </div>
                <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-400">Add an extra layer of security to superadmin accounts.</p>
                        </div>
                        <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                    <Database className="text-emerald-600" size={24} />
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">General Config</h3>
                </div>
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Platform Name</label>
                            <input type="text" defaultValue="QuanStore" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Global Commission (%)</label>
                            <input type="number" defaultValue="10" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-2xl font-black italic tracking-tighter mb-4">System Update</h4>
                <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">Current Version: v2.4.0-pro. New updates are checked every 24 hours.</p>
                <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Check for Updates
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
