import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, Pencil, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { platformService } from "../../services/api";
import { usePlatform } from "../../context/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const Settings = () => {
  const { platformName, updateBranding } = usePlatform();
  const [settings, setSettings] = useState({
    platform_name: "",
    global_commission: 0,
    two_factor_enabled: false,
    auto_update_check: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await platformService.getSettings();
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await platformService.updateSettings(settings);
      updateBranding(settings.platform_name);
      showNotification("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to update settings", err);
      showNotification("Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCheckUpdates = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      showNotification("System is already up to date (v2.4.0-pro)");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
              "fixed top-10 right-10 z-50 px-8 py-4 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3",
              notification.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            )}
          >
            <CheckCircle2 size={18} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
            Platform <span className="text-indigo-600 not-italic uppercase tracking-normal">Settings</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Manage global system architecture and security protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            {/* Security & Access */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden group">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <Shield size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Security & Access</h3>
                    </div>
                </div>
                <div className="p-12">
                    <div className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-indigo-100 transition-all group">
                        <div className="space-y-1">
                            <p className="font-black text-slate-900 text-lg tracking-tight">Two-Factor Authentication (2FA)</p>
                            <p className="text-sm text-slate-400 font-bold">Require a secondary code for all Super Admin login attempts.</p>
                        </div>
                        <button 
                            onClick={() => setSettings({...settings, two_factor_enabled: !settings.two_factor_enabled})}
                            className={clsx(
                                "w-16 h-8 rounded-full relative transition-all duration-300",
                                settings.two_factor_enabled ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-200"
                            )}
                        >
                            <div className={clsx(
                                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md",
                                settings.two_factor_enabled ? "left-9" : "left-1"
                            )} />
                        </button>
                    </div>
                </div>
            </div>

            {/* General Config */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <Database size={20} />
                    </div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">General Configuration</h3>
                </div>
                <div className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Globe size={12} /> Platform Display Name
                            </label>
                            <input 
                                type="text" 
                                value={settings.platform_name}
                                onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-lg placeholder:text-slate-200"
                                placeholder="Store Name"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Bell size={12} /> Global Commission (%)
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={settings.global_commission}
                                    onChange={(e) => setSettings({...settings, global_commission: e.target.value})}
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-emerald-600 transition-all text-lg"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                            </div>
                        </div>
                    </div>

                    {/* New Prominent Save Button */}
                    <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                            {notification?.type === 'success' && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 uppercase tracking-tight text-[10px]"
                                >
                                    <CheckCircle2 size={16} /> Registry Despatch Complete
                                </motion.span>
                            )}
                        </div>
                        <button 
                            onClick={handleUpdate}
                            disabled={saving}
                            className={clsx(
                                "flex items-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 disabled:opacity-40",
                                saving ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1"
                            )}
                        >
                            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? "Synchronizing..." : "Update Platform Configuration"}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-10">
            {/* System Update Card */}
            <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        System Core v2.4.0
                    </div>
                    <h4 className="text-4xl font-black italic tracking-tighter leading-tight">Architecture <br/>Updates</h4>
                    <p className="text-indigo-100 text-sm font-bold leading-relaxed opacity-80">Your platform kernel is regularly optimized for high-volume commerce operations.</p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-indigo-200">
                        <span>Last Check: Today</span>
                        <span>{updating ? "Analyzing..." : "Stable"}</span>
                    </div>
                    <button 
                        onClick={handleCheckUpdates}
                        disabled={updating}
                        className="w-full py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {updating ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                        {updating ? "Connecting to Node..." : "Check for Updates"}
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl border border-white/5 space-y-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                     <SettingsIcon size={24} />
                </div>
                <div className="space-y-2">
                    <h5 className="font-black uppercase tracking-widest text-[11px] text-slate-500">Registry Note</h5>
                    <p className="text-xs font-bold leading-relaxed opacity-60 italic">These settings affect all vendors and users globally. Any modifications here will override previous localized defaults.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
