import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add the JWT token to headers
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

// Add a response interceptor to handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get unauthorized, clear the dead token so public endpoints work again
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Optional: trigger an event or reload if needed
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
  placeOrder: (orderData) => api.post('orders/place/', orderData),
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
  updateOrderStatus: (id, status) => api.put(`orders/${id}/`, { status }),
  getPayments: () => api.get('payments/'),
  updatePaymentStatus: (id, status) => api.put(`payments/${id}/`, { status }),
};

export default api;
