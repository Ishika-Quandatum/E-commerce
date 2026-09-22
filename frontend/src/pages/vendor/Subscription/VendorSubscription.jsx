import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { vendorService } from "../../../services/api";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;

const promotionLabel = (plan) =>
  plan.max_promotions == null ? "Unlimited promotions" : `${plan.max_promotions} promotions`;

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;
  return fallback;
};

const VendorSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentState, setPaymentState] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const load = async () => {
    try {
      const [plansResponse, currentResponse, historyResponse] = await Promise.all([
        vendorService.getSubscriptionPlans(),
        vendorService.getCurrentSubscription(),
        vendorService.getSubscriptionHistory(),
      ]);
      setPlans(plansResponse.data?.results || plansResponse.data || []);
      setCurrent(currentResponse.data || null);
      setHistory(historyResponse.data?.results || historyResponse.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load subscription details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activePlanId = current?.plan?.id;
  const availablePlans = useMemo(
    () => plans.filter((plan) => plan.id !== activePlanId),
    [plans, activePlanId],
  );

  const openPayment = (plan, upgrade = false) => {
    setSelectedPlan(plan);
    setShowUpgrade(upgrade);
    setPaymentState(null);
    setPaymentMethod("card");
  };

  const closePayment = () => {
    if (submitting) return;
    setSelectedPlan(null);
    setPaymentState(null);
    setShowUpgrade(false);
  };

  const startPayment = async () => {
    if (!selectedPlan || submitting) return;
    setSubmitting(true);
    setPaymentState(null);
    try {
      const response = await vendorService.initiateSubscription(selectedPlan.id);
      setPaymentState({
        type: "pending",
        paymentId: response.data.payment_id,
        message: response.data.message,
      });
      await load();
    } catch (error) {
      setPaymentState({
        type: "error",
        message: getErrorMessage(error, "Subscription payment failed"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-purple" size={42} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          <span>Home</span><span className="mx-2">›</span><span>Subscription</span>
        </p>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-navy flex items-center gap-3">
            <BadgeCheck className="text-brand-purple" />
            Subscription
          </h1>
          <p className="text-brand-text-gray font-bold mt-1">Unlock promotion tools for your store.</p>
        </div>
      </div>

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Current Plan</p>
            {current ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black text-brand-navy">{current.plan?.name}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-600">
                    <CheckCircle2 size={14} /> Active
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {formatPrice(current.plan?.price)} / {current.plan?.duration_days} days
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <h2 className="text-2xl font-black text-brand-navy">No Active Subscription</h2>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  Choose a plan below to unlock promotion tools.
                </p>
              </div>
            )}
          </div>
          {current && (
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="rounded-xl border border-brand-purple px-5 py-3 text-sm font-black text-brand-purple hover:bg-brand-purple/5"
            >
              Upgrade Plan
            </button>
          )}
        </div>
        {current && (
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <SummaryItem label="Start Date" value={formatDate(current.start_date)} />
            <SummaryItem label="End Date" value={formatDate(current.end_date)} />
            <SummaryItem
              label="Promotion Usage"
              value={`${current.promotion_count || 0} / ${current.plan?.max_promotions == null ? "Unlimited" : current.plan.max_promotions}`}
            />
          </div>
        )}
      </section>

      <section>
        <SectionHeading label="Available Plans" />
        {plans.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={plan.id === activePlanId}
                disabled={Boolean(current)}
                onSelect={() => openPayment(plan, Boolean(current))}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No subscription plans are available right now." />
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <SectionHeading label="Payment History" />
        {history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] mt-5 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="p-3">#</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 text-sm">
                    <td className="p-3 text-slate-400">{index + 1}</td>
                    <td className="p-3 font-semibold">{formatDate(item.created_at)}</td>
                    <td className="p-3 font-black text-brand-navy">{item.plan?.name || "—"}</td>
                    <td className="p-3">{formatPrice(item.plan?.price)}</td>
                    <td className="p-3"><StatusBadge status={item.status} /></td>
                    <td className="p-3 text-slate-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No payment history yet." />
        )}
      </section>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          current={current}
          upgrade={showUpgrade}
          method={paymentMethod}
          setMethod={setPaymentMethod}
          state={paymentState}
          submitting={submitting}
          onClose={closePayment}
          onPay={startPayment}
        />
      )}
      {showUpgrade && !selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <ModalHeader title="Upgrade Plan" onClose={() => setShowUpgrade(false)} />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Select a plan to compare it with your current subscription.
            </p>
            <div className="mt-5 space-y-3">
              {availablePlans.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => openPayment(plan, true)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-brand-purple"
                >
                  <span className="font-black text-brand-navy">{plan.name}</span>
                  <span className="float-right font-black text-brand-purple">{formatPrice(plan.price)}</span>
                </button>
              ))}
            </div>
            {!availablePlans.length && <EmptyState message="No other active plans are available." />}
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 font-black text-brand-navy">{value}</p>
  </div>
);

const SectionHeading = ({ label }) => (
  <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</h2>
);

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
    {message}
  </div>
);

const PlanCard = ({ plan, current, disabled, onSelect }) => (
  <article className={`bg-white rounded-3xl p-6 border shadow-sm ${current ? "border-emerald-200" : "border-slate-100"}`}>
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-xl font-black text-brand-navy">{plan.name}</h3>
      {current && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-600">Current</span>}
    </div>
    <p className="mt-5 text-3xl font-black text-brand-purple">{formatPrice(plan.price)}</p>
    <p className="mt-1 text-sm font-bold text-slate-500">{plan.duration_days} days</p>
    <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
      <p className="flex items-center gap-2"><Check size={16} className="text-emerald-500" />{promotionLabel(plan)}</p>
      {plan.description && <p className="flex items-start gap-2"><Sparkles size={16} className="mt-0.5 text-brand-purple" />{plan.description}</p>}
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="mt-7 w-full rounded-xl bg-brand-purple py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
    >
      {current ? "Current Plan" : disabled ? "Active subscription exists" : "Subscribe"}
    </button>
  </article>
);

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toUpperCase();
  const active = normalized === "ACTIVE";
  const failed = ["FAILED", "CANCELLED", "EXPIRED"].includes(normalized);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${active ? "bg-emerald-50 text-emerald-600" : failed ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
      {active ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {status || "Pending"}
    </span>
  );
};

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-2xl font-black text-brand-navy">{title}</h2>
    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close">
      <X size={20} />
    </button>
  </div>
);

const PaymentModal = ({ plan, current, upgrade, method, setMethod, state, submitting, onClose, onPay }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 flex items-center justify-center">
    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
      <ModalHeader title={upgrade ? "Upgrade Plan" : "Complete Your Payment"} onClose={onClose} />
      {!state && (
        <>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex justify-between gap-4"><span className="font-bold text-slate-500">Plan</span><strong>{plan.name}</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span className="font-bold text-slate-500">Price</span><strong className="text-brand-purple">{formatPrice(plan.price)}</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span className="font-bold text-slate-500">Duration</span><strong>{plan.duration_days} days</strong></div>
          </div>
          {upgrade && current && (
            <p className="mt-4 text-sm font-bold text-slate-500">
              Current plan: {current.plan?.name}. The existing backend will verify eligibility before activation.
            </p>
          )}
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Method</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[["card", "Credit/Debit Card"], ["upi", "UPI"], ["netbanking", "Net Banking"]].map(([value, label]) => (
                <label key={value} className={`cursor-pointer rounded-xl border p-3 text-xs font-bold ${method === value ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-slate-200 text-slate-500"}`}>
                  <input type="radio" name="subscription-payment-method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-7 flex gap-3">
            <button type="button" onClick={onClose} disabled={submitting} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-black text-slate-600">Cancel</button>
            <button type="button" onClick={onPay} disabled={submitting} className="flex-1 rounded-xl bg-brand-purple py-3 text-sm font-black text-white disabled:opacity-60">
              {submitting ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing Payment...</span> : `Pay ${formatPrice(plan.price)}`}
            </button>
          </div>
        </>
      )}
      {state?.type === "pending" && (
        <div className="py-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-brand-purple" />
          <h3 className="mt-4 text-xl font-black text-brand-navy">Payment Initiated</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{state.message || "Complete payment in the configured gateway. The subscription activates after backend verification."}</p>
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-500">Payment ID: {state.paymentId}</p>
          <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-brand-purple px-6 py-3 text-sm font-black text-white">Close</button>
        </div>
      )}
      {state?.type === "error" && (
        <div className="py-8 text-center">
          <X size={48} className="mx-auto rounded-full bg-red-50 p-2 text-red-500" />
          <h3 className="mt-4 text-xl font-black text-brand-navy">Payment Failed</h3>
          <p className="mt-2 text-sm font-semibold text-red-500">{state.message}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-brand-purple px-6 py-3 text-sm font-black text-white">Try Again</button>
        </div>
      )}
    </div>
  </div>
);

export default VendorSubscription;
