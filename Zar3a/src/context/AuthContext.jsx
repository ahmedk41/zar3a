import { createContext, useContext, useState, useEffect } from "react";
import api, { marketplaceAPI } from "../API/axiosInstance";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = async () => {
    if (!localStorage.getItem("accessToken")) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);

      const resList = await api.get('/notifications', { params: { limit: 100 } });
      setNotifications(resList.data.notifications || []);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Restore session on mount
  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────────

  /**
   * Step 1 – Register a new account.
   * Returns { userId } to use in choose-role & complete-profile calls.
   */
  const register = async ({ fullName, username, email, phone, password }) => {
    const { data } = await api.post("/auth/register", {
      fullName,
      username,
      email,
      phone,
      password,
    });
    return data; // { userId }
  };

  /**
   * Step 2 – Choose role for a just-registered user.
   * role: 'FARMER' | 'BUYER' | 'SUPPLIER' | 'AGRO_EXPERT'
   */
  const chooseRole = async (userId, role) => {
    const { data } = await api.post(`/auth/choose-role/${userId}`, { role });
    return data;
  };

  /**
   * Step 3 – Complete role-specific profile.
   */
  const completeFarmerProfile = async (userId, { farmSize, soilType, location, sensorId }) => {
    const { data } = await api.post(`/auth/complete/farmer/${userId}`, {
      farmSize,
      soilType,
      location,
      sensorId,
    });
    return data;
  };

  const completeBuyerProfile = async (userId) => {
    const { data } = await api.post(`/auth/complete/buyer/${userId}`, {});
    return data;
  };

  const completeSupplierProfile = async (userId, { tradeLicense, location }) => {
    const { data } = await api.post(`/auth/complete/supplier/${userId}`, {
      tradeLicense,
      location,
    });
    return data;
  };

  const completeExpertProfile = async (userId, formData) => {
    // formData is a FormData object (includes CV file)
    const { data } = await api.post(
      `/auth/complete/expert/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    try {
      const { data: currentUser } = await api.get("/auth/me");
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(data.user);
      return data.user;
    }
  };

  /** Logout: revokes refresh token on server, clears local state, redirects to home. */
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // ignore server errors on logout
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    // Redirect to home page
    window.location.href = '/';
  };

  /** Re-fetch the current user from the server. */
  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  };

  // ── Admin functions ─────────────────────────────────────────────────────────

  /**
   * Get all pending agro-expert requests (ADMIN ONLY)
   */
  const getPendingExperts = async () => {
    const { data } = await api.get("/auth/admin/pending-experts");
    return data;
  };

  /**
   * Approve a pending agro-expert (ADMIN ONLY)
   */
  const approveExpert = async (userId) => {
    const { data } = await api.post(`/auth/admin/approve-expert/${userId}`);
    return data;
  };

  /** Reject a pending agro-expert request (ADMIN ONLY) */
  const rejectExpert = async (userId) => {
    const { data } = await api.post(`/auth/admin/reject-expert/${userId}`);
    return data;
  };

  /**
   * Get all pending users: Experts, Farmers, Suppliers (ADMIN ONLY)
   */
  const getPendingUsers = async () => {
    const { data } = await api.get("/auth/admin/pending-users");
    return data;
  };

  /**
   * Approve a pending user (ADMIN ONLY)
   */
  const approveUser = async (userId) => {
    const { data } = await api.post(`/auth/admin/approve-user/${userId}`);
    return data;
  };

  /**
   * Reject a pending user (ADMIN ONLY)
   */
  const rejectUser = async (userId) => {
    const { data } = await api.post(`/auth/admin/reject-user/${userId}`);
    return data;
  };

  /**
   * Promote a user to admin (ADMIN ONLY)
   */
  const promoteToAdmin = async (userId) => {
    const { data } = await api.post(`/auth/admin/promote/${userId}`);
    return data;
  };

  const getAllUsers = async (params = {}) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  };

  const changeUserRole = async (userId, newRole) => {
    const { data } = await api.post(`/admin/users/${userId}/role`, { newRole });
    return data;
  };

  const deleteUserById = async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  };

  const getAdminStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  };

  const getNotifications = async (params = {}) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  };

  const getUnreadNotificationCount = async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  };

  const markNotificationRead = async (notificationId) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    setNotifications(prev => prev.map(n => n.id === Number(notificationId) ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    return data;
  };

  const markAllNotificationsRead = async () => {
    const { data } = await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    return data;
  };

  const deleteNotificationById = async (notificationId) => {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    setNotifications(prev => {
      const target = prev.find(n => n.id === Number(notificationId));
      if (target && !target.isRead) {
        setUnreadCount(u => Math.max(0, u - 1));
      }
      return prev.filter(n => n.id !== Number(notificationId));
    });
    return data;
  };

  const sendChatMessage = async (receiverId, message, file) => {
    // If a file is provided, use the multipart upload endpoint
    if (file) {
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('message', message || '');
      formData.append('file', file);
      const { data } = await api.post('/chat/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    }
    // Otherwise use the standard JSON endpoint
    const { data } = await api.post('/chat/messages', { receiverId, message });
    return data;
  };

  const getChatHistory = async (conversationUserId, params = {}) => {
    const { data } = await api.get(`/chat/messages/${conversationUserId}`, { params });
    return data;
  };

  const getConversations = async (params = {}) => {
    const { data } = await api.get('/chat/conversations', { params });
    return data;
  };

  const markChatMessageRead = async (messageId) => {
    const { data } = await api.put(`/chat/messages/${messageId}/read`);
    return data;
  };

  const deleteChatMessage = async (messageId) => {
    const { data } = await api.delete(`/chat/messages/${messageId}`);
    return data;
  };

  const getOrderTracking = async (params = {}) => {
    const { data } = await api.get('/tracking/orders', { params });
    return data;
  };

  const getTrackingOrders = async (params = {}) => {
    let url = '/orders/admin';
    if (user?.role === 'FARMER') {
      url = '/orders/farmer';
    } else if (user?.role === 'SUPPLIER') {
      url = '/orders/supplier';
    }
    const { data } = await api.get(url, { params });
    
    const items = [];
    const seenIds = new Set();
    const ordersList = data.orders || [];
    
    ordersList.forEach((order) => {
      if (order.OrderItems) {
        order.OrderItems.forEach((item) => {
          const itemKey = `${item.id}-${order.id}`;
          if (seenIds.has(itemKey)) return;
          seenIds.add(itemKey);

          items.push({
            id: `orderitem-${item.id}`,
            orderId: order.id,
            productId: item.productId,
            type: 'PURCHASE',
            title: item.title,
            description: item.description,
            category: item.category,
            price: item.price,
            unit: item.unit,
            region: item.region,
            imageUrl: item.imageUrl,
            marketplaceType: item.marketplaceType,
            productSource: item.productSource,
            status: order.status,
            paymentStatus: order.paymentStatus,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            User: order.User,
            Product: item.Product,
            createdAt: item.createdAt,
          });
        });
      }
    });

    return { items };
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put("/auth/me", profileData);
    setUser(data.user);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put("/auth/me/password", { currentPassword, newPassword });
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (token, newPassword) => {
    const { data } = await api.post("/auth/reset-password", { token, newPassword });
    return data;
  };

  const verifyEmail = async (token) => {
    const { data } = await api.post("/auth/verify-email", { token });
    return data;
  };

  const getProducts = async () => {
    const [cropResponse, agriResponse] = await Promise.all([
      marketplaceAPI.getCropMarketProducts(),
      marketplaceAPI.getAgriShopProducts(),
    ]);

    const cropProducts = cropResponse.data.products || cropResponse.data;
    const agriProducts = agriResponse.data.products || agriResponse.data;

    return [...cropProducts, ...agriProducts];
  };

  const createProduct = async (productData) => {
    let type = "CROP_MARKET";
    if (productData instanceof FormData) {
      type = productData.get("marketplaceType") || productData.get("type") || "CROP_MARKET";
    } else {
      type = productData.marketplaceType || productData.type || "CROP_MARKET";
    }
    let response;

    if (type === "AGRI_MARKET" || type === "agri") {
      response = await marketplaceAPI.createAgriShopProduct(productData);
    } else {
      response = await marketplaceAPI.createCropMarketProduct(productData);
    }

    return response.data;
  };

  const getExpertListings = async () => {
    const { data } = await api.get("/marketplace/expert-listings");
    return data;
  };

  const checkout = async (items, paymentDetails = {}) => {
    const { data } = await api.post('/orders/checkout', { items, ...paymentDetails });
    return data;
  };

  const getUserOrders = async () => {
    const { data } = await api.get('/orders');
    return data;
  };


  const createExpertListing = async (listingData) => {
    const { data } = await api.post("/marketplace/expert-listings", listingData);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        chooseRole,
        completeFarmerProfile,
        completeBuyerProfile,
        completeSupplierProfile,
        completeExpertProfile,
        refreshUser,
        setUser,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        getProducts,
        createProduct,
        getExpertListings,
        createExpertListing,
        // Cart & Checkout
        checkout,
        getUserOrders,
        // Admin functions
        getPendingExperts,
        approveExpert,
        rejectExpert,
        getPendingUsers,
        approveUser,
        rejectUser,
        promoteToAdmin,
        getAllUsers,
        changeUserRole,
        deleteUserById,
        getAdminStats,
        // Notifications
        notifications,
        unreadCount,
        refreshNotifications,
        getNotifications,
        getUnreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotificationById,
        // Chat
        sendChatMessage,
        getChatHistory,
        getConversations,
        markChatMessageRead,
        deleteChatMessage,
        // Tracking
        getOrderTracking,
        getTrackingOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
