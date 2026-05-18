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

export const addressService = {
  getAddresses: () => api.get('users/addresses/'),
  createAddress: (data) => api.post('users/addresses/', data),
  updateAddress: (id, data) => api.patch(`users/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`users/addresses/${id}/`),
};

export const productService = {
  getCategories: (params) => api.get('categories/', { params }),
  getProducts: (params) => api.get('products/', { params }),
  getProductDetail: (id) => api.get(`products/${id}/`),
};

export const reviewService = {
  getReviews: (params) => api.get('products/reviews/', { params }),
  createReview: (data) => api.post('products/reviews/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  markHelpful: (id) => api.patch(`products/reviews/${id}/helpful/`),
  updateReview: (id, data) => api.patch(`products/reviews/${id}/`, data),
  deleteReview: (id) => api.delete(`products/reviews/${id}/`),
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
  updateCategory: (id, data) => api.patch(`categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`categories/${id}/`),
  getBrands: (params) => api.get('products/brands/', { params }),
  createBrand: (data) => api.post('products/brands/', data),
  updateBrand: (id, data) => api.patch(`products/brands/${id}/`, data),
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
  getProductStats: () => api.get('products/admin_stats/'),
  addRiderBonus: (id, data) => api.post(`tracking/riders/${id}/add_bonus/`, data),
  updateRiderSalaryConfig: (id, data) => api.post(`tracking/riders/${id}/update_salary_config/`, data),
};

export const trackingService = {
  getGlobalTrackingSummary: () => api.get('tracking/shipments/tracking_summary/'),
  getTrackingDetails: (shipmentId) => api.get(`tracking/shipments/${shipmentId}/track/`),
  updateRiderLocation: (shipmentId, data) => api.post(`tracking/shipments/${shipmentId}/rider-location/`, data),
};

