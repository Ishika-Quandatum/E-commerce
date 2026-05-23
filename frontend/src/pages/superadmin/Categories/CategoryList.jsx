import React, { useEffect, useState, useMemo, useCallback } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Edit2, Trash2, Tags, Image as ImageIcon, Search, Filter, 
  ChevronDown, Check, X, ChevronLeft, ChevronRight, Info, AlertCircle, 
  ShieldCheck, ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// ── Skeleton Loader Component ──────────────────────────────────────────
const SkeletonLoader = ({ type }) => {
  if (type === "list") {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-200 rounded w-1/4" />
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="h-24 bg-slate-200 rounded" />
    </div>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Selected Category & Subcategory Policy States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState({
    is_returnable: true,
    return_window_days: 7,
    policy_text: ""
  });
  
  // Policy Edit Mode & Loading States
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Subcategory Inline Edit State
  const [editingSubId, setEditingSubId] = useState(null);
  const [subPolicyEdit, setSubPolicyEdit] = useState({
    is_returnable: true,
    return_window_days: 7
  });

  // Category Pagination
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 7;

  // Subcategory Pagination
  const [subPage, setSubPage] = useState(1);
  const subsPerPage = 6;

  const navigate = useNavigate();

  // Search Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCategoryPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Categories
  const fetchCategories = async (selectId = null) => {
    setLoading(true);
    try {
      const res = await adminService.getCategories({ search: debouncedSearch });
      const allCategories = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setCategories(allCategories);

      // Auto-select category
      const topLevel = allCategories.filter(c => !c.parent);
      if (topLevel.length > 0) {
        let toSelect = topLevel[0];
        if (selectId) {
          const found = topLevel.find(c => c.id === selectId);
          if (found) toSelect = found;
        }
        handleCategorySelect(toSelect);
      } else {
        setSelectedCategory(null);
      }
    } catch (err) {
      toast.error("Failed to load product categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearch]);

  // Handle Selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsEditingPolicy(false);
    setEditingSubId(null);
    setSubPage(1);
    
    const policy = category?.return_policy || {};
    setSelectedPolicy({
      is_returnable: policy.is_returnable ?? true,
      return_window_days: policy.return_window_days ?? 7,
      policy_text: policy.policy_text || `Products in this category can be returned within ${policy.return_window_days ?? 7} days.`
    });
  };

  // Save Category Return Policy
  const handleSaveCategoryPolicy = async () => {
    if (!selectedCategory) return;
    setSaveLoading(true);
    try {
      const updatedPolicy = {
        ...selectedPolicy,
        // Force 0 days if not returnable
        return_window_days: selectedPolicy.is_returnable ? selectedPolicy.return_window_days : 0
      };

      const res = await adminService.updateCategory(selectedCategory.id, {
        return_policy: updatedPolicy
      });
      
      toast.success(`${selectedCategory.name} return policy updated successfully!`);
      setIsEditingPolicy(false);
      
      // Refresh local categories state
      await fetchCategories(selectedCategory.id);
    } catch (err) {
      toast.error("Failed to save return policy");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      try {
        await adminService.deleteCategory(id);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  // Inline Subcategory Edit Trigger
  const handleStartEditSub = (sub) => {
    setEditingSubId(sub.id);
    const policy = sub.return_policy || {};
    setSubPolicyEdit({
      is_returnable: policy.is_returnable ?? true,
      return_window_days: policy.return_window_days ?? 7
    });
  };

  // Save Subcategory Return Policy Inline
  const handleSaveSubPolicy = async (sub) => {
    try {
      const updatedPolicy = {
        is_returnable: subPolicyEdit.is_returnable,
        return_window_days: subPolicyEdit.is_returnable ? subPolicyEdit.return_window_days : 0,
        policy_text: subPolicyEdit.is_returnable 
          ? `This item can be returned within ${subPolicyEdit.return_window_days} days.`
          : "Non-returnable item."
      };

      await adminService.updateCategory(sub.id, {
        return_policy: updatedPolicy
      });

      toast.success(`${sub.name} policy updated!`);
      setEditingSubId(null);
      
      // Refresh category data to reflect changes
      await fetchCategories(selectedCategory?.id);
    } catch (err) {
      toast.error("Failed to update subcategory policy");
    }
  };

  // Filter and Paginate Categories
  const topLevelCategories = useMemo(() => {
    return categories.filter(c => !c.parent);
  }, [categories]);

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoriesPerPage;
    return topLevelCategories.slice(start, start + categoriesPerPage);
  }, [topLevelCategories, categoryPage]);

  const totalCategoryPages = Math.ceil(topLevelCategories.length / categoriesPerPage);

  // Subcategories Memoization
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    // The main category children are returned inside selectedCategory.children
    return selectedCategory.children || [];
  }, [selectedCategory, categories]);

  const paginatedSubs = useMemo(() => {
    const start = (subPage - 1) * subsPerPage;
    return subcategories.slice(start, start + subsPerPage);
  }, [subcategories, subPage]);

  const totalSubPages = Math.ceil(subcategories.length / subsPerPage);

  // Toggle helper for main category policy
  const handleMainToggle = (checked) => {
    setSelectedPolicy(prev => {
      const is_returnable = checked;
      return {
        ...prev,
        is_returnable,
        return_window_days: is_returnable ? 7 : 0,
        policy_text: is_returnable 
          ? `Products in this category can be returned within 7 days of delivery.` 
          : "This category is non-returnable."
      };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Upper Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Return Policies</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and configure return windows and policies for your store catalog.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/categories/add")}
          className="group flex items-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Add New Category
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ==================== LEFT COLUMN: Categories list ==================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          
          {/* Header Search & Stats */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/40 space-y-3">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Category List</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all text-sm placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Categories List Body */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {loading && categories.length === 0 ? (
              <SkeletonLoader type="list" />
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((c) => {
                const isSelected = selectedCategory?.id === c.id;
                const isReturnable = c.return_policy?.is_returnable ?? true;
                const subCount = c.children?.length || 0;
                
                return (
                  <motion.div
                    whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => handleCategorySelect(c)}
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected 
                        ? "bg-violet-50/40 border-brand-purple shadow-sm shadow-violet-100" 
                        : "bg-white border-slate-100 hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Category Image */}
                    <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-slate-400" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-brand-purple" : "text-slate-800"}`}>
                          {c.name}
                        </h4>
                        
                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                          isReturnable 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {isReturnable ? "Returnable" : "Non Returnable"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-slate-400">
                        <span>Sub-categories ({subCount})</span>
                        
                        {/* Actions Hover Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/categories/edit/${c.id}`); }}
                            className="p-1 hover:text-brand-purple hover:bg-white rounded transition-all"
                            title="Edit Category Name/Image"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteCategory(e, c.id)}
                            className="p-1 hover:text-rose-600 hover:bg-white rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Tags size={36} className="mb-2 opacity-30" />
                <p className="font-bold text-sm">No categories found</p>
                <p className="text-xs">Try adjusting your search or add a category.</p>
              </div>
            )}
          </div>

          {/* Left Column Pagination Footer */}
          {totalCategoryPages > 1 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">
                Page {categoryPage} of {totalCategoryPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={categoryPage === 1}
                  onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={categoryPage === totalCategoryPages}
                  onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================== RIGHT COLUMN: Return policy manager ==================== */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center">
                <Info size={48} className="text-slate-300 mb-4 animate-bounce" />
                <h3 className="font-bold text-lg text-slate-800">No Category Selected</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                  Please select a category from the left pane to view and configure its return and refund policies.
                </p>
              </div>
            ) : loading ? (
              <SkeletonLoader type="policy" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* ── Category Policy Header Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          Return & Refund Policy — {selectedCategory.name}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                          selectedPolicy.is_returnable 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {selectedPolicy.is_returnable ? "Returnable" : "Non Returnable"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Configure return window and rules for this parent category.
                      </p>
                    </div>

                    {/* Edit/Save Button */}
                    <button
                      onClick={() => {
                        if (isEditingPolicy) {
                          handleSaveCategoryPolicy();
                        } else {
                          setIsEditingPolicy(true);
                        }
                      }}
                      disabled={saveLoading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        isEditingPolicy
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {saveLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isEditingPolicy ? (
                        <>
                          <Check size={14} /> Save Policy
                        </>
                      ) : (
                        <>
                          <Edit2 size={14} /> Edit Policy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Main Form Fields */}
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Return Eligible Switch */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          Return Eligible
                        </label>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            disabled={!isEditingPolicy}
                            onClick={() => handleMainToggle(!selectedPolicy.is_returnable)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              selectedPolicy.is_returnable ? "bg-brand-purple" : "bg-slate-200"
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                selectedPolicy.is_returnable ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-sm font-bold ${selectedPolicy.is_returnable ? "text-brand-purple" : "text-slate-400"}`}>
                            {selectedPolicy.is_returnable ? "Eligible" : "Not Allowed"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1">
                          Can products in this category be returned?
                        </p>
                      </div>

                      {/* Max Return Days Input */}
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          Max Return Days <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="365"
                            disabled={!isEditingPolicy || !selectedPolicy.is_returnable}
                            value={selectedPolicy.return_window_days}
                            onChange={(e) => setSelectedPolicy({ ...selectedPolicy, return_window_days: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple disabled:bg-slate-50 disabled:text-slate-400 transition-all font-semibold text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            days
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Maximum return window duration.
                        </p>
                      </div>

                      {/* Info Alert Box */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2.5">
                        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          <span className="font-bold text-slate-700">Enterprise Rule:</span> Non-returnable categories (like Food) automatically disable return configurations for all child items.
                        </div>
                      </div>
                    </div>

                    {/* Policy Notes / Details Textarea */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          Policy Note (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {selectedPolicy.policy_text?.length || 0}/300
                        </span>
                      </div>
                      <textarea
                        rows="3"
                        maxLength="300"
                        placeholder="Add return policy instructions, terms, or specifications..."
                        disabled={!isEditingPolicy}
                        value={selectedPolicy.policy_text}
                        onChange={(e) => setSelectedPolicy({ ...selectedPolicy, policy_text: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple disabled:bg-slate-50 disabled:text-slate-400 transition-all text-sm font-medium leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Subcategory Policies Card ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/40">
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                      Subcategory Policies
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Configure and manage specific return rules for subcategories under {selectedCategory.name}.
                    </p>
                  </div>

                  {/* Subcategories Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/30 border-b border-slate-100">
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategory</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return Eligible</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Return Days</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedSubs.length > 0 ? (
                          paginatedSubs.map((sub) => {
                            const isEditing = editingSubId === sub.id;
                            const policy = sub.return_policy || {};
                            
                            // If main category is disabled, force everything disabled
                            const parentDisabled = !selectedPolicy.is_returnable;
                            const isReturnable = parentDisabled ? false : (isEditing ? subPolicyEdit.is_returnable : (policy.is_returnable ?? true));
                            const returnDays = parentDisabled ? 0 : (isEditing ? subPolicyEdit.return_window_days : (policy.return_window_days ?? 7));

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/40 transition-colors">
                                
                                {/* Subcategory Name */}
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className="text-sm font-bold text-slate-800">{sub.name}</span>
                                  </div>
                                </td>

                                {/* Return Eligible Toggle */}
                                <td className="px-5 py-4">
                                  {parentDisabled ? (
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                      <ShieldAlert size={14} /> Locked (Parent Policy)
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        disabled={!isEditing}
                                        onClick={() => setSubPolicyEdit(prev => ({ ...prev, is_returnable: !prev.is_returnable, return_window_days: !prev.is_returnable ? 7 : 0 }))}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                          isReturnable ? "bg-brand-purple" : "bg-slate-200"
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            isReturnable ? "translate-x-4" : "translate-x-0"
                                          }`}
                                        />
                                      </button>
                                      <span className={`text-[11px] font-bold ${isReturnable ? "text-brand-purple" : "text-slate-400"}`}>
                                        {isReturnable ? "Eligible" : "Not Allowed"}
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Max Return Days Input/Badge */}
                                <td className="px-5 py-4">
                                  {parentDisabled ? (
                                    <span className="text-xs font-bold text-slate-400">0 days</span>
                                  ) : isEditing ? (
                                    <div className="relative max-w-[100px]">
                                      <input
                                        type="number"
                                        min="0"
                                        disabled={!subPolicyEdit.is_returnable}
                                        value={subPolicyEdit.return_window_days}
                                        onChange={(e) => setSubPolicyEdit({ ...subPolicyEdit, return_window_days: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">days</span>
                                    </div>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                      isReturnable 
                                        ? "bg-violet-50 text-brand-purple" 
                                        : "bg-slate-50 text-slate-400"
                                    }`}>
                                      {returnDays} days
                                    </span>
                                  )}
                                </td>

                                {/* Subcategory Actions */}
                                <td className="px-5 py-4 text-right">
                                  {parentDisabled ? (
                                    <span className="text-[10px] font-medium text-slate-400">No settings</span>
                                  ) : isEditing ? (
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleSaveSubPolicy(sub)}
                                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                                        title="Save inline policy"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={() => setEditingSubId(null)}
                                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-all"
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleStartEditSub(sub)}
                                      className="p-1.5 text-slate-400 hover:text-brand-purple hover:bg-slate-50 rounded-lg transition-all"
                                      title="Edit return policy inline"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-5 py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center">
                                <Tags size={28} className="mb-2 opacity-30" />
                                <p className="font-bold text-sm">No subcategories found</p>
                                <p className="text-xs">Add subcategories inside this parent to configure sub-policies.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Subcategories Table Pagination */}
                  {totalSubPages > 1 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        Showing {Math.min(subcategories.length, (subPage - 1) * subsPerPage + 1)} to {Math.min(subcategories.length, subPage * subsPerPage)} of {subcategories.length} subcategories
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={subPage === 1}
                          onClick={() => setSubPage(p => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          disabled={subPage === totalSubPages}
                          onClick={() => setSubPage(p => Math.min(totalSubPages, p + 1))}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
