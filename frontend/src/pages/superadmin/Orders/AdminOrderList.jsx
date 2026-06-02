import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Package, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Status Filter State
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination State (Synced with Django Rest Framework's page pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Reset page index on typing search input or toggling status filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Combined debounce handler for search, status, and page changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({ 
        search: searchTerm, 
        page: currentPage,
        status: statusFilter === "All" ? "" : statusFilter
      });
      if (res.data && res.data.results) {
        setOrders(res.data.results);
        setTotalItems(res.data.count || res.data.results.length);
      } else {
        setOrders(Array.isArray(res.data) ? res.data : []);
        setTotalItems(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-amber-100 text-amber-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800';
      case 'ACCEPTED': return 'bg-cyan-100 text-cyan-800';
      case 'PACKED': return 'bg-teal-100 text-teal-800';
      case 'DISPATCH QUEUE': return 'bg-purple-100 text-purple-800';
      // Return Statuses
      case 'RETURN_REQUESTED': return 'bg-indigo-100 text-indigo-800';
      case 'RETURN_APPROVED': return 'bg-violet-100 text-violet-800';
      case 'RETURN_IN_PROGRESS': return 'bg-sky-100 text-sky-800';
      case 'RETURN_DELIVERED': return 'bg-teal-100 text-teal-800';
      case 'REFUNDED': return 'bg-emerald-100 text-emerald-800';
      case 'RETURN_REJECTED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      for (let i = start; i <= end; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track customer orders.</p>
        </div>
        
        {/* Controls: Search and Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-full sm:w-72 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100/50 transition-all">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs outline-none border-none font-medium placeholder:text-gray-400 text-gray-800"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100/50 transition-all appearance-none pr-10 font-semibold text-gray-600 shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Packed">Packed</option>
              <option value="Dispatch Queue">Dispatch Queue</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Return Approved">Return Approved</option>
              <option value="Return In Progress">Return In Progress</option>
              <option value="Return Delivered">Return Delivered</option>
              <option value="Return Rejected">Return Rejected</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 border-l border-gray-100">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden min-w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors font-bold"
                      >
                        #{o.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {o.user?.first_name || o.user?.last_name 
                          ? `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.trim() 
                          : o.user?.username || "Anonymous User"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {o.user?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(o.created_at || new Date()).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{parseFloat(o.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(o.display_status || o.status)}`}>
                        {o.display_status || o.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="max-w-[200px] truncate" title={o.address}>
                        {o.address || 'No Address'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                    <p className="mt-1 text-sm text-gray-500">When customers place orders, they will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-800">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-gray-800">{totalItems}</span> orders
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white active:scale-95 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all flex items-center justify-center border active:scale-95 ${
                      currentPage === pageNum
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white active:scale-95 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;
