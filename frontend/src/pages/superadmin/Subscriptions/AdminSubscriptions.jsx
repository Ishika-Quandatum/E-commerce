import React, { useEffect, useState } from "react";
import { BadgeCheck, Loader2, Plus, Power } from "lucide-react";
import { toast } from "react-hot-toast";
import { adminService } from "../../../services/api";

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", duration_days: 30, max_promotions: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const [plansResponse, subscriptionsResponse] = await Promise.all([
        adminService.getSubscriptionPlans(),
        adminService.getVendorSubscriptions(),
      ]);
      setPlans(plansResponse.data?.results || plansResponse.data || []);
      setSubscriptions(subscriptionsResponse.data?.results || subscriptionsResponse.data || []);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createPlan = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, max_promotions: form.max_promotions || null };
      if (editingId) {
        await adminService.updateSubscriptionPlan(editingId, payload);
      } else {
        await adminService.createSubscriptionPlan(payload);
      }
      setEditingId(null);
      setForm({ name: "", price: "", duration_days: 30, max_promotions: "", description: "" });
      toast.success(editingId ? "Plan updated" : "Plan created");
      load();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not create plan");
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand-purple" size={42} /></div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Home <span className="mx-2">›</span> Subscriptions</p><h1 className="text-4xl font-black text-brand-navy flex items-center gap-3 mt-3"><BadgeCheck className="text-brand-purple" /> Subscriptions</h1><p className="text-slate-500 font-bold mt-1">Manage plans and vendor access.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[
        ["Total Plans", plans.length],
        ["Subscribers", subscriptions.length],
        ["Active Subs", subscriptions.filter((item) => item.status === "ACTIVE").length],
      ].map(([label, value]) => <div key={label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p><p className="text-3xl font-black text-brand-navy mt-2">{value}</p></div>)}</div>
      <form onSubmit={createPlan} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
        <input required placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-2xl bg-slate-50 px-4 font-bold outline-none" />
        <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-12 rounded-2xl bg-slate-50 px-4 font-bold outline-none" />
        <input required type="number" min="1" placeholder="Duration days" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className="h-12 rounded-2xl bg-slate-50 px-4 font-bold outline-none" />
        <input type="number" min="0" placeholder="Promotion limit" value={form.max_promotions} onChange={(e) => setForm({ ...form, max_promotions: e.target.value })} className="h-12 rounded-2xl bg-slate-50 px-4 font-bold outline-none" />
        <button className="h-12 rounded-2xl bg-brand-purple text-white font-bold flex items-center justify-center gap-2"><Plus size={18} /> {editingId ? "Save Plan" : "Add Plan"}</button>
      </form>
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-x-auto">
        <h2 className="text-xl font-black text-brand-navy mb-4">Plans</h2>
        <table className="w-full text-left"><thead><tr className="text-xs uppercase tracking-widest text-slate-400"><th className="p-3">Plan</th><th className="p-3">Price</th><th className="p-3">Duration</th><th className="p-3">Features</th><th className="p-3">Status</th><th /></tr></thead><tbody>{plans.map((plan) => <tr key={plan.id} className="border-t border-slate-100"><td className="p-3 font-bold">{plan.name}</td><td className="p-3">₹{plan.price}</td><td className="p-3">{plan.duration_days} days</td><td className="p-3">{plan.description || `${plan.max_promotions ?? "Unlimited"} promotions`}</td><td className="p-3">{plan.is_active ? "Active" : "Inactive"}</td><td className="p-3 text-right space-x-3"><button onClick={() => { setEditingId(plan.id); setForm({ name: plan.name, price: plan.price, duration_days: plan.duration_days, max_promotions: plan.max_promotions ?? "", description: plan.description || "" }); }} className="text-brand-purple font-bold">Edit</button><button onClick={() => adminService.toggleSubscriptionPlan(plan.id).then(load)} className="text-brand-purple"><Power size={18} /></button></td></tr>)}</tbody></table>
      </section>
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-x-auto">
        <h2 className="text-xl font-black text-brand-navy mb-4">Vendor Subscriptions</h2>
        <table className="w-full text-left"><thead><tr className="text-xs uppercase tracking-widest text-slate-400"><th className="p-3">Vendor</th><th className="p-3">Plan</th><th className="p-3">Start</th><th className="p-3">End</th><th className="p-3">Status</th><th className="p-3">Usage</th></tr></thead><tbody>{subscriptions.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="p-3 font-bold">{item.vendor_name || item.vendor_email}</td><td className="p-3">{item.plan?.name}</td><td className="p-3">{item.start_date ? new Date(item.start_date).toLocaleDateString() : "—"}</td><td className="p-3">{item.end_date ? new Date(item.end_date).toLocaleDateString() : "—"}</td><td className="p-3">{item.status}</td><td className="p-3">{item.promotion_count} / {item.plan?.max_promotions ?? "∞"}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
};

export default AdminSubscriptions;
