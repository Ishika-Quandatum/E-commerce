import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../../services/api";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      // Fetch all orders and find by ID. Ideally replace with adminService.getOrderDetail.
      const res = await adminService.getOrders();
      const oList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const found = oList.find(o => String(o.id) === String(id));
      setOrder(found);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await adminService.updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found.</div>;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.id}
            <span className={`text-base font-medium px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              {order.status || 'Pending'}
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {new Date(order.created_at || new Date()).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.order_items?.length > 0 ? (
                order.order_items.map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{item.product?.name || `Product #${item.product}`}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">No items found for this order.</div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">₹{order.total_price}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 block">Update Order Status</h3>
            <div className="flex items-center gap-4">
              <select
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                value={order.status || 'Pending'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {updating && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Name</p>
                <p className="text-sm text-gray-900 mt-1">{order.user?.first_name} {order.user?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                <p className="text-sm text-gray-900 mt-1">{order.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.shipping_address || "No shipping address provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;