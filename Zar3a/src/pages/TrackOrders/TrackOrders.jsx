import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuListChecks, LuRefreshCcw, LuSearch, LuMapPin, LuCheck } from 'react-icons/lu';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const TrackOrders = () => {
  const { user, loading: authLoading, getOrderTracking } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // Check if user has access to this page
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');



      const response = await getOrderTracking({ search: query });
      const itemsData = response?.items || [];
      setItems(itemsData);
    } catch (err) {
      setError(err?.response?.data?.message || t('track.loading') === 'Loading order tracking...' ? 'Unable to load order tracking data' : 'Unable to load order tracking data');
      console.error('TrackOrders error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    fetchOrders();
  }, [query, user, authLoading]);



  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-text-muted dark:text-text-disabled">{t('nav.trackOrder')}</p>
          <h1 className="text-3xl font-bold text-text-main dark:text-white">{t('track.feed')}</h1>
          <p className="mt-2 max-w-2xl text-text-subtle dark:text-text-disabled">
            {t('track.feedDesc')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-2xl border border-border-default bg-surface-card px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-surface-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LuRefreshCcw className="h-4 w-4" /> {t('track.refresh')}
          </button>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('track.search')}
              className="w-full rounded-2xl border border-border-default bg-surface-card py-3 pl-11 pr-4 text-sm text-text-main shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border-default bg-surface-card shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6 border-b border-border-default dark:border-slate-800 bg-surface-secondary dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-primary-base dark:text-emerald-400">
                <LuListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t('track.totalItems')}</p>
                <p className="text-2xl font-bold">{items?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-text-muted dark:text-text-disabled">
              <LuMapPin className="h-4 w-4" /> {t('track.showingAll')}
            </div>
          </div>
        </div>

        <div className="min-h-[260px] p-6">
          {loading ? (
            <div className="text-center py-16 text-text-muted dark:text-text-disabled">{t('track.loading')}</div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">{error}</div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-16 text-text-muted dark:text-text-disabled">{t('track.noTrackedItems')}</div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-border-default p-5 shadow-sm transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-text-main dark:text-white">{item.title}</h2>
                      <p className="mt-1 text-sm text-text-muted dark:text-text-disabled">{item.description || t('track.noDesc')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm font-semibold text-text-subtle dark:text-slate-300">
                      <span className="rounded-full bg-surface-secondary px-3 py-1 dark:bg-slate-800">
                        {item.marketplaceType === 'CROP_MARKET' ? t('nav.cropMarket') : t('nav.agriShop')}
                      </span>
                      <span className="rounded-full bg-surface-secondary px-3 py-1 dark:bg-slate-800">
                        {item.productSource === 'MANUAL' ? t('market.manual') : t('market.sensed')}
                      </span>
                      <span className="rounded-full bg-surface-secondary px-3 py-1 dark:bg-slate-800">
                        {item.status === 'AVAILABLE' ? t('market.available') : item.status === 'SOLD' ? t('market.sold') : t('market.deleted')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl bg-surface-secondary p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">{t('market.price')}</p>
                      <p className="mt-2 text-lg font-bold text-text-main dark:text-white">{item.price ? `${item.price} ${t('common.egp')}` : 'N/A'}</p>
                    </div>
                    <div className="rounded-3xl bg-surface-secondary p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">{t('market.buyer')}</p>
                      <p className="mt-2 text-lg font-bold text-text-main dark:text-white">{item.User?.fullName || 'Unknown'}</p>
                    </div>
                    <div className="rounded-3xl bg-surface-secondary p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">{t('market.seller')}</p>
                      <p className="mt-2 text-lg font-bold text-text-main dark:text-white">
                        {item.type === 'LISTING'
                          ? (item.User?.fullName || item.User?.username || 'Unknown')
                          : (item.Product?.User?.fullName || item.Product?.User?.username || 'Unknown')}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-surface-secondary p-4 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">{t('market.category')}</p>
                      <p className="mt-2 text-lg font-bold text-text-main dark:text-white">{item.category || 'General'}</p>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="mt-6 border-t border-border-default dark:border-slate-800 pt-6">
                    <p className="text-xs font-bold text-text-disabled uppercase tracking-widest mb-4">Order Status Tracking</p>
                    {item.status === 'CANCELLED' ? (
                      <div className="flex items-center gap-3 text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl">
                        <FiAlertTriangle size={20} /> Order Cancelled
                      </div>
                    ) : (
                      <div className="relative flex justify-between items-center w-full px-2 sm:px-8">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-4 right-4 sm:left-10 sm:right-10 h-1 bg-slate-200 dark:bg-slate-700 z-0 rounded-full"></div>
                        
                        {/* Active Connecting Line */}
                        <div 
                          className="absolute top-4 left-4 sm:left-10 h-1 bg-emerald-500 z-0 transition-all duration-700 rounded-full"
                          style={{
                            width: (() => {
                              const sIndex = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(item.status || 'PENDING');
                              if (sIndex <= 0) return '0%';
                              if (sIndex === 1) return '33%';
                              if (sIndex === 2) return '66%';
                              return '100%';
                            })()
                          }}
                        ></div>

                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                          const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                          const currentIndex = steps.indexOf(item.status || 'PENDING') >= 0 ? steps.indexOf(item.status || 'PENDING') : 0;
                          const isCompleted = idx <= currentIndex;
                          const isActive = idx === currentIndex;
                          
                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-3 bg-surface-card dark:bg-slate-900 px-1 sm:px-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 transition-all duration-500 shadow-sm ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-text-disabled'} ${isActive ? 'ring-4 ring-emerald-500/30 scale-110' : ''}`}>
                                {isCompleted ? <LuCheck size={14} className="stroke-[3]" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                              </div>
                              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center ${isActive ? 'text-primary-base dark:text-emerald-400' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-text-disabled'}`}>
                                {t(`track.status.${step.toLowerCase()}`) || step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
