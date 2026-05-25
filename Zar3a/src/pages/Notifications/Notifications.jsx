import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LuBell, LuCheck, LuBot, LuTrash2, LuSettings, LuX
} from "react-icons/lu";

const initialNotifications = [
  {
    id: 1, type: "ai", title: "Zar3a AI Vision Analysis",
    message: "تم فحص محصول الطماطم بنجاح. معدل النمو يتصدر أعلى 10% لهذا الموسم.",
    time: "الآن", isRead: false, icon: <LuBot size={22} className="text-emerald-500" />,
    bg: "bg-emerald-100 dark:bg-emerald-500/20", border: "border-emerald-200 dark:border-emerald-500/30"
  },
  {
    id: 2, type: "system", title: "Critical: Soil Moisture Alert",
    message: "انخفض مستوى الرطوبة في القطاع (ب) عن 30%. تم تفعيل نظام الري الآلي.",
    time: "منذ 12 دقيقة", isRead: false, icon: <LuBell size={22} className="text-blue-500" />,
    bg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-200 dark:border-blue-500/30"
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // 🧮 العمليات
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "ai") return n.type === "ai";
    if (activeFilter === "system") return n.type === "system";
    return true;
  });

  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  const clearAll = () => setNotifications([]);
  const deleteNotification = (id) => setNotifications(notifications.filter(n => n.id !== id));
  const markAsRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));

  return (
    <div className="p-6 md:p-8 max-w-300 mx-auto font-sans bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[90vh] rounded-4xl border border-white dark:border-slate-800 shadow-sm mt-4 relative">
      
      {/* 🌟 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl relative">
            <LuBell size={32} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Action Center</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-2">
              Zar3a Intelligence Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <LuSettings size={22} />
          </button>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">
                Mark Read
              </button>
              <button onClick={clearAll} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl text-sm hover:bg-red-100 transition-all flex items-center gap-2">
                <LuTrash2 size={16} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 🎛️ Sidebar Filters */}
        <div className="lg:col-span-1 space-y-2">
          {["all", "unread", "ai", "system"].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeFilter === f ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/50">{notifications.filter(n => f === "all" ? true : (f === "unread" ? !n.isRead : n.type === f)).length}</span>
            </button>
          ))}
        </div>

        {/* 📋 Notifications Feed */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center bg-white dark:bg-slate-800/50 rounded-4xl border-2 border-dashed border-slate-100">
                <LuCheck size={48} className="mx-auto text-emerald-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No Notifications</h3>
                <p className="text-slate-500">Everything is running smoothly in your field.</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div key={notif.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`relative flex items-start gap-5 p-6 mb-4 rounded-2xl border transition-all cursor-pointer ${notif.isRead ? 'bg-white/50 border-slate-100 opacity-70' : 'bg-white border-emerald-500/20 shadow-lg shadow-emerald-500/5'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notif.bg} border ${notif.border}`}>{notif.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-black text-slate-800">{notif.title}</h3>
                      <span className="text-xs font-bold text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{notif.message}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LuTrash2 size={20} /></button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ⚙️ Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Preferences</h2>
                <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors"><LuX size={24}/></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">AI Notifications</h4>
                    <p className="text-xs text-slate-400 font-medium">Get insights from Zar3a AI Vision</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <h4 className="font-bold text-slate-800">SMS Alerts</h4>
                    <p className="text-xs text-slate-400 font-medium">Receive critical sensor alerts via SMS</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-300 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-start gap-3">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">تعديل هذه الإعدادات يؤثر على كيفية استلامك للتنبيهات الحيوية لمحصولك.</p>
                </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50">
                <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;