import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { Box, Image as ImageIcon, Search, Filter, ArrowUpRight } from "lucide-react";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Global <span className="text-indigo-600 not-italic uppercase tracking-normal">Catalog</span></h1>
          <p className="mt-1 text-slate-500 font-medium lowercase">Master view of all products across all authorized vendors.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search product ID..." className="outline-none text-sm font-medium w-40" />
            </div>
            <button className="bg-slate-900 text-white p-2.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <Filter size={20} />
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Value</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                        {p.image || (p.images && p.images[0]?.image) ? (
                          <img src={p.image || p.images[0].image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-300" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">ID: {p.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap font-bold text-sm text-slate-600">
                    {p.vendor?.shop_name || "Official Store"}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {p.category?.name || p.category || "General"}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900 group-hover:scale-110 origin-left transition-transform">₹{p.price}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-black text-slate-700">{p.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-white shadow-none hover:shadow-lg hover:shadow-indigo-500/10">
                      <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductList;
