import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LuUser, 
  LuMapPin, 
  LuBriefcase, 
  LuPhone, 
  LuMail, 
  LuLayoutDashboard, 
  LuPackage, 
  LuSettings,
  LuFileText,
  LuCheck
} from "react-icons/lu";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function SupplierProfile() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4 md:px-8 text-left">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-border-default dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-orange-500/20 -rotate-3 transition-transform hover:rotate-0">
              {profile?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-[1000] text-text-main dark:text-white tracking-tight">
                {profile?.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <LuBriefcase size={14} /> {t("profile.supplier")}
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
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center">
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

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-card dark:bg-slate-900 rounded-[2.5rem] p-8 border border-border-default dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center">
                <LuFileText size={20} />
              </div>
              <h2 className="text-xl font-black text-text-main dark:text-white uppercase tracking-wider">
                {t("profile.bizInfo")}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-surface-secondary dark:bg-slate-800 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-text-disabled uppercase tracking-widest block mb-1">{t("profile.tradeLicense")}</label>
                <p className="text-lg font-bold text-text-main dark:text-white font-mono">
                  {profile?.SupplierProfile?.tradeLicense || t("admin.cvNA")}
                </p>
              </div>
              
              <div className="bg-surface-secondary dark:bg-slate-800 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-text-disabled uppercase tracking-widest block mb-1">{t("profile.location")}</label>
                <p className="text-base font-bold text-text-main dark:text-white flex items-center gap-2">
                  <LuMapPin className="text-amber-600 shrink-0" /> <span className="truncate">{profile?.SupplierProfile?.location || t("admin.cvNA")}</span>
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900">
                <label className="text-[9px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest block mb-1">{t("profile.status")}</label>
                <p className="text-lg font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <LuCheck /> {t("profile.verified")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            to="/products-dashboard"
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40"
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
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2rem] p-6 text-white shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <LuPackage size={32} className="opacity-80" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">{t("profile.trackOrder")}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">View Purchases</p>
            </div>
          </Link>
        </motion.div>
        
      </div>
    </div>
  );
}
