import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Box, Image as ImageIcon, Download, CheckSquare, X, ListChecks } from "lucide-react";
import ProductForm from "./ProductForm";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeEditProduct, setActiveEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
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
         fetchProducts();
      } catch (error) {
         console.error("Error updating product", error);
      }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
       setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
       setSelectedProducts([]);
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || (p.category?.name || p.category) === categoryFilter;
    const matchStatus = statusFilter === "All" || (statusFilter === "Active" ? p.stock > 0 : p.stock === 0);
    const matchStock = stockFilter === "All" || (stockFilter === "In Stock" && p.stock > 0) || (stockFilter === "Out of Stock" && p.stock === 0);
    return matchSearch && matchCategory && matchStatus && matchStock;
  });

  return (
    <div className="space-y-6 pb-24 relative">

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog, prices, and stock.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="inline-flex items-center gap-2 justify-center rounded-xl border-2 border-green-600 bg-green-50 text-green-700 px-4 py-2.5 text-sm font-black shadow-sm hover:bg-green-100 transition-colors"
           >
             <Download size={18} />
             Export Excel
           </button>
           <button 
             onClick={() => navigate("/vendor/products/add")}
             className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
           >
             <Plus size={18} />
             Add Product
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2.5 w-64 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 mb-1">Stock Level</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <button
            onClick={() => { setSearch(""); setCategoryFilter("All"); setStatusFilter("All"); setStockFilter("All"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <input 
                     type="checkbox" 
                     className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                     checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                     onChange={toggleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-indigo-50/30 transition-colors group ${selectedProducts.includes(p.id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                         checked={selectedProducts.includes(p.id)}
                         onChange={() => toggleSelectProduct(p.id)}
                       />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                          {p.primary_image || (p.images && p.images[0]) ? (
                            <img src={p.primary_image || p.images[0].image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.description || "No description"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {p.category?.name || p.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-900">₹{p.price}</div>
                      {p.discount_price && (
                        <div className="text-xs text-emerald-600 font-bold hidden sm:block">Offer: ₹{p.discount_price}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100 shadow-sm shadow-red-200'}`}>
                          {p.stock > 0 ? `${p.stock} Units` : 'Out of Stock'}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mt-1 ml-1 leading-none">
                          Pack: {p.quantity || 1} {p.unit || 'pcs'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                       {/* INLINE EDIT TRIGGER */}
                      <button 
                        onClick={() => setActiveEditProduct(p)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 hover:shadow-sm transition-all active:scale-95"
                        title="Quick Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-100 hover:shadow-sm transition-all active:scale-95"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Box className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products match your criteria</h3>
                    <p className="mt-1 text-sm text-gray-500">Try clear filters or add a new spreadsheet via Bulk Upload.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK ACTIONS BANNER */}
      {selectedProducts.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl px-6 py-4 text-white flex items-center gap-6 z-40 border border-slate-700 animate-in slide-in-from-bottom flex-col sm:flex-row">
            <div className="flex items-center gap-2">
               <ListChecks className="text-indigo-400" size={20} />
               <span className="font-bold text-sm">{selectedProducts.length} items selected</span>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleExport}
                 className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
               >
                  Export Selected
               </button>
               <button 
                 onClick={handleBulkDelete}
                 className="text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-full transition-colors flex items-center gap-1"
               >
                 <Trash2 size={14} /> Bulk Delete
               </button>
            </div>
         </div>
      )}

      {/* EDIT MODAL POPUP */}
      {activeEditProduct && (
         <div className="fixed inset-0 z-50 flex justify-center py-10 sm:py-20 px-4 sm:px-10 overflow-y-auto w-full">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveEditProduct(null)}></div>
            <div className="relative w-full max-w-[1000px] h-fit bg-slate-50 rounded-[3rem] shadow-2xl border border-white p-2">
               
               <button 
                 onClick={() => setActiveEditProduct(null)}
                 className="absolute top-4 right-4 sm:-right-4 sm:-top-4 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all z-50 border-4 border-slate-50"
               >
                  <X strokeWidth={3} />
               </button>

               <div className="h-full w-full bg-white rounded-[2.5rem] p-4 sm:p-10 pt-16 sm:pt-10 overflow-y-auto max-h-[80vh] custom-scrollbar">
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
