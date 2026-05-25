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

export default function Admin() {
  const {
    user,
    loading: authLoading,
    getPendingExperts,
    approveExpert,
    rejectExpert,
    getAllUsers,
    changeUserRole,
    deleteUserById,
    getAdminStats,
  } = useAuth();

  const [pendingExperts, setPendingExperts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.role !== "ADMIN") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [experts, userData, adminStats] = await Promise.all([
        getPendingExperts(),
        getAllUsers({ limit: 50 }),
        getAdminStats(),
      ]);

      setPendingExperts(experts || []);
      setUsers(userData.users || []);
      setStats(adminStats?.stats || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load admin dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      await approveExpert(userId);
      setPendingExperts((prev) => prev.filter((expert) => expert.id !== userId));
      setSuccess("Expert approved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve expert.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await rejectExpert(userId);
      setPendingExperts((prev) => prev.filter((expert) => expert.id !== userId));
      setSuccess("Expert request rejected successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject expert request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">Loading admin dashboard...</h2>
          <p className="text-slate-500 dark:text-slate-400">Please wait while your admin workspace loads.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FiShield className="mx-auto h-16 w-16 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">Authentication Required</h2>
          <p className="text-slate-500 dark:text-slate-400">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">Access Denied</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You don't have permission to access this section.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"><FiArrowLeft /> Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Admin Dashboard</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">Manage Users & Marketplace</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">View every user, change roles, and delete accounts immediately in the database.</p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-slate-700"><FiArrowLeft size={18} /> Back to dashboard</Link>
        </header>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"><FiUsers size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers ?? '-'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">All registered users in the system with roles and account status.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><FiFileText size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Products</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalProducts ?? '-'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Products currently available from both Crop and Agri marketplaces.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><FiClock size={20} /></div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Approvals</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{pendingExperts.length}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Expert account requests waiting for review.</p>
          </div>
        </div>

        {error && <div className="rounded-3xl bg-rose-50 p-5 text-rose-700 border border-rose-100">{error}</div>}
        {success && <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-700 border border-emerald-100">{success}</div>}

        <section className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Edit roles and remove users directly from the database.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.2em] text-xs dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.fullName}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.role || 'Unassigned'}</td>
                    <td className="px-6 py-4">{item.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4 flex flex-wrap gap-2">
                      <select
                        value={item.role || ''}
                        onChange={(e) => handleRoleChange(item.id, e.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="">Select role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="FARMER">Farmer</option>
                        <option value="SUPPLIER">Supplier</option>
                        <option value="BUYER">Buyer</option>
                        <option value="AGRO_EXPERT">Agro Expert</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        disabled={actionLoading === item.id}
                        className="rounded-2xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
                      >
                        Delete
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pending Expert Requests</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review new specialist applications and approve or reject them.</p>
          </div>
          {pendingExperts.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">No pending requests at the moment.</div>
          ) : (
            <div className="space-y-4 p-6">
              {pendingExperts.map((expert) => (
                <motion.div key={expert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{expert.fullName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{expert.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={actionLoading === expert.id}
                        onClick={() => handleApprove(expert.id)}
                        className="rounded-2xl bg-emerald-500 px-4 py-2 text-white transition hover:bg-emerald-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === expert.id}
                        onClick={() => handleReject(expert.id)}
                        className="rounded-2xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
