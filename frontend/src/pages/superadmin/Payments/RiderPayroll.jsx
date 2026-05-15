import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Wallet,
  Calendar,
  User,
  CheckCircle2,
  FileText,
  Plus,
  Clock,
  TrendingUp,
  X,
  Printer,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { payrollService } from "../../../services/api";
import clsx from "clsx";

const RiderPayroll = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRider, setSelectedRider] = useState(null);
  const [payrollModal, setPayrollModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
      method: "Bank Transfer",
      transactionId: "",
      notes: ""
  });

  const navigate = useNavigate();

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getPayrollStats();
      setRiders(res.data);
    } catch (err) {
      console.error("Failed to fetch rider payroll stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleRunPayroll = async (riderId) => {
    setProcessing(true);
    try {
      await payrollService.runPayroll(riderId);
      alert("Payroll generated successfully!");
      setPayrollModal(false);
      fetchRiders();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to run payroll");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentData.transactionId) {
        alert("Please enter a Transaction ID");
        return;
    }
    setProcessing(true);
    try {
      await payrollService.markPaid(selectedRider.settlement_id, {
          payment_method: paymentData.method,
          transaction_id: paymentData.transactionId,
          notes: paymentData.notes
      });
      alert("Payroll marked as paid!");
      setPaymentModal(false);
      fetchRiders();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to mark as paid");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRiders = riders.filter(r => 
    r.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
      totalPayout: riders.reduce((acc, curr) => acc + curr.net_payable, 0),
      paid: riders.filter(r => r.status === 'Paid').reduce((acc, curr) => acc + curr.net_payable, 0),
      pending: riders.filter(r => r.status === 'Pending').reduce((acc, curr) => acc + curr.net_payable, 0),
      incentives: riders.reduce((acc, curr) => acc + curr.incentive, 0)
  };

  if (loading && riders.length === 0) {
      return (
          <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/admin/payments")}
            className="w-14 h-14 bg-white border border-slate-200 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-4xl font-medium text-slate-900 tracking-tight font-title italic tracking-tighter">Rider <span className="text-brand-purple not-italic">Payroll</span></h1>
            <p className="text-slate-500 font-normal mt-1">Automated salary calculation and settlement system.</p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-4">Current Month Payout</p>
              <h4 className="text-3xl font-medium tracking-tighter text-slate-900">₹{stats.totalPayout.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-slate-400 uppercase">
                  <User size={12} /> {riders.length} Active Riders
              </div>
          </div>
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100/50 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-600/60 mb-4">Paid</p>
              <h4 className="text-3xl font-medium tracking-tighter text-emerald-700">₹{stats.paid.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-emerald-600/60 uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Successfully Settled
              </div>
          </div>
          <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100/50 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-600/60 mb-4">Pending</p>
              <h4 className="text-3xl font-medium tracking-tighter text-amber-700">₹{stats.pending.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-amber-600/60 uppercase tracking-widest">
                  <Clock size={12} /> Awaiting Run/Payment
              </div>
          </div>
          <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100/50 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600/60 mb-4">Incentives</p>
              <h4 className="text-3xl font-medium tracking-tighter text-indigo-700">₹{stats.incentives.toLocaleString()}</h4>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-normal text-indigo-600/60 uppercase tracking-widest">
                  <TrendingUp size={12} className="inline mr-1" /> Dynamic Bonuses
              </div>
          </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96 group focus-within:ring-2 focus-within:ring-brand-purple/20 transition-all">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search Rider..."
              className="bg-transparent border-none focus:ring-0 text-sm font-normal w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Rider</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Deliveries</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Earnings</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Incentive</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100">Net Payable</th>
                <th className="px-10 py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRiders.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-medium text-xs text-slate-500 uppercase">
                          {r.username[0]}
                       </div>
                       <div>
                          <div className="text-sm font-medium text-slate-900">{r.username}</div>
                          <div className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">ID: #{r.id}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="text-lg font-medium text-slate-900">{r.deliveries}</div>
                  </td>
                  <td className="px-10 py-8 text-sm font-medium text-slate-900">₹{r.earnings.toLocaleString()}</td>
                  <td className="px-10 py-8 text-sm font-medium text-emerald-600">+₹{r.incentive.toLocaleString()}</td>
                  <td className="px-10 py-8">
                    <div className="text-xl font-medium text-slate-900 tracking-tighter">₹{r.net_payable.toLocaleString()}</div>
                    <span className={clsx(
                        "text-[9px] font-bold uppercase tracking-widest",
                        r.status === 'Paid' ? "text-emerald-500" : "text-amber-500"
                    )}>{r.status}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {r.status === 'Pending' && !r.settlement_id && (
                            <button 
                                onClick={() => {
                                    setSelectedRider(r);
                                    setPayrollModal(true);
                                }}
                                className="bg-brand-purple text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-brand-purple/20"
                            >
                                Run Payroll
                            </button>
                        )}
                        {r.status === 'Pending' && r.settlement_id && (
                            <button 
                                onClick={() => {
                                    setSelectedRider(r);
                                    setPaymentModal(true);
                                }}
                                className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Mark Paid
                            </button>
                        )}
                        <button 
                            onClick={() => navigate(`/admin/payments/settlements?rider=${r.id}`)}
                            className="p-2 text-slate-400 hover:text-brand-purple transition-colors"
                            title="Generate Payslip"
                        >
                            <FileText size={20} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Payroll Modal */}
      {payrollModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden p-10 space-y-8">
                  <div className="flex items-center justify-between">
                      <div>
                          <h3 className="text-2xl font-medium text-slate-900 italic font-title tracking-tighter">Rider <span className="text-brand-purple not-italic">Payroll</span></h3>
                          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Review & Generate Settlement</p>
                      </div>
                      <button onClick={() => setPayrollModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                          <X size={20} className="text-slate-400" />
                      </button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                          <span className="text-sm text-slate-500">Rider Name</span>
                          <span className="text-sm font-medium text-slate-900">{selectedRider?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                          <span className="text-sm text-slate-500">Deliveries</span>
                          <span className="text-sm font-medium text-slate-900">{selectedRider?.deliveries}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                          <span className="text-sm text-slate-500">Delivery Earnings</span>
                          <span className="text-sm font-medium text-slate-900">₹{selectedRider?.earnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50 text-emerald-600">
                          <span className="text-sm">Incentives</span>
                          <span className="text-sm font-bold">+ ₹{selectedRider?.incentive.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50 text-indigo-600">
                          <span className="text-sm">Petrol Allowance</span>
                          <span className="text-sm font-bold">+ ₹{selectedRider?.petrol_allowance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50 text-rose-500">
                          <span className="text-sm">Penalties</span>
                          <span className="text-sm font-bold">- ₹{selectedRider?.penalties.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-6 text-slate-900">
                          <span className="text-lg font-bold uppercase tracking-widest">Net Payable</span>
                          <span className="text-3xl font-bold tracking-tighter">₹{selectedRider?.net_payable.toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setPayrollModal(false)}
                        className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleRunPayroll(selectedRider.id)}
                        disabled={processing}
                        className="flex-1 px-8 py-4 bg-brand-purple text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-brand-purple/20 disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Generate Settlement"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Mark Paid Modal */}
      {paymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden p-10 space-y-8">
                  <div className="flex items-center justify-between">
                      <div>
                          <h3 className="text-2xl font-medium text-slate-900 italic font-title tracking-tighter">Mark <span className="text-emerald-500 not-italic">As Paid</span></h3>
                          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Finalize Rider Settlement</p>
                      </div>
                      <button onClick={() => setPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                          <X size={20} className="text-slate-400" />
                      </button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                          <span className="text-sm text-slate-500 font-medium">Net Payable</span>
                          <span className="text-3xl font-bold text-slate-900 tracking-tighter">₹{selectedRider?.net_payable.toLocaleString()}</span>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Payment Method</label>
                          <select 
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20"
                            value={paymentData.method}
                            onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                          >
                              <option>Bank Transfer</option>
                              <option>UPI</option>
                              <option>Cash</option>
                          </select>
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Transaction ID</label>
                          <input 
                            type="text"
                            placeholder="Enter Transaction Ref #"
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20"
                            value={paymentData.transactionId}
                            onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                          />
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Admin Notes (Optional)</label>
                          <textarea 
                            placeholder="Add internal notes..."
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none"
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setPaymentModal(false)}
                        className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleMarkPaid}
                        disabled={processing}
                        className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Confirm Payment"}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RiderPayroll;
