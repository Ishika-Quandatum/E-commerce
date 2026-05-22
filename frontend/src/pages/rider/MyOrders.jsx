import React, { useState, useEffect } from "react";
import {
  Phone, MapPin, Clock, ChevronRight, CheckCircle2, Package, Truck,
  XCircle, Search, ExternalLink, LayoutGrid, List, IndianRupee,
  Navigation, TrendingUp, AlertTriangle, Zap, Route, Store, ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, riderService, trackingService } from "../../services/api";
import clsx from "clsx";

/* ── Earnings Breakdown Panel ─────────────────────────────────────────── */
const EarningsBreakdown = ({ earning }) => {
  if (!earning || typeof earning !== "object") return null;
  const { total=0, base_pay=0, distance_km=0, distance_allowance=0, petrol_rate=10, bonus_incentive=0, penalty_risk=0 } = earning;
  const hasDistance = distance_km > 0;
  return (
    <div className="mx-6 mb-4 rounded-2xl overflow-hidden border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <IndianRupee size={14} className="text-violet-200" />
          <span className="text-[11px] font-black text-white uppercase tracking-widest">Estimated Earnings</span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-white/70 text-xs">₹</span>
          <span className="text-white font-black text-xl leading-none">{total.toFixed(0)}</span>
        </div>
      </div>
      {hasDistance && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
          <Route size={13} className="text-violet-500" />
          <span className="text-[11px] font-bold text-violet-700">Vendor → Customer: <span className="text-violet-900 font-black">{distance_km} KM</span></span>
        </div>
      )}
      <div className="px-4 py-3 space-y-2">
        {[
          { label: "Base Pay", value: `₹${base_pay.toFixed(0)}`, dot: "bg-blue-400", cls: "text-slate-800" },
          { label: `Distance Allowance${hasDistance ? ` (${distance_km}km × ₹${petrol_rate})` : ""}`, value: `₹${distance_allowance.toFixed(0)}`, dot: "bg-emerald-400", cls: "text-emerald-700" },
          { label: "Bonus Incentive", value: bonus_incentive > 0 ? `₹${bonus_incentive.toFixed(0)}` : "₹0", dot: bonus_incentive > 0 ? "bg-amber-400" : "bg-slate-200", cls: bonus_incentive > 0 ? "text-amber-600" : "text-slate-400" },
          { label: "Penalty Risk", value: penalty_risk > 0 ? `-₹${penalty_risk.toFixed(0)}` : "₹0", dot: penalty_risk > 0 ? "bg-red-400" : "bg-slate-200", cls: penalty_risk > 0 ? "text-red-600" : "text-slate-400" },
        ].map(({ label, value, dot, cls }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[11px] font-semibold text-slate-600">{label}</span>
            </div>
            <span className={`text-[12px] font-black ${cls}`}>{value}</span>
          </div>
        ))}
        <div className="pt-2 mt-1 border-t border-dashed border-violet-200 flex items-center justify-between">
          <span className="text-[11px] font-black text-violet-700 uppercase tracking-wider">Payout Estimate</span>
          <div className="flex items-center gap-1">
            <IndianRupee size={13} className="text-violet-600" />
            <span className="text-[16px] font-black text-violet-700 leading-none">{total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Final Earnings Badge ─────────────────────────────────────────────── */
const FinalEarningsBadge = ({ earning }) => {
  const total = typeof earning === "object" ? earning?.total : parseFloat(earning || 0);
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
      <TrendingUp size={13} className="text-emerald-600" />
      <span className="text-[11px] font-black text-emerald-700">Final: ₹{parseFloat(total || 0).toFixed(0)}</span>
    </div>
  );
};

/* ── Status Badge ─────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  "Dispatch Queue":   "bg-amber-50 text-amber-700 border-amber-200",
  "Assigned":         "bg-blue-50 text-blue-700 border-blue-200",
  "Arrived at Vendor":"bg-orange-50 text-orange-700 border-orange-200",
  "Picked Up":        "bg-purple-50 text-purple-700 border-purple-200",
  "In Transit":       "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Delivered":        "bg-green-50 text-green-700 border-green-200",
};

const StatusBadge = ({ status }) => (
  <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200")}>
    {status}
  </span>
);

/* ── Action Buttons per workflow state ───────────────────────────────── */
const ActionButtons = ({ order, activeTab, onAction, loading }) => {
  const s = order.status;

  // ── NEW TASKS ──────────────────────────────────────────────────────────
  if (activeTab === "New") return (
    <div className="flex gap-3">
      <button onClick={() => onAction(order.id, "Rejected")}
        className="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
        <XCircle size={18} /> Decline
      </button>
      <button onClick={() => onAction(order.id, "Assigned")} disabled={loading}
        className="flex-[2] bg-brand-purple text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
        <Package size={18} /> Accept Delivery
      </button>
    </div>
  );

  // ── ASSIGNED tab: Assigned → Arrived at Vendor → Picked Up ────────────
  if (activeTab === "Assigned") {
    if (s === "Assigned") return (
      <button onClick={() => onAction(order.id, "Arrived at Vendor")} disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
        <Store size={18} /> Reached Shop
      </button>
    );
    if (s === "Arrived at Vendor") return (
      <button onClick={() => onAction(order.id, "Picked Up")} disabled={loading}
        className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
        <ShoppingBag size={18} /> Picked Up Parcel
      </button>
    );
  }

  // ── IN TRANSIT tab: Picked Up / In Transit → Out for Delivery → Delivered
  if (activeTab === "In Transit") {
    if (["Picked Up", "In Transit"].includes(s)) return (
      <button onClick={() => onAction(order.id, "Out for Delivery")} disabled={loading}
        className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
        <Navigation size={18} /> Start Delivery
      </button>
    );
    if (s === "Out for Delivery") return (
      <button onClick={() => onAction(order.id, "Delivered")} disabled={loading}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
        <CheckCircle2 size={18} /> Mark Delivered
      </button>
    );
  }

  // ── COMPLETED ──────────────────────────────────────────────────────────
  if (activeTab === "Delivered") return (
    <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-bold text-sm">
      <CheckCircle2 size={18} /> Successfully Delivered
    </div>
  );

  return null;
};

/* ── Step Progress Indicator (Assigned tab only) ─────────────────────── */
const AssignedProgress = ({ status }) => {
  const steps = [
    { key: "Assigned",          label: "Assigned" },
    { key: "Arrived at Vendor", label: "Reached Shop" },
    { key: "Picked Up",         label: "Picked Up" },
  ];
  const currentIdx = steps.findIndex(s => s.key === status);
  return (
    <div className="mx-6 mb-4 flex items-center gap-0">
      {steps.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
              idx < currentIdx  ? "bg-emerald-500 border-emerald-500 text-white" :
              idx === currentIdx ? "bg-white border-brand-purple text-brand-purple scale-110" :
              "bg-white border-slate-200 text-slate-400")}>
              {idx < currentIdx ? "✓" : idx + 1}
            </div>
            <span className={clsx("text-[9px] font-bold text-center leading-tight",
              idx <= currentIdx ? "text-slate-700" : "text-slate-400")}>{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={clsx("h-0.5 flex-1 mb-4 transition-all", idx < currentIdx ? "bg-emerald-400" : "bg-slate-200")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Out-for-Delivery indicator banner ───────────────────────────────── */
const OutForDeliveryBanner = () => (
  <div className="mx-6 mb-4 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span className="text-xs font-black text-emerald-700">Out for Delivery — Customer can now see your contact</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────── */
/*  Main MyOrders Component                                                */
/* ─────────────────────────────────────────────────────────────────────── */
const MyOrders = () => {
  const [activeTab, setActiveTab] = useState("Assigned");
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { id: "New",       label: "New Tasks",  icon: <Package size={16} /> },
    { id: "Assigned",  label: "Assigned",   icon: <Store size={16} /> },
    { id: "In Transit",label: "In Transit", icon: <Truck size={16} /> },
    { id: "Delivered", label: "Completed",  icon: <CheckCircle2 size={16} /> },
  ];

  // ── GPS tracking for active orders ──────────────────────────────────
  useEffect(() => {
    const activeOrders = (orders || []).filter(o =>
      ["Picked Up", "In Transit", "Out for Delivery", "Reached"].includes(o.status)
    );
    if (!activeOrders.length) return;
    const interval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
          for (const order of activeOrders) {
            try { await trackingService.updateRiderLocation(order.id, { latitude: coords.latitude, longitude: coords.longitude }); }
            catch {}
          }
        }, () => {}, { enableHighAccuracy: true });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => { fetchOrders(); }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "New") {
        res = await riderService.getOpenQueue();
      } else {
        res = await adminService.getRiderTasks();
      }
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    setActionLoading(true);
    try {
      if (newStatus === "Assigned") {
        await riderService.acceptShipment(id);
        setActiveTab("Assigned");
      } else if (newStatus === "Delivered") {
        await riderService.markDelivered(id);
        setActiveTab("Delivered");
      } else {
        await riderService.updateStatus(id, newStatus);
        // Auto-switch to correct tab
        if (newStatus === "Arrived at Vendor") {
          // stay on Assigned tab
        } else if (["Picked Up", "Out for Delivery"].includes(newStatus)) {
          setActiveTab("In Transit");
        }
      }
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const filterOrders = () => {
    const q = searchTerm.toLowerCase();
    const bySearch = (orders || []).filter(o =>
      !q ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.tracking_number?.toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
    if (activeTab === "New")       return bySearch.filter(o => ["Dispatch Queue", "Pending"].includes(o.status));
    if (activeTab === "Assigned")  return bySearch.filter(o => ["Assigned", "Arrived at Vendor"].includes(o.status));
    if (activeTab === "In Transit")return bySearch.filter(o => ["Picked Up", "In Transit", "Out for Delivery", "Reached"].includes(o.status));
    if (activeTab === "Delivered") return bySearch.filter(o => o.status === "Delivered");
    return [];
  };

  const filteredOrders = filterOrders();
  const getEarningTotal = (e) => !e ? 0 : typeof e === "object" ? e.total || 0 : parseFloat(e) || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-title">
          Delivery <span className="text-brand-purple">Tasks</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">Manage your active and completed deliveries.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-100 overflow-x-auto no-scrollbar max-w-2xl">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0",
              activeTab === tab.id
                ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-[1.02]"
                : "text-slate-500 hover:text-brand-purple hover:bg-slate-50"
            )}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between max-w-5xl">
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm w-full md:max-w-xl">
          <Search size={20} className="text-slate-300" />
          <input type="text" placeholder="Search by ID or customer..."
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm self-end md:self-auto">
          {[{ mode: "grid", Icon: LayoutGrid }, { mode: "list", Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={clsx("p-2.5 rounded-xl transition-all", viewMode === mode ? "bg-brand-purple text-white shadow-md" : "text-slate-400 hover:bg-slate-50")}>
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="bg-white h-64 rounded-[32px] animate-pulse border border-slate-100" />)
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Package size={64} className="mb-4 opacity-10" />
              <p className="font-bold text-lg text-slate-500">No orders found</p>
              <p className="text-sm">Try adjusting your search or check another tab.</p>
            </div>
          ) : filteredOrders.map((order) => (
            <motion.div key={order.id} layout
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
              className={clsx(
                "bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex overflow-hidden group",
                viewMode === "grid" ? "flex-col" : "flex-col md:flex-row items-stretch"
              )}>

              {/* ── Card Header ──────────────────────────────────────────── */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-purple text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-brand-purple/20">ID</div>
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    #{order.tracking_number?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {activeTab === "Delivered" ? (
                    <FinalEarningsBadge earning={order.estimated_earning} />
                  ) : (
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {["Assigned","New"].includes(activeTab) ? "Est. Earn" : "Earning"}
                      </div>
                      <div className="text-lg font-black text-emerald-600 leading-none">
                        ₹{getEarningTotal(order.estimated_earning).toFixed(0)}
                      </div>
                    </div>
                  )}
                  <div className="w-px h-8 bg-slate-200" />
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* ── Earnings Breakdown (New + Assigned) ──────────────────── */}
              {["New","Assigned"].includes(activeTab) && typeof order.estimated_earning === "object" && (
                <EarningsBreakdown earning={order.estimated_earning} />
              )}

              {/* ── Assigned step progress ────────────────────────────────── */}
              {activeTab === "Assigned" && (
                <AssignedProgress status={order.status} />
              )}

              {/* ── Out-for-delivery banner ───────────────────────────────── */}
              {order.status === "Out for Delivery" && (
                <OutForDeliveryBanner />
              )}

              {/* ── Card Body: Vendor / Customer addresses ───────────────── */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative flex-1">
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-8 h-8">
                  <ChevronRight size={16} className="text-slate-300" />
                </div>

                {/* FROM: Vendor */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center"><Package size={16} /></div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">FROM: VENDOR</h4>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-brand-blue/30 transition-colors">
                    <h5 className="font-black text-slate-900 mb-1">{order.vendor_info?.shop_name || "Vendor Shop"}</h5>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3 leading-relaxed">
                      {order.vendor_info?.address || "Address not available"}
                    </p>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${order.vendor_info?.phone}`} className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 flex items-center gap-1.5">
                        <Phone size={12} /> Call Shop
                      </a>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.vendor_info?.lat},${order.vendor_info?.lng}`}
                        target="_blank" rel="noreferrer"
                        className="bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                        <ExternalLink size={12} /> Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* TO: Customer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><MapPin size={16} /></div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">TO: CUSTOMER</h4>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-emerald-500/30 transition-colors">
                    <h5 className="font-black text-slate-900 mb-1">{order.customer_info?.name || "Customer"}</h5>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3 leading-relaxed">
                      {order.customer_info?.address || "Address not available"}
                    </p>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${order.customer_info?.phone}`} className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[10px] font-bold border border-slate-200 flex items-center gap-1.5">
                        <Phone size={12} /> Call Customer
                      </a>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer_info?.lat},${order.customer_info?.lng}`}
                        target="_blank" rel="noreferrer"
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                        <ExternalLink size={12} /> Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ETA chip */}
              {activeTab === "Assigned" && order.estimated_minutes && (
                <div className="px-6 pb-3 -mt-2 flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500">
                    Est. delivery time: <span className="text-slate-700">{order.estimated_minutes} min</span>
                  </span>
                </div>
              )}

              {/* ── Card Footer: Action Buttons ───────────────────────────── */}
              <div className="p-6 bg-slate-50/30 border-t border-slate-50">
                <ActionButtons
                  order={order}
                  activeTab={activeTab}
                  onAction={handleAction}
                  loading={actionLoading}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyOrders;
