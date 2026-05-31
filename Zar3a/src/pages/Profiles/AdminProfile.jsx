import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiShield,
  FiActivity,
  FiUsers,
  FiShoppingBag,
  FiClock,
  FiEdit2,
  FiChevronRight
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading, getAdminStats, getPendingUsers } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }
    setProfile(user);
    loadAdminStats();
  }, [user, authLoading, navigate]);

  const loadAdminStats = async () => {
    try {
      const [statsData, pendingData] = await Promise.all([
        getAdminStats(),
        getPendingUsers()
      ]);
      setStats(statsData?.stats || null);
      setPendingCount(pendingData?.length || 0);
    } catch (err) {
      console.error("Failed to load admin profile stats:", err);
      setError("Unable to load live system stats.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-secondary dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-white"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-start">
            <div className="w-20 h-20 bg-primary-base rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-500/20">
              {profile?.fullName?.charAt(0)}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <FiShield size={12} /> System Admin
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile?.fullName}</h1>
              <p className="text-text-disabled font-medium text-sm">
                Control panel and server management hub
              </p>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-2xl bg-surface-card/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-surface-card/20 border border-white/10"
            >
              <FiEdit2 size={16} /> {t("profile.editProfile") || "Edit Profile"}
            </Link>
          </div>
        </motion.div>

        {/* Live System Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-primary-base dark:text-emerald-400">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-disabled uppercase tracking-widest">Total Users</p>
              <p className="text-2xl font-black text-text-main dark:text-white mt-1">
                {stats?.totalUsers ?? "-"}
              </p>
            </div>
          </div>

          <div className="bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-disabled uppercase tracking-widest">Active Products</p>
              <p className="text-2xl font-black text-text-main dark:text-white mt-1">
                {stats?.totalProducts ?? "-"}
              </p>
            </div>
          </div>

          <div className="bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-disabled uppercase tracking-widest">Pending Reviews</p>
              <p className="text-2xl font-black text-text-main dark:text-white mt-1">
                {pendingCount}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Details & System Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Personal Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <h2 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2.5">
              <FiUser className="text-emerald-500" /> {t("profile.personalInfo") || "Personal Information"}
            </h2>
            
            <div className="space-y-4 font-semibold text-sm">
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.fullName") || "Full Name"}</span>
                <span className="text-text-main dark:text-slate-100">{profile?.fullName}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.username") || "Username"}</span>
                <span className="text-text-main dark:text-slate-100">@{profile?.username}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.email") || "Email Address"}</span>
                <span className="text-text-main dark:text-slate-100 flex items-center gap-1.5">
                  <FiMail className="text-text-disabled" /> {profile?.email}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.phone") || "Phone"}</span>
                <span className="text-text-main dark:text-slate-100 flex items-center gap-1.5">
                  <FiPhone className="text-text-disabled" /> +{profile?.phone}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Account & Administration Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <h2 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2.5">
              <FiActivity className="text-emerald-500" /> {t("profile.accStatus") || "System Status"}
            </h2>
            
            <div className="space-y-4 font-semibold text-sm">
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.role") || "Assigned Role"}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
                  {profile?.role}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">Security Clearance</span>
                <span className="text-primary-base dark:text-emerald-400">Highest (Admin)</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-default dark:border-slate-800">
                <span className="text-text-muted dark:text-text-disabled">Account Health</span>
                <span className="text-primary-base dark:text-green-400">Active</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-text-muted dark:text-text-disabled">{t("profile.memberSince") || "Registered Since"}</span>
                <span className="text-text-main dark:text-slate-100">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Administration Quick Access Hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-black text-text-main dark:text-white uppercase tracking-wider">Administration Shortcuts</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin"
              className="group bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-light dark:bg-emerald-950/20 text-primary-base dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                  <FiUsers size={20} />
                </div>
                <div className="text-start">
                  <p className="font-bold text-text-main dark:text-white text-sm">Manage Platform Users</p>
                  <p className="text-text-disabled text-xs mt-0.5">Approve, delete or assign roles</p>
                </div>
              </div>
              <FiChevronRight className="text-slate-350 dark:text-text-subtle group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/products-dashboard"
              className="group bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
                  <FiShoppingBag size={20} />
                </div>
                <div className="text-start">
                  <p className="font-bold text-text-main dark:text-white text-sm">Products Panel</p>
                  <p className="text-text-disabled text-xs mt-0.5">Control crops & agri-shop items</p>
                </div>
              </div>
              <FiChevronRight className="text-slate-350 dark:text-text-subtle group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/settings"
              className="group bg-surface-card dark:bg-slate-900 border border-border-default dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between hover:border-slate-500 dark:hover:border-slate-500 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surface-secondary dark:bg-slate-800 text-text-subtle dark:text-slate-300 rounded-xl group-hover:scale-105 transition-transform">
                  <FiEdit2 size={20} />
                </div>
                <div className="text-start">
                  <p className="font-bold text-text-main dark:text-white text-sm">System Settings</p>
                  <p className="text-text-disabled text-xs mt-0.5">Update preferences & security</p>
                </div>
              </div>
              <FiChevronRight className="text-slate-350 dark:text-text-subtle group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
