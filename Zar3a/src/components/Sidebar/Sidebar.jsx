import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  LuLayoutDashboard,
  LuShoppingBag,
  LuUsers,
  LuMessageSquare,
  LuBell,
  LuSettings,
  LuListChecks,
  LuShield,
} from "react-icons/lu";

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const menuItems = [];

  // Dashboard: Only for FARMER, ADMIN (NOT for EXPERT, SUPPLIER, or BUYER)
  if (user?.role && !['AGRO_EXPERT', 'SUPPLIER', 'BUYER'].includes(user.role)) {
    menuItems.push({ path: "/dashboard", label: t("nav.dashboard"), icon: <LuLayoutDashboard /> });
  }

  // Track Orders: For all registered users
  if (user?.role) {
    menuItems.push({ path: "/track-orders", label: t("nav.trackOrders"), icon: <LuListChecks /> });
  }

  // Marketplace: Everyone (including unregistered)
  menuItems.push({ path: "/marketplace", label: t("nav.marketplace"), icon: <LuShoppingBag /> });

  // Experts: Hide from BUYER and unregistered users
  if (user?.role && user.role !== 'BUYER') {
    menuItems.push({ path: "/experts", label: t("nav.experts"), icon: <LuUsers /> });
  }

  // AI Assistant: Hide from unregistered users and AGRO_EXPERT
  if (user?.role && user.role !== 'AGRO_EXPERT') {
    menuItems.push({ path: "/chatbot", label: t("nav.aiAssistant"), icon: <LuMessageSquare /> });
  }

  // Notifications: Hide from unregistered users
  if (user?.role) {
    menuItems.push({ path: "/notifications", label: t("nav.notifications"), icon: <LuBell /> });
  }

  // Admin Panel: Only for ADMIN
  if (user?.role === 'ADMIN') {
    menuItems.push({ path: "/admin", label: t("nav.adminPanel"), icon: <LuShield /> });
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 hidden md:flex flex-col sticky top-16 h-[calc(100vh-64px)] transition-colors"
    >
      <div className="p-4 flex-1 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("nav.mainMenu")}</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-green-600"
              }`
            }
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Settings Section at the Bottom - Only for registered users */}
      {user?.role && (
        <div className="p-4 border-t border-gray-50 dark:border-slate-800">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`
            }
          >
            <LuSettings className="text-xl shrink-0" />
            <span>{t("nav.settings")}</span>
          </NavLink>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;