export const paymentService = {
  getPayments: (params) => api.get('payments/', { params }),
  getPaymentDetail: (id) => api.get(`payments/${id}/`),
  updatePaymentStatus: (id, status) => api.patch(`payments/${id}/update_status/`, { status }),
  refundPayment: (id, data) => api.post(`payments/${id}/refund/`, data),
  getPaymentStats: () => api.get('payments/dashboard_stats/'),
  bulkExportPayments: () => api.get('payments/bulk_export/', { responseType: 'blob' }),
  getVendorPayouts: (params) => api.get('payments/vendor-payouts/', { params }),
  getVendorPayoutStats: () => api.get('payments/vendor-payouts/dashboard_stats/'),
  getVendorPayoutStatsForVendor: (params) => api.get('payments/vendor-payouts/vendor_payout_stats/', { params }),
  updatePayoutStatus: (id, data) => api.post(`payments/vendor-payouts/${id}/mark_as_paid/`, data),
  holdPayout: (id) => api.post(`payments/vendor-payouts/${id}/hold/`),
  approvePayout: (id) => api.post(`payments/vendor-payouts/${id}/approve/`),
  bulkPayout: (data) => api.post('payments/vendor-payouts/bulk_payout/', data),
  downloadPayoutInvoice: (id) => api.get(`payments/vendor-payouts/${id}/download_invoice/`, { responseType: 'blob' }),
  downloadPayoutStatement: (params) => api.get('payments/vendor-payouts/download_statement/', { params, responseType: 'blob' }),
  
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
  getVendorDetail: (id) => api.get(`vendors/${id}/`),
  getVendorProducts: (id, params) => api.get('products/', { params: { ...params, vendor: id } }),
  followVendor: (id) => api.post(`vendors/${id}/follow/`),
  isFollowing: (id) => api.get(`vendors/${id}/is_following/`),
  signup: (data) => api.post('vendors/signup/', data),

  approve: (id) => api.post(`vendors/${id}/approve/`),
  reject: (id) => api.post(`vendors/${id}/reject/`),

  // Profile & Settings
  getProfile: () => api.get('vendors/profile/'),
  updateProfile: (data) => api.patch('vendors/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateSettings: (data) => api.patch('vendors/vendor_settings/', data),
};

export const riderService = {
  getRiders: (params) => api.get('tracking/riders/', { params }),
  getOpenQueue: () => api.get('tracking/shipments/open_queue/'),
  acceptShipment: (id) => api.post(`tracking/shipments/${id}/accept_shipment/`),
  updateStatus: (id, status) => api.patch(`tracking/shipments/${id}/update_dispatch_status/`, { status }),
  markDelivered: (id) => api.post(`tracking/shipments/${id}/mark_delivered/`),
  
  // New Finance APIs
  getWallet: () => api.get('tracking/riders/wallet/'),
  submitWalletCOD: (data) => api.post('tracking/wallet-transactions/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getWalletTransactions: (params) => api.get('tracking/wallet-transactions/', { params }),
  getSalaryTransactions: (params) => api.get('tracking/salary-transactions/', { params }),
  getSettlements: (params) => api.get('tracking/settlements/', { params }),
  verifyCODSubmission: (id, data) => api.post(`tracking/wallet-transactions/${id}/verify_submission/`, data),
  paySalary: (id) => api.post(`tracking/settlements/${id}/pay_salary/`),
  // Rider Onboarding
  register: (formData) => api.post('tracking/riders/register/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPendingRequests: () => api.get('tracking/riders/pending_requests/'),
  updateVerificationStatus: (id, data) => api.patch(`tracking/riders/${id}/update_verification_status/`, data),
  getRiderDashboardStats: () => api.get('tracking/riders/dashboard_stats/'),
  getActiveTask: () => api.get('tracking/shipments/current_active_task/'),
  getMyProfile: () => api.get('tracking/riders/my_profile/'),
  updateMyProfile: (data) => api.patch('tracking/riders/my_profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStats: () => api.get('tracking/riders/stats/'),
};

export const platformService = {
  getSettings: () => api.get('core/settings/'),
  updateSettings: (data) => api.patch('core/settings/update_settings/', data),
  getPlatformStats: () => api.get('core/settings/platform_stats/'),
};

export const returnService = {
  getReturnRequests: (params) => api.get('returns/requests/', { params }),
  getReturnDetail: (id) => api.get(`returns/requests/${id}/`),
  createReturnRequest: (formData) => api.post('returns/requests/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateReturnStatus: (id, data) => api.post(`returns/requests/${id}/update_status/`, data),
  assignRider: (id, data) => api.post(`returns/requests/${id}/assign_rider/`, data),
  inspectReturn: (id, formData) => api.post(`returns/requests/${id}/inspect/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getReturnPolicies: () => api.get('returns/policies/'),
};

export const promotionService = {
  getBanners: () => api.get('promotions/banners/'),
  getVendorBanners: () => api.get('promotions/banners/', { params: { vendor_view: 'true' } }),
  submitBanner: (formData) => api.post('promotions/banners/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, formData) => api.patch(`promotions/banners/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`promotions/banners/${id}/`),
};

export const payrollService = {
  getRules: () => api.get('payroll/rules/'),
  createRule: (data) => api.post('payroll/rules/', data),
  updateRule: (id, data) => api.patch(`payroll/rules/${id}/`, data),
  deleteRule: (id) => api.delete(`payroll/rules/${id}/`),

  // New Specialized Rules
  getBonusRules: () => api.get('payroll/bonus-rules/'),
  createBonusRule: (data) => api.post('payroll/bonus-rules/', data),
  updateBonusRule: (id, data) => api.patch(`payroll/bonus-rules/${id}/`, data),
  deleteBonusRule: (id) => api.delete(`payroll/bonus-rules/${id}/`),

  getPenaltyRules: () => api.get('payroll/penalty-rules/'),
  createPenaltyRule: (data) => api.post('payroll/penalty-rules/', data),
  updatePenaltyRule: (id, data) => api.patch(`payroll/penalty-rules/${id}/`, data),
  deletePenaltyRule: (id) => api.delete(`payroll/penalty-rules/${id}/`),

  getConfig: () => api.get('payroll/config/'),
  updateConfig: (data) => api.patch('payroll/config/update_config/', data),
  
  getPayrollStats: () => api.get('payroll/manage/'),
  runPayroll: (id) => api.post(`payroll/manage/${id}/run_payroll/`),
  markPaid: (id, data) => api.post(`payroll/manage/${id}/mark_paid/`, data),
  
  getSettlements: (params) => api.get('payroll/settlements/', { params }),
  getWallets: (params) => api.get('payroll/wallets/', { params }),
};

export default api;
