import React, { useState } from "react";
import { X, Gift, Send, Info } from "lucide-react";
import { adminService } from "../../../services/api";

const ManualBonusModal = ({ isOpen, onClose, rider, onSuccess }) => {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await adminService.addRiderBonus(rider.id, {
                amount: amount,
                reason: reason || "Manual Performance Bonus"
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add bonus");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Gift size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-slate-800 tracking-tight italic uppercase">Award <span className="text-indigo-600 not-italic uppercase tracking-normal">Bonus</span></h3>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Rider: {rider?.user?.first_name} {rider?.user?.last_name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs rounded-2xl border border-rose-100 italic font-medium">{error}</div>}
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Bonus Amount (₹)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                            <input 
                                type="number" 
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="e.g. 500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Reason / Description</label>
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                            placeholder="e.g. Good performance during holiday rush..."
                        />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-indigo-600/70 leading-relaxed font-medium">This bonus will be added to the rider's current balance immediately and logged in their financial history.</p>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-medium text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : <><Send size={18} /> Send Bonus Now</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualBonusModal;
