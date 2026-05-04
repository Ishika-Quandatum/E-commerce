import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Box, 
  Image as ImageIcon, 
  Download, 
  CheckSquare, 
  X, 
  ListChecks, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw
} from "lucide-react";
import ProductForm from "./ProductForm";
import clsx from "clsx";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeEditProduct, setActiveEditProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, stockFilter]);

  // Debounced search effect
  useEffect(() => {
      const timer = setTimeout(() => {
          if (page === 1) fetchProducts();
          else setPage(1);
      }, 500);
      return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts({
          page: page,
          search: search,
          stock_status: stockFilter === "All" ? "" : stockFilter,
      });
      
      if (res.data.results) {
          setProducts(res.data.results);
          setTotalCount(res.data.count);
          setTotalPages(Math.ceil(res.data.count / 10));
      } else {
          setProducts(Array.isArray(res.data) ? res.data : []);
          setTotalCount(res.data.length || 0);
          setTotalPages(1);
      }
      setSelectedProducts([]);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        for (const id of selectedProducts) {
           await adminService.deleteProduct(id);
        }
        fetchProducts();
      } catch (err) {
        console.error("Failed to bulk delete products");
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminService.bulkExportProducts();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Vendor_Products_Export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to export products", err);
    }
  };

  const handleModalSubmit = async (formData) => {
      try {
         await adminService.updateProduct(activeEditProduct.id, formData);
         setActiveEditProduct(null);
         setToastMessage({ type: 'success', text: 'Product updated successfully!' });
         setTimeout(() => setToastMessage(null), 4000);
         fetchProducts();
      } catch (error) {
         console.error("Error updating product", error);
         const errorData = error.response?.data;
         let errMsg = 'Failed to update product.';
         if (errorData && typeof errorData === 'object') {
            const firstKey = Object.keys(errorData)[0];
            const firstError = errorData[firstKey];
            errMsg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
         }
         setToastMessage({ type: 'error', text: errMsg });
         setTimeout(() => setToastMessage(null), 4000);
      }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
       setSelectedProducts(products.map(p => p.id));
    } else {
       setSelectedProducts([]);
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="space-y-6 pb-24 relative animate-in fade-in duration-500">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 fade-in duration-300 font-bold ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-500/20'}`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          {toastMessage.text}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium italic">Manage your product catalog, prices, and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="inline-flex items-center gap-2 justify-center rounded-xl border-2 border-green-600 bg-green-50 text-green-700 px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-green-100 transition-all active:scale-95"
           >
             <Download size={16} />
             Export Excel
           </button>
           <button 
             onClick={() => navigate("/vendor/products/add")}
             className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
           >
             <Plus size={18} />
             Add Product
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-2xl shadow-slate-200/40 flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Products</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 w-full bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-slate-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[180px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Stock Level</label>
          <select
            value={stockFilter}
            onChange={(e) => {setStockFilter(e.target.value); setPage(1);}}
            className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Inventory</option>
            <option value="In Stock">Active Stock</option>
            <option value="Low Stock">Low Inventory</option>
            <option value="Out of Stock">Sold Out</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <button
            onClick={() => { setSearch(""); setStockFilter("All"); setPage(1); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all active:scale-95"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/30 rounded-[3rem] overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-10 py-6 text-left w-10">
                  <input 
                     type="checkbox" 
                     className="w-5 h-5 text-indigo-600 border-slate-200 rounded-lg focus:ring-indigo-500 cursor-pointer transition-all"
                     checked={products.length > 0 && selectedProducts.length === products.length}
                     onChange={toggleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th scope="col" className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th scope="col" className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Commercials</th>
                <th scope="col" className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
                <th scope="col" className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="h-24 bg-slate-50/10"></td>
                    </tr>
                  ))
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className={clsx(
                      "hover:bg-indigo-50/20 transition-all group",
                      selectedProducts.includes(p.id) && "bg-indigo-50/40"
                  )}>
                    <td className="px-10 py-5">
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 text-indigo-600 border-slate-200 rounded-lg focus:ring-indigo-500 cursor-pointer"
                         checked={selectedProducts.includes(p.id)}
                         onChange={() => toggleSelectProduct(p.id)}
                       />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-110 transition-transform">
                          {p.primary_image || (p.images && p.images[0]) ? (
                            <img src={p.primary_image || p.images[0].image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-300" size={24} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors italic uppercase">{p.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic truncate max-w-[180px]">{p.description || "No narrative"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                        {p.category?.name || p.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-base font-black text-slate-900 italic tabular-nums">₹{p.price}</div>
                      {p.discount_price && (
                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Offer: ₹{p.discount_price}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className={clsx(
                            "inline-flex items-center w-fit px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            p.stock > 10 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : p.stock > 0 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-rose-50 text-rose-700 border-rose-100"
                        )}>
                          {p.stock > 0 ? `${p.stock} Units` : 'Sold Out'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter ml-1">
                          {p.quantity || 1} {p.unit || 'pcs'} Pack
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-5 whitespace-nowrap text-right space-x-1">
                       <button 
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="w-10 h-10 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                        title="View Live"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button 
                        onClick={() => setActiveEditProduct(p)}
                        className="w-10 h-10 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                        title="Update"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-10 py-32 text-center">
                    <Box className="mx-auto h-16 w-16 text-slate-200" strokeWidth={1} />
                    <h3 className="mt-4 text-xl font-black text-slate-900 uppercase tracking-tighter italic">No Inventory Found</h3>
                    <p className="mt-2 text-sm text-slate-500 font-medium">Try refining your search or add a new product catalog.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-10 py-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Displaying {totalCount > 0 ? (page - 1) * 10 + 1 : 0} - {Math.min(page * 10, totalCount)} of {totalCount} Records
            </p>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={clsx(
                                "w-10 h-10 rounded-xl text-xs font-black transition-all",
                                page === i + 1 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-200"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* BULK ACTIONS BANNER */}
      {selectedProducts.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl px-8 py-5 text-white flex items-center gap-8 z-40 border border-slate-700 animate-in slide-in-from-bottom flex-col sm:flex-row">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ListChecks size={20} />
               </div>
               <span className="font-black text-sm italic tracking-tight">{selectedProducts.length} Items Selected</span>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleExport}
                 className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl transition-all active:scale-95"
               >
                  Export Selection
               </button>
               <button 
                 onClick={handleBulkDelete}
                 className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-6 py-2.5 rounded-2xl transition-all active:scale-95 border border-rose-500/20"
               >
                  Bulk Purge
               </button>
            </div>
         </div>
      )}

      {/* EDIT MODAL POPUP */}
      {activeEditProduct && (
         <div className="fixed inset-0 z-[100] flex justify-center py-10 sm:py-20 px-4 sm:px-10 overflow-y-auto w-full">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveEditProduct(null)}></div>
            <div className="relative w-full max-w-[1100px] h-fit bg-slate-50 rounded-[4rem] shadow-2xl border border-white p-2">
               
               <button 
                 onClick={() => setActiveEditProduct(null)}
                 className="absolute top-4 right-4 sm:-right-4 sm:-top-4 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all z-[110] border-4 border-slate-50"
               >
                  <X strokeWidth={4} />
               </button>

               <div className="h-full w-full bg-white rounded-[3.5rem] p-6 sm:p-12 pt-16 sm:pt-12 overflow-y-auto max-h-[85vh] custom-scrollbar">
                   <div className="mb-10 text-center">
                       <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">Product Intelligence</h2>
                       <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Refining SKU #{activeEditProduct.sku || activeEditProduct.id}</p>
                   </div>
                   <ProductForm 
                      initialData={activeEditProduct} 
                      onSubmit={handleModalSubmit} 
                   />
               </div>

            </div>
         </div>
      )}

    </div>
  );
};

export default ProductList;
