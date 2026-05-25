import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiDownload, FiAward, FiUser, FiPhone, FiMail, FiClipboard } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ExpertProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleDownloadCV = () => {
    if (profile?.AgroExpertProfile?.cvFilePath) {
      window.open(`/${profile.AgroExpertProfile.cvFilePath}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.fullName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {profile?.fullName}
              </h1>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">🎓 Agro-Expert</p>
            </div>
          </div>
        </motion.div>

        {/* Approval Status Messages */}
        {!profile?.isApproved ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-8"
          >
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
              ⏳ Your expert application is pending admin approval. You'll be notified once approved!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-lg p-4 mb-8"
          >
            <p className="text-green-800 dark:text-green-200 font-semibold">
              ✅ Approved! You are now a verified Agro-Expert on Zar3a.
            </p>
          </motion.div>
        )}

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
              <FiUser className="text-purple-600" /> Personal Information
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
                  <FiMail className="text-purple-600" /> {profile?.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiPhone className="text-purple-600" /> {profile?.phone}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Expert Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiAward className="text-purple-600" /> Expert Credentials
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Academic Degree</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile?.AgroExpertProfile?.academicDegree || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Experience (Years)</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiClipboard className="text-purple-600" />
                  {profile?.AgroExpertProfile?.experienceYears || "Not specified"} years
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                <p className="text-lg font-semibold">
                  {profile?.isApproved ? (
                    <span className="text-green-600 dark:text-green-400">✅ Verified Expert</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">⏳ Pending Approval</span>
                  )}
                </p>
              </div>
              {profile?.AgroExpertProfile?.cvFilePath && (
                <button
                  onClick={handleDownloadCV}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 w-full justify-center"
                >
                  <FiDownload /> Download CV
                </button>
              )}
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
          {profile?.isApproved && (
            <>
              <Link
                to="/experts"
                className="bg-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
              >
                <FiAward /> View Profile
              </Link>
              {/* CHANGED LINK ROUTE TO NEW DEDICATED PAGE */}
              <Link
                to="/consultations"
                className="bg-pink-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center font-semibold flex items-center justify-center gap-2"
              >
                <FiClipboard /> Consultations
              </Link>
            </>
          )}
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
