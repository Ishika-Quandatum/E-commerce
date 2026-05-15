import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Fuel,
  AlertCircle,
  CheckCircle2,
  Settings,
  Target,
  Zap,
  Info,
  Pencil,
  PlusCircle,
  Calculator,
  ShieldAlert,
  Wallet,
  X,
  Check,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { payrollService } from "../../../services/api";
import clsx from "clsx";

const PayrollSettings = () => {
  const [bonusRules, setBonusRules] = useState([]);
  const [penaltyRules, setPenaltyRules] = useState([]);
  const [config, setConfig] = useState({ petrol_km_limit: 5, petrol_rate_per_km: 3 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Create / Modal States
  const [showAddPenalty, setShowAddPenalty] = useState(false);
  const [newPenalty, setNewPenalty] = useState({ penalty_name: "", deduction_amount: "" });
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [newBonus, setNewBonus] = useState({ min_deliveries: "", bonus_amount: "" });

  // Edit States
  const [editingBonusId, setEditingBonusId] = useState(null);
  const [editBonusData, setEditBonusData] = useState({});
  const [editingPenaltyId, setEditingPenaltyId] = useState(null);
  const [editPenaltyData, setEditPenaltyData] = useState({});

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bonusRes, penaltyRes, configRes] = await Promise.all([
        payrollService.getBonusRules(),
        payrollService.getPenaltyRules(),
        payrollService.getConfig()
      ]);
      setBonusRules(bonusRes.data);
      setPenaltyRules(penaltyRes.data);
      setConfig(configRes.data);
    } catch (err) {
      console.error("Failed to fetch payroll data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateConfig = async () => {
    try {
      setSaving(true);
      await payrollService.updateConfig({
        petrol_km_limit: parseInt(config.petrol_km_limit),
        petrol_rate_per_km: parseFloat(config.petrol_rate_per_km)
      });
      alert("Petrol settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update petrol settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBonus = async () => {
    try {
      if (!newBonus.min_deliveries || !newBonus.bonus_amount) {
        alert("Please fill all fields");
        return;
      }
      const data = {
        min_deliveries: parseInt(newBonus.min_deliveries),
        bonus_amount: parseFloat(newBonus.bonus_amount),
        is_active: true
      };
      await payrollService.createBonusRule(data);
      setNewBonus({ min_deliveries: "", bonus_amount: "" });
      setShowAddBonus(false);
      fetchData();
    } catch (err) {
      alert(`Failed to add bonus rule: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleStartEditBonus = (rule) => {
    setEditingBonusId(rule.id);
    setEditBonusData({ ...rule });
  };

  const handleSaveEditBonus = async () => {
    try {
      const data = {
        min_deliveries: parseInt(editBonusData.min_deliveries),
        bonus_amount: parseFloat(editBonusData.bonus_amount),
        is_active: editBonusData.is_active
      };
      await payrollService.updateBonusRule(editingBonusId, data);
      setEditingBonusId(null);
      fetchData();
    } catch (err) {
      alert("Failed to update bonus rule");
    }
  };

  const handleAddPenalty = async () => {
    try {
      if (!newPenalty.penalty_name || !newPenalty.deduction_amount) {
        alert("Please fill all fields");
        return;
      }
      const data = {
        penalty_name: newPenalty.penalty_name,
        deduction_amount: parseFloat(newPenalty.deduction_amount),
        is_active: true
      };
      await payrollService.createPenaltyRule(data);
      setNewPenalty({ penalty_name: "", deduction_amount: "" });
      setShowAddPenalty(false);
      fetchData();
    } catch (err) {
      alert(`Failed to add penalty rule: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  };

  const handleStartEditPenalty = (rule) => {
    setEditingPenaltyId(rule.id);
    setEditPenaltyData({ ...rule });
  };

  const handleSaveEditPenalty = async () => {
    try {
      const data = {
        penalty_name: editPenaltyData.penalty_name,
        deduction_amount: parseFloat(editPenaltyData.deduction_amount),
        is_active: editPenaltyData.is_active
      };
      await payrollService.updatePenaltyRule(editingPenaltyId, data);
      setEditingPenaltyId(null);
      fetchData();
    } catch (err) {
      alert("Failed to update penalty rule");
    }
  };

  const handleDeleteBonus = async (id) => {
    if (!window.confirm("Delete this bonus rule?")) return;
    try {
      await payrollService.deleteBonusRule(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete bonus rule");
    }
  };

  const handleDeletePenalty = async (id) => {
    if (!window.confirm("Delete this penalty rule?")) return;
    try {
      await payrollService.deletePenaltyRule(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete penalty rule");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Compact Header */}
      <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payroll Settings</h1>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
             <span>Payments</span>
             <ChevronRight size={12} className="text-slate-300" />
             <span className="text-brand-purple">Payroll Settings</span>
          </div>
        </div>
        <button 
          onClick={() => alert("Settings saved successfully!")}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-purple text-white rounded-lg font-bold text-[13px] hover:bg-brand-purple/90 transition-all shadow-sm"
        >
          <Save size={16} /> Save Settings
        </button>
      </div>

      <div className="px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* 1. DELIVERY BONUS SETTINGS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-[13px] font-bold text-brand-purple uppercase tracking-wider">1. DELIVERY BONUS SETTINGS</h2>
              <p className="text-[11px] text-slate-400 mt-1">Set bonus amount based on rider completed deliveries.</p>
            </div>
            
            <div className="p-4">
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-3">Min Deliveries</th>
                      <th className="px-4 py-3">Bonus Amount (₹)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bonusRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {editingBonusId === rule.id ? (
                            <input 
                              type="number"
                              value={editBonusData.min_deliveries}
                              onChange={(e) => setEditBonusData({...editBonusData, min_deliveries: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-purple"
                            />
                          ) : rule.min_deliveries}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {editingBonusId === rule.id ? (
                            <input 
                              type="number"
                              value={editBonusData.bonus_amount}
                              onChange={(e) => setEditBonusData({...editBonusData, bonus_amount: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-purple"
                            />
                          ) : rule.bonus_amount}
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            rule.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {editingBonusId === rule.id ? (
                              <>
                                <button onClick={handleSaveEditBonus} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-all"><Check size={14} /></button>
                                <button onClick={() => setEditingBonusId(null)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><X size={14} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleStartEditBonus(rule)} className="p-1.5 text-brand-purple hover:bg-brand-purple/5 border border-transparent hover:border-brand-purple/20 rounded transition-all"><Pencil size={14} /></button>
                                <button onClick={() => handleDeleteBonus(rule.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded transition-all"><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddBonus && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Deliveries</label>
                      <input 
                        type="number"
                        value={newBonus.min_deliveries}
                        onChange={(e) => setNewBonus({...newBonus, min_deliveries: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[12px] focus:border-brand-purple outline-none"
                        placeholder="20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bonus (₹)</label>
                      <input 
                        type="number"
                        value={newBonus.bonus_amount}
                        onChange={(e) => setNewBonus({...newBonus, bonus_amount: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-[12px] focus:border-brand-purple outline-none"
                        placeholder="200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAddBonus(false)}
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-md font-bold text-[11px] hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddBonus}
                      className="flex-1 py-1.5 bg-brand-purple text-white rounded-md font-bold text-[11px] hover:bg-brand-purple/90"
                    >
                      Save Rule
                    </button>
                  </div>
                </div>
              )}
              
              {!showAddBonus && (
                <button 
                  onClick={() => setShowAddBonus(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-white border border-brand-purple text-brand-purple rounded-lg font-bold text-[12px] hover:bg-brand-purple hover:text-white transition-all"
                >
                  <Plus size={14} /> Add Bonus Rule
                </button>
              )}
            </div>
          </div>

          {/* 2. PETROL ALLOWANCE SETTINGS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-[13px] font-bold text-brand-purple uppercase tracking-wider">2. PETROL ALLOWANCE SETTINGS</h2>
              <p className="text-[11px] text-slate-400 mt-1">Configure petrol allowance based on distance.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kilometre Limit (KM)</label>
                  <input 
                    type="number"
                    value={config.petrol_km_limit}
                    onChange={(e) => setConfig({...config, petrol_km_limit: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-slate-700 focus:border-brand-purple outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allowance Amount Per KM (₹)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={config.petrol_rate_per_km}
                    onChange={(e) => setConfig({...config, petrol_rate_per_km: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-slate-700 focus:border-brand-purple outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Calculation Preview</h4>
                <div className="text-[16px] font-bold text-slate-800">
                  {config.petrol_km_limit} KM <span className="text-slate-300 mx-1">×</span> ₹ {config.petrol_rate_per_km} <span className="text-brand-purple mx-1">= ₹ {Number(config.petrol_km_limit) * Number(config.petrol_rate_per_km)}</span>
                </div>
              </div>

              <button 
                onClick={handleUpdateConfig}
                disabled={saving}
                className="w-full py-3 bg-brand-purple text-white rounded-lg font-bold text-[13px] hover:bg-brand-purple/90 transition-all"
              >
                {saving ? "Updating..." : "Update Petrol Settings"}
              </button>
            </div>
          </div>

          {/* 3. PENALTY SETTINGS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full lg:col-span-2">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-[13px] font-bold text-brand-purple uppercase tracking-wider">3. PENALTY SETTINGS</h2>
              <p className="text-[11px] text-slate-400 mt-1">Set deduction rules for different penalty conditions.</p>
            </div>
            
            <div className="p-4">
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-3">Penalty Type</th>
                      <th className="px-4 py-3">Deduction (₹)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {penaltyRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {editingPenaltyId === rule.id ? (
                            <input 
                              type="text"
                              value={editPenaltyData.penalty_name}
                              onChange={(e) => setEditPenaltyData({...editPenaltyData, penalty_name: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-purple"
                            />
                          ) : rule.penalty_name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-rose-500">
                          {editingPenaltyId === rule.id ? (
                            <input 
                              type="number"
                              value={editPenaltyData.deduction_amount}
                              onChange={(e) => setEditPenaltyData({...editPenaltyData, deduction_amount: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-purple"
                            />
                          ) : rule.deduction_amount}
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            rule.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {editingPenaltyId === rule.id ? (
                              <>
                                <button onClick={handleSaveEditPenalty} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-all"><Check size={14} /></button>
                                <button onClick={() => setEditingPenaltyId(null)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><X size={14} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleStartEditPenalty(rule)} className="p-1.5 text-brand-purple hover:bg-brand-purple/5 border border-transparent hover:border-brand-purple/20 rounded transition-all"><Pencil size={14} /></button>
                                <button onClick={() => handleDeletePenalty(rule.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded transition-all"><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddPenalty && (
                <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-[11px] font-bold text-slate-700 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Plus size={14} className="text-brand-purple" /> Add Penalty Rule
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penalty Name</label>
                      <input 
                        type="text"
                        value={newPenalty.penalty_name}
                        onChange={(e) => setNewPenalty({...newPenalty, penalty_name: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[12px] focus:border-brand-purple outline-none"
                        placeholder="e.g. Late Delivery"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deduction (₹)</label>
                      <input 
                        type="number"
                        value={newPenalty.deduction_amount}
                        onChange={(e) => setNewPenalty({...newPenalty, deduction_amount: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[12px] focus:border-brand-purple outline-none"
                        placeholder="20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowAddPenalty(false)}
                      className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-md font-bold text-[11px] hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddPenalty}
                      className="px-6 py-2 bg-brand-purple text-white rounded-md font-bold text-[11px] hover:bg-brand-purple/90"
                    >
                      Save Rule
                    </button>
                  </div>
                </div>
              )}
              
              {!showAddPenalty && (
                <button 
                  onClick={() => setShowAddPenalty(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-white border border-brand-purple text-brand-purple rounded-lg font-bold text-[12px] hover:bg-brand-purple hover:text-white transition-all"
                >
                  <Plus size={14} /> Add Penalty Rule
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PayrollSettings;
