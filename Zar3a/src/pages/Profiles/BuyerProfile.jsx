import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiShoppingCart, FiTrendingUp, FiUser, FiPhone, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function BuyerProfile() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setProfile(user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.fullName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-text-main dark:text-white">
                {profile?.fullName}
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">🛒 {t("profile.buyer")}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-card dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
              <FiUser className="text-blue-600" /> {t("profile.personalInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.fullName")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white">
                  {profile?.fullName}
                </p>
              </div>
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.username")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white">
                  @{profile?.username}
                </p>
              </div>
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.email")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white flex items-center gap-2">
                  <FiMail className="text-blue-600" /> {profile?.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.phone")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white flex items-center gap-2">
                  <FiPhone className="text-blue-600" /> {profile?.phone}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-card dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
              <FiShoppingCart className="text-blue-600" /> {t("profile.accStatus")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.role")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-md w-fit">
                  {t("profile.buyer")}
                </p>
              </div>
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.accStatus")}</label>
                <p className="text-lg font-semibold text-primary-base dark:text-green-400">
                  ✅ {t("profile.active")}
                </p>
              </div>
              <div>
                <label className="text-sm text-text-subtle dark:text-text-disabled">{t("profile.memberSince")}</label>
                <p className="text-lg font-semibold text-text-main dark:text-white">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            to="/marketplace"
            className="bg-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiShoppingCart /> {t("profile.browseProducts")}
          </Link>
          <Link
            to="/experts"
            className="bg-cyan-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> {t("profile.consultExperts")}
          </Link>
          <Link
            to="/settings"
            className="bg-gray-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiEdit2 /> {t("profile.editProfile")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
