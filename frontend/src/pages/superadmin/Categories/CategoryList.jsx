import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Tags, Image as ImageIcon, Search, Filter, MoreHorizontal } from "lucide-react";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories({ search: searchTerm });
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Categories</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and organize your store's taxonomy.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/categories/add")}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Add New Category
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-3 bg-slate-100 rounded-2xl text-slate-600 font-bold text-sm flex items-center gap-2">
                <Filter size={16} />
                {categories.length} Total
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Image</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Category Name</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Inventory</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-indigo-600"></div>
                       <p className="font-bold text-slate-400">Loading taxonomy...</p>
                    </div>
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="h-16 w-16 rounded-[1.25rem] bg-slate-100 border border-slate-200 overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                             <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         {c.products_count || 0} Products
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/categories/edit/${c.id}`)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-90"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-500/10 transition-all active:scale-90"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Tags size={40} />
                       </div>
                       <div>
                          <p className="text-xl font-bold text-slate-900">No categories found</p>
                          <p className="text-slate-500 mt-1">Try a different search term or add a new category.</p>
                       </div>
                       <button 
                          onClick={() => setSearchTerm("")}
                          className="text-indigo-600 font-bold hover:underline"
                       >
                          Clear search
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
