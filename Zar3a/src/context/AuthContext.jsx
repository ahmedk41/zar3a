import { createContext, useContext, useState, useEffect } from "react";
import api, { marketplaceAPI } from "../API/axiosInstance";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

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
  const completeFarmerProfile = async (userId, { farmSize, soilType, location }) => {
    const { data } = await api.post(`/auth/complete/farmer/${userId}`, {
      farmSize,
      soilType,
      location,
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
      formData
    );
    return data;
  };

  /** Login with email + password. Stores tokens and sets user state. */
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
    return data;
  };

  const markAllNotificationsRead = async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  };

  const deleteNotificationById = async (notificationId) => {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  };

  const sendChatMessage = async (receiverId, message, attachmentUrl) => {
    const { data } = await api.post('/chat/messages', { receiverId, message, attachmentUrl });
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
    const type = productData.marketplaceType || productData.type;
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
        promoteToAdmin,
        getAllUsers,
        changeUserRole,
        deleteUserById,
        getAdminStats,
        // Notifications
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
