import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Box, Image as ImageIcon } from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const [search, setSearch] = useState("");
const [categoryFilter, setCategoryFilter] = useState("All");
const [statusFilter, setStatusFilter] = useState("All");
const [stockFilter, setStockFilter] = useState("All");
const [selectedProducts, setSelectedProducts] = useState([]);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  const filteredProducts = products.filter((p) => {
  const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

  const matchCategory =
    categoryFilter === "All" ||
    (p.category?.name || p.category) === categoryFilter;

  const matchStatus =
    statusFilter === "All" ||
    (statusFilter === "Active" ? p.stock > 0 : p.stock === 0);

  const matchStock =
    stockFilter === "All" ||
    (stockFilter === "In Stock" && p.stock > 0) ||
    (stockFilter === "Out of Stock" && p.stock === 0);

  return matchSearch && matchCategory && matchStatus && matchStock;
});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog.</p>
        </div>
        <button 
          onClick={() => navigate("/vendor/products/add")}
          className="inline-flex items-center gap-2 justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>
     <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-end gap-4">

  {/* Search */}
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Search
    </label>
    <div className="relative">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-3 py-2.5 w-64 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      />
      <span className="absolute left-3 top-2.5 text-gray-400">
        🔍
      </span>
    </div>
  </div>

  {/* Category */}
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Category
    </label>
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
    >
      <option>All</option>
      <option>Kids</option>
      <option>Electronics</option>
    </select>
  </div>

  {/* Status */}
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Status
    </label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
    >
      <option>All</option>
      <option>Active</option>
      <option>Inactive</option>
    </select>
  </div>

  {/* Stock */}
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Stock
    </label>
    <select
      value={stockFilter}
      onChange={(e) => setStockFilter(e.target.value)}
      className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
    >
      <option>All</option>
      <option>In Stock</option>
      <option>Out of Stock</option>
    </select>
  </div>

  {/* Reset Button */}
  <div className="flex flex-col justify-end">
    <button
      onClick={() => {
        setSearch("");
        setCategoryFilter("All");
        setStatusFilter("All");
        setStockFilter("All");
      }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
    >
      🔄 Reset
    </button>
  </div>

</div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">

              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                          {p.image ? (
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
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
                      <div className="text-sm font-medium text-gray-900">₹{p.price}</div>
                      {p.discount_price && (
                        <div className="text-xs text-gray-500 line-through">₹{p.discount_price}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {p.stock > 0 ? `${p.stock} Units` : 'Out of Stock'}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mt-1 ml-1 leading-none">
                          Pack: {p.quantity || 1} {p.unit || 'pcs'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => navigate(`/vendor/products/edit/${p.id}`)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Box className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate("/vendor/products/add")}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Product
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

export default ProductList;
