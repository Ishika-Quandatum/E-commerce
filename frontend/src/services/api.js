import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 1. REQUEST INTERCEPTOR (token add)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//2. RESPONSE INTERCEPTOR 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem('access_token');
      
      if (hasToken && !window.location.pathname.includes('/login')) {
        console.warn("Unauthorized - Session expired. Clearing session.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload(); // Reload to clear state
      }
    }
    return Promise.reject(error);
  }
);
export const authService = {
  login: (credentials) => api.post('users/login/', credentials),
  register: (userData) => api.post('users/register/', userData),
  getProfile: () => api.get('users/profile/'),
  changePassword: (data) => api.post('users/change-password/', data),
};

export const productService = {
  getCategories: (params) => api.get('categories/', { params }),
  getProducts: (params) => api.get('products/', { params }),
  getProductDetail: (id) => api.get(`products/${id}/`),
};

export const cartService = {
  getCart: () => api.get('cart/my_cart/'),
  addToCart: (data) => api.post('cart/add_item/', data),
  updateCartItem: (data) => api.patch('cart/update_item/', data),
  removeFromCart: (data) => api.delete('cart/remove_item/', { data }),
};

export const orderService = {
  placeOrder: (orderData) => api.post('orders/', orderData),
  getUserOrders: () => api.get('orders/'),
};

export const adminService = {
  getProducts: (params) => api.get('products/', { params }),
  createProduct: (data) => api.post('products/', data),
  updateProduct: (id, data) => api.patch(`products/${id}/`, data),
  deleteProduct: (id) => api.delete(`products/${id}/`),
  bulkUploadProducts: (formData) => api.post('products/bulk_upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkExportProducts: () => api.get('products/bulk_export/', { responseType: 'blob' }),
  getCategories: (params) => api.get('categories/', { params }),
  createCategory: (data) => api.post('categories/', data),
  updateCategory: (id, data) => api.put(`categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`categories/${id}/`),
  getBrands: (params) => api.get('products/brands/', { params }),
  createBrand: (data) => api.post('products/brands/', data),
  getOrders: (params) => api.get('orders/', { params }),
  getOrderDetail: (id) => api.get(`orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`orders/${id}/update_status/`, { status }),
  getDashboardStats: () => api.get('users/dashboard-stats/'),
  getRiders: (params) => api.get('tracking/riders/', { params }),
  createRider: (data) => api.post('tracking/riders/', data),
  updateRider: (id, data) => api.patch(`tracking/riders/${id}/`, data),
  deleteRider: (id) => api.delete(`tracking/riders/${id}/`),
  getRiderStats: () => api.get('tracking/riders/admin_rider_stats/'),
  getRiderWallet: () => api.get('tracking/riders/wallet/'),
  getRiderSalary: () => api.get('tracking/riders/salary_details/'),
  getRiderAttendance: () => api.get('tracking/attendance/'),
  punchIn: () => api.post('tracking/attendance/punch_in/'),
  punchOut: () => api.post('tracking/attendance/punch_out/'),
  getRiderTasks: () => api.get('tracking/riders/active_tasks/'),
  initializeDispatch: (id) => api.post(`orders/${id}/initialize_dispatch/`),
  autoAssignRider: (id) => api.post(`tracking/shipments/${id}/assign_nearest_rider/`),
  updateShipmentStatus: (id, status) => api.patch(`tracking/shipments/${id}/update_dispatch_status/`, { status }),
};

export const trackingService = {
  getGlobalTrackingSummary: () => api.get('tracking/shipments/tracking_summary/'),
  getTrackingDetails: (shipmentId) => api.get(`tracking/shipments/${shipmentId}/track/`),
  updateRiderLocation: (shipmentId, data) => api.post(`tracking/shipments/${shipmentId}/rider-location/`, data),
};

export const paymentService = {
  getPayments: (params) => api.get('payments/', { params }),
  updatePaymentStatus: (id, status) => api.patch(`payments/${id}/update_status/`, { status }),
  getPaymentStats: () => api.get('payments/dashboard_stats/'),
  bulkExportPayments: () => api.get('payments/bulk_export/', { responseType: 'blob' }),
  getVendorPayouts: (params) => api.get('payments/vendor-payouts/', { params }),
  updatePayoutStatus: (id) => api.post(`payments/vendor-payouts/${id}/mark_as_paid/`),
  
  // Rider Finance
  getCODCollections: (params) => api.get('tracking/cod-collections/', { params }),
  submitCOD: (id, data) => api.post(`tracking/cod-collections/${id}/mark_submitted/`, data),
  getRiderFinancialLogs: (params) => api.get('tracking/financial-logs/', { params }),
  getRiderSettlements: (params) => api.get('tracking/settlements/', { params }),
  runPayroll: (data) => api.post('tracking/settlements/run_payroll/', data),
  payRider: (id, data) => api.post(`tracking/settlements/${id}/pay_rider/`, data),
};

export const vendorService = {
  getVendors: (params) => api.get('vendors/', { params }),
  signup: (data) => api.post('vendors/signup/', data),

  approve: (id) => api.post(`vendors/${id}/approve/`),
  reject: (id) => api.post(`vendors/${id}/reject/`),
};

export const riderService = {
  getRiders: (params) => api.get('tracking/riders/', { params }),
  getOpenQueue: () => api.get('tracking/shipments/open_queue/'),
  acceptShipment: (id) => api.post(`tracking/shipments/${id}/accept_shipment/`),
  updateStatus: (id, status) => api.patch(`tracking/shipments/${id}/update_dispatch_status/`, { status }),
  markDelivered: (id) => api.post(`tracking/shipments/${id}/mark_delivered/`),
};

export const platformService = {
  getSettings: () => api.get('core/settings/'),
  updateSettings: (data) => api.patch('core/settings/update_settings/', data),
};

export const promotionService = {
  getBanners: () => api.get('promotions/banners/'),
  getVendorBanners: () => api.get('promotions/banners/', { params: { vendor_view: 'true' } }),
  submitBanner: (formData) => api.post('promotions/banners/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, formData) => api.patch(`promotions/banners/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`promotions/banners/${id}/`),
};

export default api;
