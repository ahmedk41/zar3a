import { Link, NavLink } from "react-router-dom";
import {
  LuBell,
  LuUser,
  LuSun,
  LuMoon,
  LuMenu,
  LuX,
  LuLayoutDashboard,
  LuShoppingBag,
  LuUsers,
  LuMessageSquare,
  LuSettings,
  LuShield,
  LuLogOut,
  LuChevronDown,
  LuLanguages,
} from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import Logo from "../../assets/Logo.png";

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const { t, toggleLang, lang } = useLanguage();
  const { isDarkMode: isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get profile link based on user role
  const getProfileLink = () => {
    if (!user?.role && !user?.pendingRole) return null;
    const roleToUse = user.role || user.pendingRole;
    const profileMap = {
      'FARMER': '/profile/farmer',
      'BUYER': '/profile/buyer',
      'SUPPLIER': '/profile/supplier',
      'AGRO_EXPERT': '/profile/expert',
      'ADMIN': '/admin',
    };
    return profileMap[roleToUse] || null;
  };

  const profileLink = getProfileLink();

  const navMap = {
    ADMIN: [
      { path: "/dashboard",          label: t("nav.dashboard"),        icon: <LuLayoutDashboard /> },
      { path: "/products-dashboard", label: t("nav.productDashboard"), icon: <LuLayoutDashboard /> },
      { path: "/crop-market",        label: t("nav.cropMarket"),       icon: <LuShoppingBag /> },
      { path: "/agri-shop",          label: t("nav.agriShop"),         icon: <LuShoppingBag /> },
      { path: "/experts",            label: t("nav.experts"),          icon: <LuUsers /> },
      { path: "/chatbot",            label: t("nav.aiAssistant"),      icon: <LuMessageSquare /> },
      { path: "/track-orders",       label: t("nav.trackOrder"),       icon: <LuShoppingBag /> },
      { path: "/admin",              label: t("nav.admin"),            icon: <LuShield /> },
    ],
    FARMER: [
      { path: "/dashboard",          label: t("nav.smartFarming"),     icon: <LuLayoutDashboard /> },
      { path: "/products-dashboard", label: t("nav.productDashboard"), icon: <LuLayoutDashboard /> },
      { path: "/crop-market",        label: t("nav.cropMarket"),       icon: <LuShoppingBag /> },
      { path: "/agri-shop",          label: t("nav.agriShop"),         icon: <LuShoppingBag /> },
      { path: "/experts",            label: t("nav.experts"),          icon: <LuUsers /> },
      { path: "/track-orders",       label: t("nav.trackOrder"),       icon: <LuShoppingBag /> },
    ],
    SUPPLIER: [
      { path: "/products-dashboard", label: t("nav.productDashboard"), icon: <LuLayoutDashboard /> },
      { path: "/crop-market",        label: t("nav.cropMarket"),       icon: <LuShoppingBag /> },
      { path: "/agri-shop",          label: t("nav.agriShop"),         icon: <LuShoppingBag /> },
      { path: "/experts",            label: t("nav.experts"),          icon: <LuUsers /> },
      { path: "/track-orders",       label: t("nav.trackOrder"),       icon: <LuShoppingBag /> },
    ],
    BUYER: [
      { path: "/crop-market", label: t("nav.cropMarket"), icon: <LuShoppingBag /> },
      { path: "/agri-shop",   label: t("nav.agriShop"),   icon: <LuShoppingBag /> },
    ],
    AGRO_EXPERT: [
      { path: "/crop-market",   label: t("nav.cropMarket"),       icon: <LuShoppingBag /> },
      { path: "/agri-shop",     label: t("nav.agriShop"),         icon: <LuShoppingBag /> },
      { path: "/chatbot",       label: t("nav.aiAssistant"),      icon: <LuMessageSquare /> },
      { path: "/consultations", label: t("nav.consultations") || "Consultations", icon: <LuMessageSquare /> },
    ],
  };

  const navItems = user
    ? navMap[user?.role] || [{ path: "/marketplace", label: t("nav.marketplace"), icon: <LuShoppingBag /> }]
    : [{ path: "/marketplace", label: t("nav.marketplace"), icon: <LuShoppingBag /> }];

  const allNavItems = navItems;

  return (
    <>
      <nav className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 md:px-8 flex justify-between items-center sticky top-0 z-100 transition-all duration-500">

        <div className="flex items-center gap-4">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
          >
            <LuMenu size={24} />
          </button>

          <Link to="/" className="group flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-800 transition-transform group-hover:scale-105">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain transform scale-125" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Zar3a</span>
              <span className="hidden sm:block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">{t("nav.smartAgri")}</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">

          {/* 🌐 Language Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleLang}
            title={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
            className="flex items-center gap-1.5 px-3 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-bold text-xs border border-slate-200 dark:border-slate-700"
          >
            <LuLanguages size={16} />
            <span>{t("lang.toggle")}</span>
          </motion.button>

          {/* Dark/Light Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:text-emerald-600 transition-all"
          >
            {isDark ? <LuSun size={20} className="text-yellow-400" /> : <LuMoon size={20} />}
          </motion.button>

          {/* Consultation Chat Icon (Only for Expert/Admin) */}
          {user && (user.role === 'AGRO_EXPERT' || user.role === 'ADMIN') && (
            <Link to="/consultations" className="hidden sm:flex p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl relative hover:text-emerald-600 transition-all" title="Consultation Chat">
              <LuMessageSquare size={20} />
            </Link>
          )}

          {user && (
            <Link to="/notifications" className="p-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl relative hover:text-blue-600 transition-all">
              <LuBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Dropdown or Login Button */}
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-semibold text-sm"
              >
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName?.charAt(0)}
                </div>
                <span className="hidden md:inline">{user.fullName?.split(" ")[0]}</span>
                <LuChevronDown size={16} className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute end-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>

                    <nav className="py-2">
                      {profileLink && (
                        <Link
                          to={profileLink}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                          <LuUser size={18} />
                          <span className="font-semibold">{t("nav.myProfile")}</span>
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      >
                        <LuSettings size={18} />
                        <span className="font-semibold">{t("nav.settings")}</span>
                      </Link>

                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

                      <button
                        onClick={async () => {
                          await logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-start"
                      >
                        <LuLogOut size={18} />
                        <span className="font-semibold">{t("nav.logout")}</span>
                      </button>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl hover:opacity-90 transition-all font-black text-xs">
              <LuUser size={16} />
              <span>{t("nav.signIn")}</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 📱 Mobile Menu Overlay & Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-200 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 start-0 w-70 bg-white dark:bg-slate-950 shadow-2xl flex flex-col p-6 border-e border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">ZAR3A</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500"
                >
                  <LuX size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {allNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-bold">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Bottom section */}
              <div className="mt-auto pt-6 space-y-3 border-t border-slate-100 dark:border-slate-800">
                {/* Language toggle in mobile menu */}
                <button
                  onClick={toggleLang}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <LuLanguages size={22} />
                  <span className="font-bold">{t("lang.toggle")}</span>
                </button>

                {user && profileLink && (
                  <Link
                    to={profileLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <LuUser size={22} />
                    <span className="font-bold">{t("nav.myProfile")}</span>
                  </Link>
                )}

                {user && (
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <LuSettings size={22} />
                    <span className="font-bold">{t("nav.settings")}</span>
                  </Link>
                )}

                {user ? (
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 dark:bg-red-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    <LuLogOut size={20} />
                    <span>{t("nav.logout")}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    <LuUser size={20} />
                    <span>{t("nav.accessAccount")}</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;