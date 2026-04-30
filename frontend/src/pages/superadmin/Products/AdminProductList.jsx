import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  IndianRupee,
  FileDown,
  List,
  LayoutGrid
} from "lucide-react";
import { adminService, vendorService } from "../../../services/api";
import clsx from "clsx";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    inactive_products: 0,
    out_of_stock: 0,
    low_stock: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    category: "All Categories",
    vendor: "All Vendors",
    status: "All Status",
    stock_status: "All Stock",
    min_price: "",
    max_price: "",
    start_date: "",
    end_date: "",
    tab: "All Products"
  });

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // View Mode State
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchInitialData();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, page, pageSize, viewMode]);

  const fetchInitialData = async () => {
    try {
      const [catRes, venRes] = await Promise.all([
        adminService.getCategories(),
        vendorService.getVendors()
      ]);
      setCategories(catRes.data);
      setVendors(venRes.data);
    } catch (err) {
      console.error("Failed to fetch filter options");
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminService.getProductStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: filters.search,
        min_price: filters.min_price,
        max_price: filters.max_price,
        start_date: filters.start_date,
        end_date: filters.end_date
      };

      if (filters.category !== "All Categories") params.category = filters.category;
      if (filters.vendor !== "All Vendors") params.vendor = filters.vendor;
      if (filters.status !== "All Status") params.status = filters.status;
      if (filters.stock_status !== "All Stock") params.stock_status = filters.stock_status;
      
      // Handle Tabs
      if (filters.tab === "Active") params.status = "Active";
      if (filters.tab === "Inactive") params.status = "Inactive";
      if (filters.tab === "Out of Stock") params.stock_status = "Out of Stock";
      if (filters.tab === "Low Stock") params.stock_status = "Low Stock";

      const res = await adminService.getProducts(params);
      setProducts(res.data.results || []);
      setTotalItems(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminService.bulkExportProducts();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Products_Export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleReset = () => {
    setFilters({
      search: "",
      category: "All Categories",
      vendor: "All Vendors",
      status: "All Status",
      stock_status: "All Stock",
      min_price: "",
      max_price: "",
      start_date: "",
      end_date: "",
      tab: "All Products"
    });
    setPage(1);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={24} className="opacity-90" />
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 leading-none">
            {statsLoading ? "..." : value.toLocaleString()}
          </h3>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{subtitle}</span>
        <div className="flex -space-x-2">
            {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Products Management</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Manage all products across the platform</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
                <FileDown size={18} />
                <span>Export</span>
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <StatCard 
          title="Total Products" 
          value={stats.total_products} 
          subtitle="All Products" 
          icon={Package} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          title="Active Products" 
          value={stats.active_products} 
          subtitle="Active" 
          icon={RefreshCw} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Inactive Products" 
          value={stats.inactive_products} 
          subtitle="Inactive" 
          icon={AlertCircle} 
          colorClass="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          title="Out of Stock" 
          value={stats.out_of_stock} 
          subtitle="Out of Stock" 
          icon={AlertCircle} 
          colorClass="bg-rose-50 text-rose-600" 
        />
        <StatCard 
          title="Low Stock" 
          value={stats.low_stock} 
          subtitle="Low Stock" 
          icon={IndianRupee} 
          colorClass="bg-amber-50 text-amber-600" 
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Search</label>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                type="text" 
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, tab: "All Products"})}
                />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Category</label>
            <div className="relative">
                <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                    <option>All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Vendor Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Vendor</label>
            <div className="relative">
                <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                    value={filters.vendor}
                    onChange={(e) => setFilters({...filters, vendor: e.target.value})}
                >
                    <option>All Vendors</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.shop_name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Status</label>
            <div className="relative">
                <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Stock Status Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Stock</label>
            <div className="relative">
                <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                    value={filters.stock_status}
                    onChange={(e) => setFilters({...filters, stock_status: e.target.value})}
                >
                    <option>All Stock</option>
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-6 items-end">
            <div className="xl:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Price Range</label>
                <div className="grid grid-cols-2 gap-3">
                    <input 
                    type="number" 
                    placeholder="Min Price"
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={filters.min_price}
                    onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                    />
                    <input 
                    type="number" 
                    placeholder="Max Price"
                    className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={filters.max_price}
                    onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="xl:col-span-5 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                        type="date" 
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
                        value={filters.start_date}
                        onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    />
                    <input 
                        type="date" 
                        className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer"
                        value={filters.end_date}
                        onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 xl:col-span-3">
                <button 
                  onClick={fetchProducts}
                  className="w-full flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Filter size={18} />
                    <span>Apply Filters</span>
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                    <RefreshCw size={18} />
                    <span className="sm:hidden lg:inline">Reset</span>
                </button>
            </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 px-2 pb-1 gap-4">
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar pb-1">
                {["All Products", "Active", "Inactive", "Out of Stock", "Low Stock"].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setFilters({...filters, tab})}
                        className={clsx(
                            "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
                            filters.tab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab} {filters.tab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-end sm:self-center">
                <button 
                    onClick={() => setViewMode("list")}
                    className={clsx(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <List size={18} />
                </button>
                <button 
                    onClick={() => setViewMode("grid")}
                    className={clsx(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <LayoutGrid size={18} />
                </button>
            </div>
        </div>

        {/* Dynamic View */}
        {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-16 sm:p-32 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse shadow-sm">
                Updating Registry...
            </div>
        ) : products.length > 0 ? (
            viewMode === "list" ? (
                <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto no-scrollbar">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Created On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                                                {p.primary_image ? (
                                                    <img 
                                                        src={p.primary_image.startsWith('http') ? p.primary_image : `http://127.0.0.1:8000${p.primary_image}`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                                                        onError={(e) => {
                                                            e.target.src = "https://placehold.co/100x100?text=No+Image";
                                                        }}
                                                    />
                                                ) : (
                                                    <Package className="text-slate-300" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{p.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">SKU: {p.sku || "N/A"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-600">{p.vendor_name || "Official Store"}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">ID: VEN{p.vendor || "000"}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                                            {p.category_name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">₹{p.discount_price || p.price}</span>
                                            {p.discount_price && <span className="text-[10px] text-slate-300 line-through">₹{p.price}</span>}
                                        </div>
                                        {p.discount_price && <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{(100 - (p.discount_price/p.price * 100)).toFixed(0)}% OFF</div>}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-900">{p.stock}</div>
                                        <div className={clsx(
                                            "text-[10px] font-bold uppercase tracking-tighter",
                                            p.stock === 0 ? "text-rose-500" : p.stock <= 10 ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "In Stock"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={clsx(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            p.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-600">{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 z-10">
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                    p.status === "Active" ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                                )}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="aspect-square bg-slate-50 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 p-2 mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                {p.primary_image ? (
                                    <img 
                                        src={p.primary_image.startsWith('http') ? p.primary_image : `http://127.0.0.1:8000${p.primary_image}`} 
                                        alt="" 
                                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                                        onError={(e) => {
                                            e.target.src = "https://placehold.co/300x300?text=No+Image";
                                        }}
                                    />
                                ) : (
                                    <Package className="text-slate-200" size={48} />
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category_name}</p>
                                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">SKU: {p.sku || "N/A"}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 truncate">{p.vendor_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                                            <span className="text-lg sm:text-xl font-black text-slate-900">₹{p.discount_price || p.price}</span>
                                            {p.discount_price && <span className="text-[10px] sm:text-xs text-slate-300 line-through">₹{p.price}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-900">{p.stock} Qty</p>
                                        <p className={clsx(
                                            "text-[9px] font-bold uppercase tracking-tighter",
                                            p.stock === 0 ? "text-rose-500" : p.stock <= 10 ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "In Stock"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        ) : (
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-16 sm:p-32 text-center shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <AlertCircle size={48} className="text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No assets found matching the registry</p>
                </div>
            </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2 sm:px-4">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left">
                Showing {Math.min((page - 1) * pageSize + 1, totalItems)} to {Math.min(page * pageSize, totalItems)} of {totalItems} products
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className="p-2 sm:p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                        {[...Array(Math.min(5, Math.ceil(totalItems / pageSize)))].map((_, i) => {
                            const pNum = i + 1;
                            return (
                                <button 
                                    key={pNum}
                                    onClick={() => setPage(pNum)}
                                    className={clsx(
                                        "min-w-[40px] h-10 rounded-xl font-bold text-sm transition-all active:scale-95",
                                        page === pNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    {pNum}
                                </button>
                            );
                        })}
                        {Math.ceil(totalItems / pageSize) > 5 && <span className="px-1 text-slate-300">...</span>}
                    </div>
                    <button 
                        onClick={() => setPage(prev => Math.min(Math.ceil(totalItems / pageSize), prev + 1))}
                        disabled={page >= Math.ceil(totalItems / pageSize)}
                        className="p-2 sm:p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                
                <div className="relative group w-full sm:w-auto">
                    <select 
                        className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 appearance-none outline-none cursor-pointer hover:bg-slate-50 transition-all"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(parseInt(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value="10">10 / Page</option>
                        <option value="25">25 / Page</option>
                        <option value="50">50 / Page</option>
                        <option value="100">100 / Page</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductList;
