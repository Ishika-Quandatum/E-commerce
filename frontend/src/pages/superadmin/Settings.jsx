import React, { useState, useEffect } from "react";
import { Bell, Globe, Database, Pencil, Save, CheckCircle2, RefreshCw, Phone, Mail, Camera, MessageCircle, Briefcase, Coins, Percent, CreditCard, Wallet, Banknote, Languages, Clock, ArrowRight } from "lucide-react";
import { platformService } from "../../services/api";
import { usePlatform } from "../../context/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const Settings = () => {
  const { platformName, updateBranding, refreshSettings } = usePlatform();
  const [settings, setSettings] = useState({
    platform_name: "",
    global_commission: 0,
    two_factor_enabled: false,
    auto_update_check: true,
    support_phone: "",
    support_email: "",
    facebook_link: "",
    instagram_link: "",
    twitter_link: "",
    linkedin_link: "",
    store_address: "123, Market Street, Surat, Gujarat, India",
    currency: "INR",
    language: "English",
    timezone: "Asia/Kolkata",
    tax_type: "GST",
    default_tax: 18,
    tax_included: false,
    payment_razorpay: true,
    payment_paypal: false,
    payment_cod: true,
    payment_wallet: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

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

  const validateSettings = () => {
    if (settings.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.support_email)) {
      showNotification("Invalid support email address.", "error");
      return false;
    }
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (settings.facebook_link && !urlPattern.test(settings.facebook_link)) {
      showNotification("Invalid Facebook link.", "error");
      return false;
    }
    if (settings.instagram_link && !urlPattern.test(settings.instagram_link)) {
      showNotification("Invalid Instagram link.", "error");
      return false;
    }
    if (settings.twitter_link && !urlPattern.test(settings.twitter_link)) {
      showNotification("Invalid Twitter/X link.", "error");
      return false;
    }
    if (settings.linkedin_link && !urlPattern.test(settings.linkedin_link)) {
      showNotification("Invalid LinkedIn link.", "error");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateSettings()) return;
    setSaving(true);
    try {
      await platformService.updateSettings(settings);
      updateBranding(settings.platform_name);
      await refreshSettings();
      showNotification("Settings updated successfully!");
    } catch (err) {
      console.error("Failed to update settings", err);
      let errorMsg = "Failed to update settings.";
      
      if (err.response?.data?.details) {
        const details = err.response.data.details;
        const firstField = Object.keys(details)[0];
        const firstError = Array.isArray(details[firstField]) ? details[firstField][0] : details[firstField];
        errorMsg = `${firstField}: ${firstError}`;
      } else {
        errorMsg = err.response?.data?.message || err.response?.data?.error || errorMsg;
      }
      
      showNotification(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };



  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={clsx(
              "fixed top-6 right-10 z-50 px-8 py-3 rounded-2xl shadow-2xl font-medium text-xs uppercase tracking-widest flex items-center gap-3",
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
          <h1 className="text-4xl font-medium text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
            Platform <span className="text-indigo-600 not-italic uppercase tracking-normal">Settings</span>
          </h1>
          <p className="text-slate-500 font-normal text-lg">Manage global system architecture and security protocols.</p>
        </div>
      </div>



            {/* Store Information */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <Database size={20} />
                    </div>
                    <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">Store Information</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-3">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Store Name</label>
                            <input 
                                type="text" 
                                value={settings.platform_name}
                                onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                                placeholder="Store Name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Store Email</label>
                            <input 
                                type="email" 
                                value={settings.support_email}
                                onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                                placeholder="support@example.com"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Store Phone</label>
                            <input 
                                type="text" 
                                value={settings.support_phone}
                                onChange={(e) => setSettings({...settings, support_phone: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">Store Address</label>
                            <textarea 
                                rows={3}
                                value={settings.store_address}
                                onChange={(e) => setSettings({...settings, store_address: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm resize-none"
                                placeholder="Enter full store address"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 border-t border-slate-50">
                        <button onClick={handleUpdate} className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                             <Save size={14} /> Save Store Information
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Presence */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                         <MessageCircle size={20} />
                    </div>
                    <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">Social Presence & Links</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]"><Globe size={12} /> Facebook Link</label>
                            <input type="text" value={settings.facebook_link} onChange={(e) => setSettings({...settings, facebook_link: e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-rose-600 transition-all text-sm" placeholder="https://facebook.com/yourpage" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]"><Camera size={12} /> Instagram Link</label>
                            <input type="text" value={settings.instagram_link} onChange={(e) => setSettings({...settings, instagram_link: e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-rose-600 transition-all text-sm" placeholder="https://instagram.com/yourprofile" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]"><MessageCircle size={12} /> Twitter/X Link</label>
                            <input type="text" value={settings.twitter_link} onChange={(e) => setSettings({...settings, twitter_link: e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-rose-600 transition-all text-sm" placeholder="https://twitter.com/yourhandle" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]"><Briefcase size={12} /> LinkedIn Link</label>
                            <input type="text" value={settings.linkedin_link} onChange={(e) => setSettings({...settings, linkedin_link: e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-rose-600 transition-all text-sm" placeholder="https://linkedin.com/company/yourpage" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 border-t border-slate-50">
                        <button onClick={handleUpdate} className="flex items-center gap-3 px-8 py-3 bg-rose-600 text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                             <Save size={14} /> Save Presence Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* General Configuration */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <Database size={20} />
                    </div>
                    <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">General Configuration</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
                                <Bell size={12} /> Global Commission (%)
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={settings.global_commission}
                                    onChange={(e) => setSettings({...settings, global_commission: e.target.value})}
                                    className="w-full px-8 py-3 bg-slate-50 border border-slate-100 rounded-3xl font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-emerald-600 transition-all text-sm"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-medium text-slate-300">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-50">
                        <button 
                            onClick={handleUpdate}
                            disabled={saving}
                            className={clsx(
                                "flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-3xl font-medium text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-40",
                                saving ? "bg-slate-100 text-slate-400" : ""
                            )}
                        >
                            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? "Updating..." : "Update Platform Configuration"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency & Locale */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                             <Languages size={20} />
                        </div>
                        <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">Currency & Locale</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Coins size={12} /> Currency
                            </label>
                            <select 
                                value={settings.currency}
                                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Globe size={12} /> Language
                            </label>
                            <select 
                                value={settings.language}
                                onChange={(e) => setSettings({...settings, language: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock size={12} /> Timezone
                            </label>
                            <select 
                                value={settings.timezone}
                                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="Asia/Kolkata">(GMT +05:30) Asia/Kolkata</option>
                                <option value="UTC">(GMT +00:00) UTC</option>
                                <option value="America/New_York">(GMT -05:00) New York</option>
                                <option value="Europe/London">(GMT +00:00) London</option>
                            </select>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={handleUpdate}
                                className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={14} /> Save Locale Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                             <Percent size={20} />
                        </div>
                        <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">Tax Settings</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Database size={12} /> Tax Type
                            </label>
                            <select 
                                value={settings.tax_type}
                                onChange={(e) => setSettings({...settings, tax_type: e.target.value})}
                                className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="GST">GST</option>
                                <option value="VAT">VAT</option>
                                <option value="Sales Tax">Sales Tax</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Percent size={12} /> Default Tax (%)
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={settings.default_tax}
                                    onChange={(e) => setSettings({...settings, default_tax: e.target.value})}
                                    className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600 transition-all text-sm"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="space-y-1">
                                <p className="font-medium text-slate-900 text-sm">Tax Included in Price</p>
                                <p className="text-[10px] text-slate-400 font-normal">Include tax in product display price</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, tax_included: !settings.tax_included})}
                                className={clsx(
                                    "w-12 h-6 rounded-full relative transition-all duration-300",
                                    settings.tax_included ? "bg-indigo-600" : "bg-slate-200"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                    settings.tax_included ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={handleUpdate}
                                className="w-full py-3 bg-violet-600 text-white rounded-2xl font-medium text-[10px] uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={14} /> Save Tax Configuration
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 uppercase tracking-widest text-[11px]">Payment Settings</h3>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">Manage payment methods and gateways</p>
                        </div>
                    </div>

                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { id: 'payment_razorpay', name: 'Razorpay', desc: 'Enable Razorpay payments', icon: <Banknote size={20} />, color: 'bg-indigo-50 text-indigo-600' },
                            { id: 'payment_paypal', name: 'PayPal', desc: 'Enable PayPal payments', icon: <CreditCard size={20} />, color: 'bg-blue-50 text-blue-600' },
                            { id: 'payment_cod', name: 'Cash on Delivery', desc: 'Enable COD payments', icon: <Coins size={20} />, color: 'bg-emerald-50 text-emerald-600' },
                            { id: 'payment_wallet', name: 'Wallet', desc: 'Enable customer wallet', icon: <Wallet size={20} />, color: 'bg-amber-50 text-amber-600' },
                        ].map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:border-indigo-100 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", method.color)}>
                                        {method.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900 text-lg tracking-tight">{method.name}</p>
                                        <p className="text-xs text-slate-400 font-normal">{method.desc}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSettings({...settings, [method.id]: !settings[method.id]})}
                                    className={clsx(
                                        "w-16 h-8 rounded-full relative transition-all duration-300",
                                        settings[method.id] ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-200"
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md",
                                        settings[method.id] ? "left-9" : "left-1"
                                    )} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-8 pt-6 border-t border-slate-50">
                        <button 
                            onClick={handleUpdate}
                            className="flex items-center gap-3 px-10 py-3.5 bg-slate-900 text-white rounded-[1.5rem] font-medium text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <Save size={16} /> Update Payment Configuration
                        </button>
                    </div>
                </div>
            </div>

    </div>
  );
};

export default Settings;
