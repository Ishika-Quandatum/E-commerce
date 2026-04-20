import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

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
    if (error.response?.status === 401 && !error.config.url.includes('login')) {
      console.warn("Unauthorized - token may be invalid");
    }
    return Promise.reject(error);
  }
);
export const authService = {
  login: (credentials) => api.post('users/login/', credentials),
  register: (userData) => api.post('users/register/', userData),
  getProfile: () => api.get('users/profile/'),
};

export const productService = {
  getCategories: () => api.get('categories/'),
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
  getOrders: (params) => api.get('orders/', { params }),
  getOrderDetail: (id) => api.get(`orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`orders/${id}/update_status/`, { status }),
  getDashboardStats: () => api.get('users/dashboard-stats/'),
};

export const paymentService = {
  getPayments: (params) => api.get('payments/', { params }),
  updatePaymentStatus: (id, status) => api.patch(`payments/${id}/update_status/`, { status }),
  getPaymentStats: () => api.get('payments/dashboard_stats/'),
  getVendorPayouts: (params) => api.get('payments/vendor-payouts/', { params }),
  updatePayoutStatus: (id) => api.post(`payments/vendor-payouts/${id}/mark_as_paid/`),
};

export const vendorService = {
  getVendors: (params) => api.get('vendors/', { params }),
  signup: (data) => api.post('vendors/signup/', data),

  approve: (id) => api.post(`vendors/${id}/approve/`),
  reject: (id) => api.post(`vendors/${id}/reject/`),
};

export default api;
