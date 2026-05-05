import React, { useState, useEffect } from "react";
import { X, DollarSign, Bike, Save } from "lucide-react";
import { adminService } from "../../../services/api";

const SalaryConfigModal = ({ isOpen, onClose, rider, onSuccess }) => {
    const [perDelivery, setPerDelivery] = useState(40);
    const [baseSalary, setBaseSalary] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (rider && rider.wallet) {
            // Ideally we'd fetch the current config
            // For now we'll just set defaults or use what's in rider object if available
            // Let's assume the rider object has it via serializer update later or just use defaults
            setPerDelivery(rider.salary_config?.per_delivery_commission || 40);
            setBaseSalary(rider.salary_config?.monthly_fixed_salary || 0);
        }
    }, [rider, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await adminService.updateRiderSalaryConfig(rider.id, {
                per_delivery_commission: perDelivery,
                monthly_fixed_salary: baseSalary
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update configuration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-slate-800 tracking-tight italic uppercase">Salary <span className="text-emerald-600 not-italic uppercase tracking-normal">Configuration</span></h3>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Per Delivery Commission (₹)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                            <input 
                                type="number" 
                                required
                                value={perDelivery}
                                onChange={(e) => setPerDelivery(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                placeholder="e.g. 40"
                            />
                        </div>
                        <p className="text-[9px] text-slate-400 px-1 italic">Rider earns this amount for every successful delivery.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Monthly Base Salary (₹)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                            <input 
                                type="number" 
                                value={baseSalary}
                                onChange={(e) => setBaseSalary(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                placeholder="e.g. 15000"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-medium text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? "Updating..." : <><Save size={18} /> Save Configuration</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryConfigModal;
