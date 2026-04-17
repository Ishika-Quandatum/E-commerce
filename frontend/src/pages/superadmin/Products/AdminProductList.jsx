import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { Box, Image as ImageIcon, Search, Filter, ArrowUpRight } from "lucide-react";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchProducts = async (search = "") => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({ search });
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Global <span className="text-indigo-600 not-italic uppercase tracking-normal">Catalog</span></h1>
          <p className="mt-1 text-slate-500 font-medium lowercase">Master view of all products across all authorized vendors.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none text-sm font-bold w-48 placeholder:text-slate-300" 
                />
            </div>
            <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
                <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th scope="col" className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                <th scope="col" className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Classification</th>
                <th scope="col" className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Value</th>
                <th scope="col" className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
                <th scope="col" className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 italic font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                      Loading catalog data...
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                    <td className="px-10 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                          {p.primary_image ? (
                            <img src={p.primary_image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-200" size={28} />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter text-base capitalize">{p.name}</div>
                          <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">Asset ID: {p.id.toString().padStart(6, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap font-black text-xs text-slate-500 uppercase tracking-wide italic">
                      {p.vendor?.shop_name || "Official Store"}
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-900/10">
                        {p.category_name || "Unclassified"}
                      </span>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-base font-black text-slate-900 group-hover:translate-x-1 transition-transform tabular-nums">
                          ₹{(p.discount_price && p.discount_price < p.price ? p.discount_price : p.price).toLocaleString()}
                        </div>
                        {p.discount_price && p.discount_price < p.price && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-300 line-through">₹{p.price.toLocaleString()}</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{p.discount_percentage}% off</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${p.stock > 10 ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`} />
                          <span className="font-black text-slate-900 uppercase text-xs">{p.stock} Units</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 whitespace-nowrap text-right">
                      <button className="text-slate-300 hover:text-indigo-600 transition-all p-3 rounded-2xl hover:bg-white shadow-none hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-90">
                        <ArrowUpRight size={22} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-10 py-48 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100 rotate-12 group-hover:rotate-0 transition-transform">
                        <Box size={48} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Catalog mismatch</h4>
                        <p className="text-slate-400 font-bold text-sm lowercase leading-tight">No assets currently match the defined parameters in the global catalog.</p>
                      </div>
                      <button onClick={() => setSearchTerm("")} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                        Clear Search Parameters
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

export default AdminProductList;
