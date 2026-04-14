import React, { useState, useEffect } from "react";
import { adminService } from "../../../services/api";
import { DollarSign, ShoppingBag, Box, TrendingUp, Package, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        adminService.getProducts().catch(() => ({ data: [] })),
        adminService.getOrders().catch(() => ({ data: [] }))
      ]);
      
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.results || []);

      const totalRevenue = ordersData.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
      
      setStats({
        total_products: productsData.length,
        total_orders: ordersData.length,
        total_revenue: totalRevenue.toFixed(2),
      });

      // Sort if they have created_at, else assume already ordered
      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error("Error fetching admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">Overview of your store's performance.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 hover:cursor-default">

        {/* Revenue */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 rounded-xl p-3">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.total_revenue || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-indigo-600 hover:text-indigo-500">View detailed reports</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-xl p-3">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Orders</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_orders || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link to="/admin/orders" className="text-sm font-medium text-green-600 hover:text-green-500">View all orders</Link>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-50 rounded-xl p-3">
                <Box className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Products</p>
                <div className="flex items-baseline mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_products || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <Link to="/admin/products" className="text-sm font-medium text-orange-600 hover:text-orange-500">Manage products</Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Recent Orders
          </h3>
          <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.first_name} {order.user?.last_name}
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                    <Package className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    No orders found.
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

export default AdminDashboard;