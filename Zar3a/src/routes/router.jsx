import { createBrowserRouter } from "react-router-dom";

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
import ExpertConsultations from "../pages/Profiles/ExpertConsultations"; 
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
      { path: "experts", element: <Experts /> },
      { path: "chatbot", element: <AIAssistant /> },
      { path: "chat", element: <Chat /> },
      { path: "chat/:expertId", element: <Chat /> },
      { path: "notifications", element: <Notifications /> },
      { path: "track-orders", element: <TrackOrders /> },
      { path: "payment", element: <Payment /> },
      { path: "settings", element: <Settings /> },
      { path: "admin", element: <Admin /> },
      { path: "products-dashboard", element: <ProductsDashboard /> },
      // ✅ Role-specific profile pages
      { path: "profile/farmer", element: <FarmerProfile /> },
      { path: "profile/buyer", element: <BuyerProfile /> },
      { path: "profile/supplier", element: <SupplierProfile /> },
      { path: "profile/expert", element: <ExpertProfile /> },
      { path: "profile", element: <ExpertProfile /> },
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