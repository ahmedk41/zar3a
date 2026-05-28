import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LuUser,
  LuShield,
  LuBell,
  LuMonitor,
  LuLogOut,
  LuTrash2,
  LuCamera,
  LuCheck,
  LuX,
} from "react-icons/lu";

const tabs = [
  { id: "profile", label: "Profile", icon: <LuUser size={18} /> },
  { id: "security", label: "Security", icon: <LuShield size={18} /> },
  { id: "notifications", label: "Notifications", icon: <LuBell size={18} /> },
  { id: "appearance", label: "Appearance", icon: <LuMonitor size={18} /> },
];

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, changePassword, refreshUser } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showModal, setShowModal] = useState(null); // 'logout' | 'delete' | null

  // 1. حالة الفورم (البيانات)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatarUrl: null,
    smsAlerts: true,
    emailAlerts: false,
    theme: localStorage.getItem("theme") || "Light",
    tradeLicense: "",
    location: "",
    farmSize: "",
    soilType: "",
    academicDegree: "",
    experienceYears: "",
    bio: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      tradeLicense: user.SupplierProfile?.tradeLicense || "",
      location: user.SupplierProfile?.location || user.FarmerProfile?.location || "",
      farmSize: user.FarmerProfile?.farmSize || "",
      soilType: user.FarmerProfile?.soilType || "",
      academicDegree: user.AgroExpertProfile?.academicDegree || "",
      experienceYears: user.AgroExpertProfile?.experienceYears?.toString() || "",
      bio: user.AgroExpertProfile?.bio || "",
    }));
  }, [user]);

  // 2. حالة الجلسات النشطة
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Windows PC • Chrome",
      location: "Cairo, Egypt",
      current: true,
    },
    {
      id: 2,
      device: "iPhone 14 Pro • Safari",
      location: "Alexandria, Egypt",
      current: false,
    },
  ]);

  // دالة إظهار الإشعارات السريعة
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // تفاعلات الـ Input العادية
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // تفعيل رفع الصورة
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      showToast("Profile picture updated!");
    }
  };

  // تفعيل تغيير الثيم الحقيقي
  const handleThemeChange = (selectedTheme) => {
    setFormData((prev) => ({ ...prev, theme: selectedTheme }));
    localStorage.setItem("theme", selectedTheme);
    if (selectedTheme === "Dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    showToast(`${selectedTheme} mode activated`);
  };

  // تفعيل زر حفظ البيانات
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      if (user?.role === 'SUPPLIER') {
        payload.tradeLicense = formData.tradeLicense;
        payload.location = formData.location;
      }

      if (user?.role === 'FARMER') {
        payload.farmSize = formData.farmSize;
        payload.soilType = formData.soilType;
        payload.location = formData.location;
      }

      if (user?.role === 'AGRO_EXPERT' || user?.pendingRole === 'AGRO_EXPERT') {
        payload.academicDegree = formData.academicDegree;
        payload.experienceYears = Number(formData.experienceYears || 0);
        payload.bio = formData.bio;
      }

      await updateProfile(payload);
      await refreshUser();
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Unable to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // تفعيل تغيير الباسورد
  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      return showToast("Please fill in both password fields");
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  // تفعيل مسح الجلسة
  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session revoked successfully");
  };

  // تفعيل تأكيد تسجيل الخروج أو الحذف
  const confirmAction = () => {
    if (showModal === "logout") navigate("/login");
    if (showModal === "delete") navigate("/register");
  };

  return (
    <div className="p-6 md:p-8 max-w-300 mx-auto font-sans bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[90vh] rounded-4xl border border-white dark:border-slate-800 shadow-sm mt-4 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-3 z-50"
          >
            <LuCheck size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ Modal التأكيد */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-4xl p-6 shadow-2xl text-center"
            >
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${showModal === "delete" ? "bg-red-100 text-red-500" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}
              >
                {showModal === "delete" ? (
                  <LuTrash2 size={32} />
                ) : (
                  <LuLogOut size={32} />
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {showModal === "delete" ? "Delete Account?" : "Sign Out?"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {showModal === "delete"
                  ? "This action is irreversible. All your data will be lost."
                  : "Are you sure you want to log out of Zar3a?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors ${showModal === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 dark:bg-emerald-600 hover:opacity-90"}`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your Zar3a profile, security, and system preferences.
          </p>
        </div>
        <button
          onClick={() => setShowModal("logout")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <LuLogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-colors w-full whitespace-nowrap ${activeTab === tab.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm min-h-125 flex flex-col overflow-hidden">
          <div className="p-8 flex-1">
            <AnimatePresence mode="wait">
              {/* --- PROFILE TAB --- */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="relative group cursor-pointer w-24 h-24 bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {formData.fullName
                            ? formData.fullName
                                .split(" ")
                                .map((part) => part[0]?.toUpperCase())
                                .filter(Boolean)
                                .slice(0, 2)
                                .join("")
                            : "?"}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                        <LuCamera size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Click the avatar to upload a new image. Max 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 ring-emerald-500/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 ring-emerald-500/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 ring-emerald-500/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">
                      Active Sessions
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700">
                      {sessions.length === 0 ? (
                        <div className="p-4 text-center text-sm font-medium text-slate-500">
                          No active sessions found.
                        </div>
                      ) : (
                        sessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 flex items-center justify-between ${session.current ? "bg-emerald-50/50 dark:bg-emerald-900/10 rounded-t-2xl" : ""}`}
                          >
                            <div className="flex items-center gap-4">
                              <LuMonitor
                                className={
                                  session.current
                                    ? "text-emerald-500"
                                    : "text-slate-400"
                                }
                                size={24}
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                  {session.device}
                                </p>
                                <p
                                  className={`text-xs font-medium ${session.current ? "text-emerald-600" : "text-slate-500"}`}
                                >
                                  {session.location}{" "}
                                  {session.current ? "• Active now" : ""}
                                </p>
                              </div>
                            </div>
                            {session.current ? (
                              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                                Current
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="text-sm font-bold text-slate-500 hover:text-red-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 ring-emerald-500/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 ring-emerald-500/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handlePasswordUpdate}
                        className="px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white font-bold rounded-xl whitespace-nowrap hover:opacity-90 transition-opacity"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        Critical SMS Alerts
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Receive immediate text messages for hardware failures.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="smsAlerts"
                        checked={formData.smsAlerts}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        Daily Email Reports
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        A summary of Zar3a AI insights sent to your inbox.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailAlerts"
                        checked={formData.emailAlerts}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* --- APPEARANCE & DANGER ZONE --- */}
              {activeTab === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* Real Theme Selector */}
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4">
                      Interface Theme
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["Light", "Dark"].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleThemeChange(t)}
                          className={`p-4 border rounded-2xl font-bold text-sm transition-all ${formData.theme === t ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 bg-slate-50 dark:bg-slate-900"}`}
                        >
                          {t} Mode
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="font-black text-lg text-red-600 flex items-center gap-2 mb-4">
                      <LuTrash2 /> Danger Zone
                    </h3>
                    <div className="border border-red-200 dark:border-red-900/50 rounded-2xl p-5 bg-red-50 dark:bg-red-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-red-900 dark:text-red-400">
                          Delete Account
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Permanently remove your account and all telemetry
                          data.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowModal("delete")}
                        className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl whitespace-nowrap hover:bg-red-700 transition-colors shadow-md"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <LuCheck size={18} />
              )}
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
