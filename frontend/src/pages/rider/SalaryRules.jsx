import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bike, Trophy, AlertTriangle, Fuel, History, Download, CreditCard, 
  CheckCircle, ChevronRight, Calculator, IndianRupee, Activity, Calendar
} from "lucide-react";
import { riderService } from "../../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalaryRules = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaryRules();
  }, []);

  const fetchSalaryRules = async () => {
    try {
      setLoading(true);
      const res = await riderService.getSalaryRules();
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch salary rules:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold">Loading Salary Rules...</p>
        </div>
      </div>
    );
  }

  const { rules, stats } = data;

  // Calculate incentive progress
  let nextTarget = null;
  let prevTarget = 0;
  
  if (rules.bonus_slabs.length > 0) {
    for (let slab of rules.bonus_slabs) {
      if (stats.deliveries_today < slab.min_deliveries) {
        nextTarget = slab;
        break;
      }
      prevTarget = slab.min_deliveries;
    }
  }

  const progressPercentage = nextTarget 
    ? Math.min(100, Math.max(0, ((stats.deliveries_today - prevTarget) / (nextTarget.min_deliveries - prevTarget)) * 100))
    : 100;

  // Mock history data for chart
  const historyData = [
    { name: 'Mon', earnings: 400 },
    { name: 'Tue', earnings: 600 },
    { name: 'Wed', earnings: 450 },
    { name: 'Thu', earnings: 700 },
    { name: 'Fri', earnings: parseInt(stats.earnings_today) || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple to-indigo-600 text-white px-6 py-12 pb-24 rounded-b-[3rem] shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Salary Rules & Earnings</h1>
          <p className="text-indigo-100 font-medium opacity-90">
            Real-time breakdown of your performance, incentives, and payout rules.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 space-y-8">
        
        {/* SECTION 1: Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <SummaryCard 
            icon={<Bike size={20} className="text-blue-500" />}
            title="Base Pay"
            value={`₹${rules.rider_base_pay}`}
            subtitle="Per Delivery"
            color="bg-blue-50"
          />
          <SummaryCard 
            icon={<Activity size={20} className="text-emerald-500" />}
            title="Deliveries"
            value={stats.deliveries_today}
            subtitle="Completed Today"
            color="bg-emerald-50"
          />
          <SummaryCard 
            icon={<IndianRupee size={20} className="text-green-600" />}
            title="Earnings"
            value={`₹${stats.earnings_today}`}
            subtitle="Earned Today"
            color="bg-green-100 border-green-200 shadow-green-100"
            highlight
          />
          <SummaryCard 
            icon={<CreditCard size={20} className="text-purple-500" />}
            title="Pending"
            value={`₹${stats.pending_settlement}`}
            subtitle="Next Payout"
            color="bg-purple-50"
          />
          <SummaryCard 
            icon={<Trophy size={20} className="text-amber-500" />}
            title="Incentive"
            value={`${stats.deliveries_today}${nextTarget ? `/${nextTarget.min_deliveries}` : '+'}`}
            subtitle="Deliveries"
            color="bg-amber-50"
          />
          <SummaryCard 
            icon={<AlertTriangle size={20} className="text-rose-500" />}
            title="Penalties"
            value="-₹0"
            subtitle="Deducted Today"
            color="bg-rose-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 3: Incentive Rules */}
            <SectionCard title="Incentive Targets" icon={<Trophy size={18} className="text-amber-500" />}>
              <div className="space-y-6">
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Current Progress</p>
                      <h4 className="text-lg font-black text-slate-900 mt-1">
                        {stats.deliveries_today} Deliveries
                      </h4>
                    </div>
                    {nextTarget ? (
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">Next Target</p>
                        <p className="text-sm font-bold text-amber-600">{nextTarget.min_deliveries} Orders (₹{nextTarget.bonus_amount} Bonus)</p>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">All targets met!</span>
                    )}
                  </div>
                  
                  {nextTarget && (
                    <div className="h-3 w-full bg-amber-100/50 rounded-full overflow-hidden mt-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rules.bonus_slabs.map((slab, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${stats.deliveries_today >= slab.min_deliveries ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'} transition-all`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-500 uppercase">Target {idx + 1}</span>
                        {stats.deliveries_today >= slab.min_deliveries && <CheckCircle size={14} className="text-amber-500" />}
                      </div>
                      <div className="text-lg font-black text-slate-800">{slab.min_deliveries} <span className="text-xs font-semibold text-slate-400">Orders</span></div>
                      <div className="text-amber-600 font-black mt-1">+₹{slab.bonus_amount} Bonus</div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* SECTION 2 & 4: Pay Rules & Penalties in split view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SECTION 2: Per Delivery Pay Rules */}
              <SectionCard title="Vehicle Base Pay" icon={<Bike size={18} className="text-blue-500" />}>
                <div className="space-y-3">
                  {rules.vehicle_pay.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="font-bold text-slate-700">{v.vehicle_type}</div>
                      <div className="font-black text-brand-purple">₹{v.base_pay} / order</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* SECTION 4: Penalty Rules */}
              <SectionCard title="Penalty Deductions" icon={<AlertTriangle size={18} className="text-rose-500" />}>
                <div className="space-y-3">
                  {rules.penalties.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                      <div className="font-bold text-rose-900 text-sm">{p.penalty_name}</div>
                      <div className="font-black text-rose-600">-₹{p.deduction_amount}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* SECTION 5: Petrol & Distance Allowance */}
            <SectionCard title="Petrol Allowance" icon={<Fuel size={18} className="text-emerald-500" />}>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                    <Fuel size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-900">Allowance Calculator</h3>
                    <p className="text-xs font-semibold text-emerald-600/70">Extra pay for long distance deliveries</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Free Distance</div>
                    <div className="text-lg font-black text-slate-800">{rules.config.petrol_km_limit} KM</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Extra Rate</div>
                    <div className="text-lg font-black text-emerald-600">+₹{rules.config.petrol_rate_per_km} / KM</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-white/50 p-3 rounded-lg">
                  Example: An 8 KM delivery = 5 KM free + (3 KM × ₹{rules.config.petrol_rate_per_km}) = ₹{3 * rules.config.petrol_rate_per_km} extra
                </div>
              </div>
            </SectionCard>

            {/* SECTION 7: Earnings History */}
            <SectionCard title="Earnings History" icon={<History size={18} className="text-indigo-500" />}>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* SECTION 6: Live Earnings Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-brand-purple/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-bl-full -z-0"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center text-brand-purple">
                  <Calculator size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Today's Calculation</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Breakdown</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                  <span className="text-sm font-semibold text-slate-500">Base Pay ({stats.deliveries_today} × ₹{rules.rider_base_pay})</span>
                  <span className="font-bold text-slate-800">₹{stats.deliveries_today * rules.rider_base_pay}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                  <span className="text-sm font-semibold text-slate-500">Incentive Bonus</span>
                  <span className="font-bold text-emerald-500">+₹{stats.earnings_today - (stats.deliveries_today * rules.rider_base_pay)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                  <span className="text-sm font-semibold text-slate-500">Petrol Allowance</span>
                  <span className="font-bold text-emerald-500">+₹0</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-500">Penalties</span>
                  <span className="font-bold text-rose-500">-₹0</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-black text-slate-900 uppercase">Total Today</span>
                  <span className="text-3xl font-black text-brand-purple tracking-tight">₹{stats.earnings_today}</span>
                </div>
              </div>
            </div>

            {/* SECTION 9: Settlement Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                <Calendar size={18} className="text-brand-blue" /> Next Settlement
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-4 border-white bg-brand-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle size={12} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-xs">Calculated</div>
                      <time className="text-[10px] font-bold text-slate-500">Today</time>
                    </div>
                    <div className="text-slate-500 text-[10px] font-semibold">Earnings added to pending balance.</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-white border border-slate-100 shadow-sm opacity-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-xs">Approved</div>
                      <time className="text-[10px] font-bold text-slate-500">Every Monday</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 8: Download Payslip */}
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-slate-900/20">
              <Download size={18} />
              Download Last Payslip (PDF)
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value, subtitle, color, highlight }) => (
  <div className={`p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 ${color} ${highlight ? 'shadow-xl shadow-brand-purple/10 border-brand-purple/20' : 'bg-white shadow-sm'}`}>
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-xs font-semibold text-slate-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
      <div className="p-1.5 bg-slate-50 rounded-lg">
        {icon}
      </div>
      {title}
    </h2>
    {children}
  </div>
);

export default SalaryRules;
