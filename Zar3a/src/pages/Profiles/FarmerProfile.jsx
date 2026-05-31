import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LuUser, 
  LuMapPin, 
  LuSprout, 
  LuPhone, 
  LuMail, 
  LuLayoutDashboard, 
  LuPackage, 
  LuStore, 
  LuSettings,
  LuWifi,
  LuTractor
} from "react-icons/lu";
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
    setProfile(user);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-base"></div>
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
    } catch (error) {
      setSensorError(error?.response?.data?.message || "Failed to update Sensor ID. It may already be in use.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4 md:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-border-default dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-base/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-light to-primary-base rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-green-500/20 rotate-3 transition-transform hover:rotate-0">
              {profile?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-[1000] text-text-main dark:text-white tracking-tight">
                {profile?.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="bg-primary-light dark:bg-emerald-950/40 text-primary-base dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <LuTractor size={14} /> {t("profile.farmer")}
                </span>
                <span className="text-sm font-bold text-text-disabled flex items-center gap-1.5">
                  <LuUser size={14} /> @{profile?.username}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/settings"
                className="px-6 py-3 bg-surface-secondary dark:bg-slate-800 text-text-main dark:text-white rounded-2xl font-black text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-2 uppercase tracking-widest"
              >
                <LuSettings size={16} /> Edit Profile
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-card dark:bg-slate-900 rounded-[2.5rem] p-8 border border-border-default dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center">
                <LuUser size={20} />
              </div>
              <h2 className="text-xl font-black text-text-main dark:text-white uppercase tracking-wider">
                {t("profile.personalInfo")}
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest mb-1">{t("profile.email")}</label>
                <p className="text-lg font-bold text-text-main dark:text-white flex items-center gap-3 bg-surface-secondary dark:bg-slate-800 px-4 py-3 rounded-2xl">
                  <LuMail className="text-text-muted" /> {profile?.email}
                </p>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest mb-1">{t("profile.phone")}</label>
                <p className="text-lg font-bold text-text-main dark:text-white flex items-center gap-3 bg-surface-secondary dark:bg-slate-800 px-4 py-3 rounded-2xl">
                  <LuPhone className="text-text-muted" /> {profile?.phone}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Farm Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-card dark:bg-slate-900 rounded-[2.5rem] p-8 border border-border-default dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-light dark:bg-emerald-950/20 text-primary-base dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <LuSprout size={20} />
              </div>
              <h2 className="text-xl font-black text-text-main dark:text-white uppercase tracking-wider">
                {t("profile.farmInfo")}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-secondary dark:bg-slate-800 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-text-disabled uppercase tracking-widest block mb-1">{t("profile.farmSize")}</label>
                <p className="text-lg font-bold text-text-main dark:text-white">
                  {profile?.FarmerProfile?.farmSize || t("admin.cvNA")}
                </p>
              </div>
              <div className="bg-surface-secondary dark:bg-slate-800 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-text-disabled uppercase tracking-widest block mb-1">{t("profile.soilType")}</label>
                <p className="text-lg font-bold text-text-main dark:text-white">
                  {profile?.FarmerProfile?.soilType || t("admin.cvNA")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-secondary dark:bg-slate-800 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-text-disabled uppercase tracking-widest block mb-1">{t("profile.location")}</label>
                <p className="text-base font-bold text-text-main dark:text-white flex items-center gap-2">
                  <LuMapPin className="text-primary-base shrink-0" /> <span className="truncate">{profile?.FarmerProfile?.location || t("admin.cvNA")}</span>
                </p>
              </div>

              <div className="bg-surface-secondary dark:bg-slate-800 p-5 rounded-2xl border border-primary-light dark:border-emerald-950">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-primary-base uppercase tracking-widest flex items-center gap-1.5">
                    <LuWifi /> {t("profile.sensorId") || "Smart Sensor ID"}
                  </label>
                  {!editingSensor && (
                    <button
                      onClick={() => {
                        setNewSensorId(profile?.FarmerProfile?.sensorId || "");
                        setEditingSensor(true);
                      }}
                      className="text-[10px] bg-white dark:bg-slate-700 px-3 py-1.5 rounded-full font-black text-text-main dark:text-white hover:text-primary-base transition shadow-sm uppercase tracking-wider"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {editingSensor ? (
                  <form onSubmit={handleUpdateSensor} className="mt-3 flex flex-col gap-3">
                    <input
                      type="text"
                      value={newSensorId}
                      onChange={(e) => setNewSensorId(e.target.value)}
                      placeholder="Enter Sensor ID"
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-base dark:text-white outline-none font-mono text-sm font-bold shadow-inner"
                      disabled={isUpdating}
                    />
                    {sensorError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">{sensorError}</p>}
                    <div className="flex gap-2 mt-1">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 py-3 bg-primary-base text-white rounded-xl text-[10px] font-black hover:bg-primary-hover transition uppercase tracking-widest"
                      >
                        {isUpdating ? "Saving..." : "Save ID"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSensor(false)}
                        className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black hover:bg-gray-300 transition uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xl font-black text-text-main dark:text-white font-mono tracking-wider">
                    {profile?.FarmerProfile?.sensorId || "NOT CONNECTED"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Link
            to="/products-dashboard"
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <LuLayoutDashboard size={32} className="opacity-80" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">{t("profile.prodDash")}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Manage Offerings</p>
            </div>
          </Link>
          
          <Link
            to="/track-orders"
            className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <LuPackage size={32} className="opacity-80" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">{t("profile.trackOrder")}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">View Purchases</p>
            </div>
          </Link>

          <Link
            to="/marketplace"
            className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <LuStore size={32} className="opacity-80" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">{t("profile.browseMarket")}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Explore Products</p>
            </div>
          </Link>
        </motion.div>
        
      </div>
    </div>
  );
}
