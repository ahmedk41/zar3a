import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  LuLogOut,
  LuUser,
  LuX,
} from "react-icons/lu";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size to switch layout modes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  const getProfileLink = () => {
    if (!user?.role && !user?.pendingRole) return null;
    const roleToUse = user.role || user.pendingRole;
    const profileMap = {
      'FARMER': '/profile/farmer',
      'BUYER': '/profile/buyer',
      'SUPPLIER': '/profile/supplier',
      'AGRO_EXPERT': '/profile/expert',
      'ADMIN': '/profile/admin',
    };
    return profileMap[roleToUse] || null;
  };
  
  const profileLink = getProfileLink();
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

  // Animation variants
  const mobileVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  const desktopVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: 256, opacity: 1 },
    exit: { width: 0, opacity: 0 }
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          initial={isMobile ? "hidden" : "hidden"}
          animate="visible"
          exit="exit"
          variants={isMobile ? mobileVariants : desktopVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={
            isMobile
              ? "fixed inset-y-0 start-0 z-50 w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 flex flex-col shadow-2xl transition-colors overflow-hidden h-full"
              : "sticky top-20 h-[calc(100vh-80px)] w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 flex flex-col transition-colors overflow-hidden shrink-0 z-30"
          }
        >
          {/* Mobile Header with Close Button */}
          {isMobile && (
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-black text-lg text-emerald-600 uppercase tracking-wider">Zar3a</span>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LuX size={18} />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <div className="p-4 flex-1 space-y-2 overflow-y-auto">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("nav.mainMenu")}</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
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

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
            {/* My Profile - Mobile Only */}
            {isMobile && user && profileLink && (
              <NavLink
                to={profileLink}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`
                }
              >
                <LuUser className="text-xl shrink-0" />
                <span>{t("nav.myProfile")}</span>
              </NavLink>
            )}

            {/* Settings (Desktop + Mobile) */}
            {user?.role && (
              <NavLink
                to="/settings"
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`
                }
              >
                <LuSettings className="text-xl shrink-0" />
                <span>{t("nav.settings")}</span>
              </NavLink>
            )}

            {/* Logout/Sign In - Mobile Only */}
            {isMobile && (
              user ? (
                <button
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-start font-bold cursor-pointer"
                >
                  <LuLogOut className="text-xl shrink-0" />
                  <span>{t("nav.logout")}</span>
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
                >
                  <LuUser className="text-xl shrink-0" />
                  <span>{t("nav.signIn")}</span>
                </NavLink>
              )
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;