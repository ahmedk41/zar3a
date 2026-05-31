import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guard: blocks BUYER from accessing a route, redirects to home
const NoBuyerGuard = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "BUYER") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Guard: blocks users without an approved role (pending-role users)
const ApprovedUserGuard = ({ children }) => {
  const { user } = useAuth();
  // If user has no approved role, they are still pending
  if (!user?.role || !user?.isApproved) {
    // Admin is always approved
    if (user?.role === 'ADMIN') return children;
    return <Navigate to="/" replace />;
  }
  return children;
};

// Redirect: routes "/profile" to the user's role-specific profile page
const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const roleToUse = user.role || user.pendingRole;

  switch (roleToUse) {
    case 'FARMER':
      return <Navigate to="/profile/farmer" replace />;
    case 'SUPPLIER':
      return <Navigate to="/profile/supplier" replace />;
    case 'BUYER':
      return <Navigate to="/profile/buyer" replace />;
    case 'AGRO_EXPERT':
      return <Navigate to="/profile/expert" replace />;
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Layouts
import MainLayout from "../layouts/MainLayout/MainLayout";

// Pages
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
// import Sensors from "../pages/Sensors/Sensors";
import Marketplace from "../pages/Marketplace/Marketplace";
import CropMarket from "../pages/Marketplace/CropMarket";
import AgriShop from "../pages/Marketplace/AgriShop";
import Experts from "../pages/Experts/Experts";
import AIAssistant from "../pages/AIAssistant/AIAssistant";
import Notifications from "../pages/Notifications/Notifications";
import Chat from "../pages/Chat/Chat";
import TrackOrders from "../pages/TrackOrders/TrackOrders";
import Payment from "../pages/Payment/Payment";
import NotFound from "../pages/NotFound/NotFound";
import Settings from "../pages/Settings/Settings";
import Admin from "../pages/Admin/Admin";
// ✅ Import role-specific profile pages
import FarmerProfile from "../pages/Profiles/FarmerProfile";
import BuyerProfile from "../pages/Profiles/BuyerProfile";
import SupplierProfile from "../pages/Profiles/SupplierProfile";
import ExpertProfile from "../pages/Profiles/ExpertProfile";
import AdminProfile from "../pages/Profiles/AdminProfile";
import ExpertConsultations from "../pages/Profiles/ExpertConsultations";
import AdminChat from "../pages/Chat/AdminChat";
import UserChat from "../pages/Chat/UserChat";
import ProductsDashboard from "../pages/Dashboard/ProductsDashboard";

const router = createBrowserRouter([
  // 1. Auth Routes
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  // 2. App Routes - Inside MainLayout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      // { path: "sensors", element: <Sensors /> },
      { path: "marketplace", element: <Marketplace /> },
      { path: "crop-market", element: <CropMarket /> },
      { path: "agri-shop", element: <AgriShop /> },
      { path: "experts", element: <NoBuyerGuard><Experts /></NoBuyerGuard> },
      { path: "chatbot", element: <ApprovedUserGuard><AIAssistant /></ApprovedUserGuard> },
      { path: "chat", element: <UserChat /> },
      { path: "chat/:expertId", element: <Chat /> },
      { path: "admin/chat", element: <AdminChat /> },
      { path: "messages", element: <UserChat /> },
      { path: "notifications", element: <Notifications /> },
      { path: "track-orders", element: <TrackOrders /> },
      { path: "payment", element: <Payment /> },
      { path: "settings", element: <Settings /> },
      { path: "admin", element: <Admin /> },
      { path: "products-dashboard", element: <ProductsDashboard /> },
      { path: "profile/farmer", element: <FarmerProfile /> },
      { path: "profile/buyer", element: <BuyerProfile /> },
      { path: "profile/supplier", element: <SupplierProfile /> },
      { path: "profile/expert", element: <ExpertProfile /> },
      { path: "profile/admin", element: <AdminProfile /> },
      { path: "profile", element: <ProfileRedirect /> },
      { path: "consultations", element: <ExpertConsultations /> },
    ],
  },

  // 3. Fallback Route
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;