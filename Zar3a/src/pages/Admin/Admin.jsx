import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUserCheck,
  FiMail,
  FiPhone,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiShield,
  FiUsers,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function Admin() {
  const { t } = useLanguage();
  const {
    user,
    loading: authLoading,
    getPendingUsers,
    approveUser,
    rejectUser,
    getAllUsers,
    changeUserRole,
    deleteUserById,
    getAdminStats,
  } = useAuth();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.role !== "ADMIN") {
      setError(t("admin.noPermission"));
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [pendingList, userData, adminStats] = await Promise.all([
        getPendingUsers(),
        getAllUsers({ limit: 50 }),
        getAdminStats(),
      ]);

      setPendingUsers(pendingList || []);
      setUsers(userData.users || []);
      setStats(adminStats?.stats || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load admin dashboard.");
      console.error(err);
    } finally {
      loadAdminDataFinished();
    }
  };

  const loadAdminDataFinished = () => {
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, role: newRole } : item)));
      setSuccess("User role updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await deleteUserById(userId);
      setUsers((prev) => prev.filter((item) => item.id !== userId));
      setSuccess("User deleted successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await approveUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("User approved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await rejectUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("User request rejected successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject user request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">{t("admin.loading")}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t("admin.loadingDesc")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FiShield className="mx-auto h-16 w-16 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">{t("admin.authRequired")}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t("admin.loginToAccess")}</p>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">{t("admin.accessDenied")}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t("admin.noPermission")}</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"><FiArrowLeft /> {t("admin.backToDashboard")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.title")}</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">{t("admin.manageUsers")}</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{t("admin.manageDesc")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/products-dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white shadow-lg transition hover:bg-emerald-700 font-bold text-sm">{t("admin.prodDash")}</Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-slate-700 font-bold text-sm"><FiArrowLeft size={18} /> {t("admin.backDash")}</Link>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"><FiUsers size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.totalUsers")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers ?? '-'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.usersDesc")}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><FiFileText size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.activeProducts")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalProducts ?? '-'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.prodDesc")}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><FiClock size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.pending")}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{pendingUsers.length}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.pendingDesc")}</p>
          </div>
        </div>

        {error && <div className="rounded-3xl bg-rose-50 p-5 text-rose-700 border border-rose-100">{error}</div>}
        {success && <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-700 border border-emerald-100">{success}</div>}

        <section className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("admin.usersTable")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.usersTableDesc")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.2em] text-xs dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">{t("admin.tableName")}</th>
                  <th className="px-6 py-4">{t("admin.tableEmail")}</th>
                  <th className="px-6 py-4">{t("admin.tableRole")}</th>
                  <th className="px-6 py-4">{t("admin.tableStatus")}</th>
                  <th className="px-6 py-4">{t("admin.tableActions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.fullName}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">
                      {item.role === "ADMIN" ? t("admin.roleAdmin") :
                       item.role === "FARMER" ? t("admin.roleFarmer") :
                       item.role === "SUPPLIER" ? t("admin.roleSupplier") :
                       item.role === "BUYER" ? t("admin.roleBuyer") :
                       item.role === "AGRO_EXPERT" ? t("admin.roleExpert") :
                       t("admin.roleUnassigned")}
                    </td>
                    <td className="px-6 py-4">{item.isActive ? t("admin.statusActive") : t("admin.statusInactive")}</td>
                    <td className="px-6 py-4 flex flex-wrap gap-2">
                      <select
                        value={item.role || ''}
                        onChange={(e) => handleRoleChange(item.id, e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="">{t("admin.selectRole")}</option>
                        <option value="ADMIN">{t("admin.roleAdmin")}</option>
                        <option value="FARMER">{t("admin.roleFarmer")}</option>
                        <option value="SUPPLIER">{t("admin.roleSupplier")}</option>
                        <option value="BUYER">{t("admin.roleBuyer")}</option>
                        <option value="AGRO_EXPERT">{t("admin.roleExpert")}</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        disabled={actionLoading === item.id}
                        className="rounded-2xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
                      >
                        {t("admin.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("admin.pendingRequests")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.pendingTableDesc")}</p>
          </div>
          {pendingUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">{t("admin.noPending")}</div>
          ) : (
            <div className="space-y-4 p-6">
              {pendingUsers.map((item) => {
                const isFarmer = item.role === "FARMER";
                const isSupplier = item.role === "SUPPLIER";
                const isExpert = item.role === "AGRO_EXPERT" || item.pendingRole === "AGRO_EXPERT";

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.fullName}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isFarmer ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                            isSupplier ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400" :
                            "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}>
                            {isFarmer ? "Farmer 🌾" : isSupplier ? "Supplier 📦" : "Expert 🎓"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.email} | {item.phone}</p>
                        
                        {isFarmer && item.FarmerProfile && (
                          <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                            <p><strong>Sensor ID:</strong> <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">{item.FarmerProfile.sensorId || "N/A"}</span></p>
                            <p><strong>Location:</strong> {item.FarmerProfile.location || "N/A"}</p>
                            <p><strong>Soil Type:</strong> {item.FarmerProfile.soilType || "N/A"}</p>
                            <p><strong>Farm Size:</strong> {item.FarmerProfile.farmSize || "N/A"}</p>
                          </div>
                        )}

                        {isSupplier && item.SupplierProfile && (
                          <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                            <p><strong>Trade License:</strong> <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">{item.SupplierProfile.tradeLicense || "N/A"}</span></p>
                            <p><strong>Business Location:</strong> {item.SupplierProfile.location || "N/A"}</p>
                          </div>
                        )}

                        {isExpert && item.AgroExpertProfile && (
                          <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                            <p><strong>{t("admin.degree")}:</strong> {item.AgroExpertProfile.academicDegree || t("admin.cvNA")}</p>
                            <p><strong>{t("admin.experience")}:</strong> {item.AgroExpertProfile.experienceYears ?? '0'} {t("admin.cvYears")}</p>
                            <p><strong>{t("admin.bio")}:</strong> {item.AgroExpertProfile.bio || t("admin.noBio")}</p>
                            {(item.AgroExpertProfile.cvFilePath || item.cv) && (
                              <p>
                                <strong>CV:</strong>{' '}
                                <a
                                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/${item.AgroExpertProfile.cvFilePath || item.cv}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-500 hover:underline font-bold"
                                >
                                  {t("admin.viewCv")}
                                </a>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleApprove(item.id)}
                          className="rounded-2xl bg-emerald-500 px-4 py-2 text-white transition hover:bg-emerald-600 disabled:opacity-50 font-bold text-xs"
                        >
                          {t("admin.approve")}
                        </button>
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleReject(item.id)}
                          className="rounded-2xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600 disabled:opacity-50 font-bold text-xs"
                        >
                          {t("admin.reject")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
