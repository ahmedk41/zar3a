import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiMapPin, FiHome, FiTrendingUp, FiUser, FiPhone, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function FarmerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // Profile data comes from the user object
    setProfile(user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.fullName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {profile?.fullName}
              </h1>
              <p className="text-green-600 dark:text-green-400 font-semibold">🌾 Farmer</p>
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiUser className="text-green-600" /> Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Full Name</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.fullName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Username</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  @{profile?.username}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMail className="text-green-600" /> {profile?.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiPhone className="text-green-600" /> {profile?.phone}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Farm Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiHome className="text-green-600" /> Farm Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Farm Size</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.FarmerProfile?.farmSize || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Soil Type</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.FarmerProfile?.soilType || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Location</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-green-600" /> {profile?.FarmerProfile?.location || "Not specified"}
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
            to="/track-orders"
            className="bg-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> Track Orders
          </Link>
          <Link
            to="/marketplace"
            className="bg-emerald-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> Browse Marketplace
          </Link>
          <Link
            to="/settings"
            className="bg-gray-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiEdit2 /> Edit Profile
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
