import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiMapPin, FiHome, FiTrendingUp, FiUser, FiPhone, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerProfile() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSensor, setEditingSensor] = useState(false);
  const [newSensorId, setNewSensorId] = useState("");
  const [sensorError, setSensorError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLoading(false);
    // Profile data comes from the user object
    setProfile(user);
  }, [user]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const handleUpdateSensor = async (e) => {
    e.preventDefault();
    if (!newSensorId.trim()) {
      setSensorError("Sensor ID is required.");
      return;
    }
    setIsUpdating(true);
    setSensorError("");
    try {
      await updateProfile({ sensorId: newSensorId.trim() });
      setEditingSensor(false);
      // user context will automatically update and trigger useEffect
    } catch (error) {
      setSensorError("Failed to update Sensor ID. It may already be in use.");
    } finally {
      setIsUpdating(false);
    }
  };

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
              <p className="text-green-600 dark:text-green-400 font-semibold">🌾 {t("profile.farmer")}</p>
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
              <FiUser className="text-green-600" /> {t("profile.personalInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.fullName")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.fullName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.username")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  @{profile?.username}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.email")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMail className="text-green-600" /> {profile?.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.phone")}</label>
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
              <FiHome className="text-green-600" /> {t("profile.farmInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.farmSize")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.FarmerProfile?.farmSize || t("admin.cvNA")}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.soilType")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.FarmerProfile?.soilType || t("admin.cvNA")}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.location")}</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-green-600" /> {profile?.FarmerProfile?.location || t("admin.cvNA")}
                </p>
              </div>
              <div className="border-t dark:border-gray-700 pt-4 mt-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">{t("profile.sensorId") || "Sensor ID"}</label>
                
                {(!profile?.FarmerProfile?.sensorId || editingSensor) ? (
                  <form onSubmit={handleUpdateSensor} className="mt-2 flex flex-col gap-2">
                    <input
                      type="text"
                      value={newSensorId}
                      onChange={(e) => setNewSensorId(e.target.value)}
                      placeholder="Enter Sensor ID to unlock Dashboard"
                      className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={isUpdating}
                    />
                    {sensorError && <p className="text-red-500 text-xs">{sensorError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition"
                      >
                        {isUpdating ? "Saving..." : "Save Sensor"}
                      </button>
                      {profile?.FarmerProfile?.sensorId && (
                        <button
                          type="button"
                          onClick={() => setEditingSensor(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiTrendingUp className="text-green-600" /> {profile.FarmerProfile.sensorId}
                      </p>
                      <p className={`text-xs font-bold px-2 py-1 inline-block rounded-full mt-1 ${
                        profile.FarmerProfile.sensorStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                        profile.FarmerProfile.sensorStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        Status: {profile.FarmerProfile.sensorStatus || "PENDING"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewSensorId(profile.FarmerProfile.sensorId);
                        setEditingSensor(true);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-bold"
                    >
                      Edit
                    </button>
                  </div>
                )}
                {!profile?.FarmerProfile?.sensorId && (
                  <p className="text-xs text-amber-600 mt-2">
                    * Sensor ID is required to access the IoT Dashboard.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link
            to="/products-dashboard"
            className="bg-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> {t("profile.prodDash")}
          </Link>
          <Link
            to="/track-orders"
            className="bg-emerald-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> {t("profile.trackOrder")}
          </Link>
          <Link
            to="/marketplace"
            className="bg-teal-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
          >
            <FiTrendingUp /> {t("profile.browseMarket")}
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
