import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
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
  const menuItems = [];

  // Dashboard: Only for FARMER, BUYER, ADMIN (NOT for EXPERT or SUPPLIER)
  if (user?.role && !['AGRO_EXPERT', 'SUPPLIER'].includes(user.role)) {
    menuItems.push({ path: "/dashboard", label: "Dashboard", icon: <LuLayoutDashboard /> });
  }

  // Track Orders: ONLY for FARMER, SUPPLIER, ADMIN (NOT BUYER or AGRO_EXPERT)
  if (user?.role && ['FARMER', 'SUPPLIER', 'ADMIN'].includes(user.role)) {
    menuItems.push({ path: "/track-orders", label: "Track Orders", icon: <LuListChecks /> });
  }

  // Marketplace: Everyone (including unregistered)
  menuItems.push({ path: "/marketplace", label: "Marketplace", icon: <LuShoppingBag /> });

  // Experts: Hide from unregistered users only
  if (user?.role) {
    menuItems.push({ path: "/experts", label: "Experts", icon: <LuUsers /> });
  }

  // AI Assistant: Hide from unregistered users and AGRO_EXPERT
  if (user?.role && user.role !== 'AGRO_EXPERT') {
    menuItems.push({ path: "/chatbot", label: "AI Assistant", icon: <LuMessageSquare /> });
  }

  // Notifications: Hide from unregistered users
  if (user?.role) {
    menuItems.push({ path: "/notifications", label: "Notifications", icon: <LuBell /> });
  }

  // Admin Panel: Only for ADMIN
  if (user?.role === 'ADMIN') {
    menuItems.push({ path: "/admin", label: "Admin Panel", icon: <LuShield /> });
  }

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 hidden md:flex flex-col sticky top-16 h-[calc(100vh-64px)] transition-colors"
    >
      <div className="p-4 flex-1 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-green-600"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
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
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`
            }
          >
            <LuSettings className="text-xl" />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;