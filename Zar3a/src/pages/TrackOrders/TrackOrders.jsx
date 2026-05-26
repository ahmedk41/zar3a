import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuListChecks, LuRefreshCcw, LuSearch, LuMapPin, LuTriangleAlert, LuLock } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

const TrackOrders = () => {
  const { user, getOrderTracking, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // ⛔ STRICT ROLE-BASED ACCESS CONTROL
  useEffect(() => {
    if (!authLoading && user) {
      // Only FARMER, SUPPLIER, and ADMIN can access Track Orders
      if (user.role === 'BUYER' || user.role === 'AGRO_EXPERT') {
        setError(`⛔ Access Denied: ${user.role} users cannot access Track Orders.`);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Double-check access
      if (user && (user.role === 'BUYER' || user.role === 'AGRO_EXPERT')) {
        setError(`⛔ Access Denied: ${user.role} users cannot access Track Orders.`);
        setLoading(false);
        return;
      }

      const { items } = await getOrderTracking({ search: query });
      setItems(items);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load order tracking data');
      console.error('TrackOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role === 'BUYER' || user.role === 'AGRO_EXPERT' || authLoading) {
      return;
    }
    fetchOrders();
  }, [query, user, authLoading]);

  // Render access denied page for unauthorized users
  if (user && (user.role === 'BUYER' || user.role === 'AGRO_EXPERT')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LuLock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {user.role === 'BUYER'
              ? 'Buyers cannot access Track Orders. This feature is available for Farmers, Suppliers, and Administrators.'
              : 'Agro Experts cannot access Track Orders. This feature is available for Farmers, Suppliers, and Administrators.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-2xl bg-slate-900 dark:bg-white px-4 py-3 text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track Orders Dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order & Product Feed</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            All products from Crop Market and Agri Market, aggregated for Admin, Farmer, and Supplier users.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LuRefreshCcw className="h-4 w-4" /> Refresh
          </button>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders or products"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <LuListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Total items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <LuMapPin className="h-4 w-4" /> Showing products across all marketplaces and roles
            </div>
          </div>
        </div>

        <div className="min-h-[260px] p-6">
          {loading ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading order tracking...</div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">No tracked items found.</div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{item.marketplaceType}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{item.productSource}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{item.status}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.price ? `${item.price} EGP` : 'N/A'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seller</p>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.User?.fullName || 'Unknown'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</p>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{item.category || 'General'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrders;
