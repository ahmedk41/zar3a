import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuBell, LuCheck, LuTrash2, LuSettings, LuX,
  LuShoppingBag, LuPackage, LuRefreshCw
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const Notifications = () => {
  const navigate = useNavigate();
  const {
    user, notifications, unreadCount, refreshNotifications,
    markNotificationRead, markAllNotificationsRead, deleteNotificationById,
  } = useAuth();
  const { t, lang } = useLanguage();

  const [activeFilter, setActiveFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshNotifications(); }, []);

  const getNotifStyle = (notif) => {
    const type = notif.type?.toLowerCase();
    if (type === 'order') return {
      icon: <LuShoppingBag size={22} className="text-blue-500" />,
      bg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-200 dark:border-blue-500/30",
    };
    if (type === 'product_added') return {
      icon: <LuPackage size={22} className="text-emerald-500" />,
      bg: "bg-emerald-100 dark:bg-emerald-500/20", border: "border-emerald-200 dark:border-emerald-500/30",
    };
    return {
      icon: <LuBell size={22} className="text-slate-500" />,
      bg: "bg-slate-100 dark:bg-slate-500/20", border: "border-slate-200 dark:border-slate-500/30",
    };
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "order") return n.type?.toLowerCase() === "order";
    if (activeFilter === "system") return n.type?.toLowerCase() !== "order";
    return true;
  });

  const filterCounts = {
    all: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    order: notifications.filter(n => n.type?.toLowerCase() === "order").length,
    system: notifications.filter(n => n.type?.toLowerCase() !== "order").length,
  };

  const filterLabels = {
    all: t("notif.filter.all"),
    unread: t("notif.filter.unread"),
    order: t("notif.filter.order"),
    system: t("notif.filter.system"),
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try { await markAllNotificationsRead(); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try { await deleteNotificationById(id); } catch (err) { console.error(err); }
  };

  const handleMarkAsRead = async (id) => {
    try { await markNotificationRead(id); } catch (err) { console.error(err); }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    const type = notif.type?.toLowerCase();
    if (type === "order") {
      navigate("/track-orders");
    } else if (type === "chat_message" && notif.createdBy) {
      // Route to the appropriate chat page based on role
      if (user?.role === "ADMIN") {
        navigate(`/admin/chat?userId=${notif.createdBy}`);
      } else if (user?.role === "AGRO_EXPERT") {
        navigate(`/chat/${notif.createdBy}`);
      } else {
        navigate(`/messages?userId=${notif.createdBy}`);
      }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (lang === "ar") {
      if (diffMins < 1) return t("notif.justNow");
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays < 7) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString("ar-EG");
    }
    if (diffMins < 1) return t("notif.justNow");
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 md:p-8 max-w-300 mx-auto font-sans bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[90vh] rounded-4xl border border-white dark:border-slate-800 shadow-sm mt-4 relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl relative">
            <LuBell size={32} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -end-2 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t("notif.title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-2">
              {t("notif.subtitle")} • {notifications.length} {t("notif.total")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <LuSettings size={22} />
          </button>
          {notifications.length > 0 && (
            <button onClick={handleMarkAllAsRead} disabled={loading || unreadCount === 0}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2">
              {loading && <LuRefreshCw size={14} className="animate-spin" />}
              {t("notif.markRead")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-2">
          {["all", "unread", "order", "system"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                activeFilter === f
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}>
              {filterLabels[f]}
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/50 dark:bg-slate-700/50">{filterCounts[f]}</span>
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-20 text-center bg-white dark:bg-slate-800/50 rounded-4xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                <LuCheck size={48} className="mx-auto text-emerald-300 dark:text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t("notif.empty")}</h3>
                <p className="text-slate-500 dark:text-slate-400">{t("notif.emptyDesc")}</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notif) => {
                const style = getNotifStyle(notif);
                return (
                  <motion.div key={notif.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`relative flex items-start gap-5 p-6 mb-4 rounded-2xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-white/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700 opacity-70'
                        : 'bg-white dark:bg-slate-800 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                    }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} border ${style.border}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1 gap-4">
                        <h3 className="font-black text-slate-800 dark:text-white truncate">{notif.title}</h3>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                      {notif.quantity && (
                        <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {t("notif.qty")} {notif.quantity}
                        </span>
                      )}
                    </div>
                    <button onClick={(e) => handleDelete(notif.id, e)}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0">
                      <LuTrash2 size={20} />
                    </button>
                    {!notif.isRead && <div className="absolute top-6 start-2 w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t("notif.preferences")}</h2>
                <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500">
                  <LuX size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{t("notif.orderPref")}</h4>
                    <p className="text-xs text-slate-400 font-medium">{t("notif.orderPrefDesc")}</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                    <div className="absolute end-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{t("notif.productPref")}</h4>
                    <p className="text-xs text-slate-400 font-medium">{t("notif.productPrefDesc")}</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                    <div className="absolute end-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">{t("notif.prefInfo")}</p>
                </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50">
                <button onClick={() => setShowSettings(false)}
                  className="w-full py-4 bg-slate-800 dark:bg-emerald-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                  {t("notif.save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;