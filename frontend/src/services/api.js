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
    if (error.response?.status === 401) {
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
  getProducts: () => api.get('products/'),
  createProduct: (data) => api.post('products/', data),
  updateProduct: (id, data) => api.put(`products/${id}/`, data),
  deleteProduct: (id) => api.delete(`products/${id}/`),
  getCategories: () => api.get('categories/'),
  createCategory: (data) => api.post('categories/', data),
  updateCategory: (id, data) => api.put(`categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`categories/${id}/`),
  getOrders: () => api.get('orders/'),
  getOrderDetail: (id) => api.get(`orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`orders/${id}/update_status/`, { status }),
  getPayments: () => api.get('payments/'),
  updatePaymentStatus: (id, status) => api.patch(`payments/${id}/update_status/`, { status }),
};

export const vendorService = {
  getVendors: () => api.get('vendors/'),
  signup: (data) => api.post('vendors/signup/', data),

  approve: (id) => api.post(`vendors/${id}/approve/`),
  reject: (id) => api.post(`vendors/${id}/reject/`),
};

export default api;
