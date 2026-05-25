import axios from "axios";

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5002"}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * ─────────────────────────────────────────────────────────
 * MARKETPLACE API (Crop & Agri Split)
 * ─────────────────────────────────────────────────────────
 */
export const marketplaceAPI = {
  // CROP MARKET
  getCropMarketProducts: () => api.get('/marketplace/crop-products'),
  createCropMarketProduct: (data) => api.post('/marketplace/crop-products', data),

  // AGRI SHOP
  getAgriShopProducts: () => api.get('/marketplace/agri-products'),
  createAgriShopProduct: (data) => api.post('/marketplace/agri-products', data),

  // SEARCH
  searchProducts: (q, marketplace, category) =>
    api.get('/marketplace/search', { params: { q, marketplace, category } }),

  getProductById: (productId) => api.get(`/marketplace/products/${productId}`),

  // EXPERT LISTINGS
  getExpertListings: () => api.get('/marketplace/expert-listings'),
  createExpertListing: (data) => api.post('/marketplace/expert-listings', data),
};

/**
 * ─────────────────────────────────────────────────────────
 * ORDERS & CHECKOUT API
 * ─────────────────────────────────────────────────────────
 */
export const ordersAPI = {
  // Create single-product order
  createOrder: (productId, quantity, shippingAddress, paymentMethod) =>
    api.post('/orders', { productId, quantity, shippingAddress, paymentMethod }),

  // Checkout multiple cart items
  checkout: (items, shippingAddress, paymentMethod) =>
    api.post('/orders/checkout', { items, shippingAddress, paymentMethod }),

  // Get user's orders (filtered by role/marketplace)
  getUserOrders: () => api.get('/orders'),

  // Get specific order
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),

  // Update order status (admin only)
  updateOrderStatus: (orderId, status) =>
    api.patch(`/orders/${orderId}/status`, { status }),

  // Get all orders (admin only)
  listAllOrders: () => api.get('/orders/admin/all'),
};

/**
 * ─────────────────────────────────────────────────────────
 * PAYMENTS API (Stripe)
 * ─────────────────────────────────────────────────────────
 */
export const paymentsAPI = {
  // Create Stripe payment intent
  createPaymentIntent: (orderId) =>
    api.post('/payments/intent', { orderId }),

  // Confirm payment after success
  confirmPayment: (orderId, paymentIntentId) =>
    api.post('/payments/confirm', { orderId, paymentIntentId }),

  // Check payment status
  getPaymentStatus: (orderId) =>
    api.get(`/payments/${orderId}/status`),
};

/**
 * ─────────────────────────────────────────────────────────
 * CHAT API
 * ─────────────────────────────────────────────────────────
 */
export const chatAPI = {
  sendMessage: (receiverId, message, attachmentUrl) =>
    api.post('/chat/messages', { receiverId, message, attachmentUrl }),

  getChatHistory: (userId, page = 1, limit = 50) =>
    api.get(`/chat/messages/${userId}`, { params: { page, limit } }),

  getConversations: (page = 1, limit = 20) =>
    api.get('/chat/conversations', { params: { page, limit } }),

  markMessageAsRead: (messageId) =>
    api.put(`/chat/messages/${messageId}/read`),

  getUnreadCount: () =>
    api.get('/chat/unread-count'),
};

/**
 * ─────────────────────────────────────────────────────────
 * TRACKING API
 * ─────────────────────────────────────────────────────────
 */
export const trackingAPI = {
  getOrderTracking: (params = {}) =>
    api.get('/tracking/orders', { params }),

  getProductTracking: (productId) =>
    api.get(`/tracking/products/${productId}`),
};

/**
 * ─────────────────────────────────────────────────────────
 * CART API
 * ─────────────────────────────────────────────────────────
 */
export const cartAPI = {
  getCart: () => api.get('/cart'),
  updateCart: (items) => api.put('/cart', { items }),
  clearCart: () => api.delete('/cart'),
};

export default api;
