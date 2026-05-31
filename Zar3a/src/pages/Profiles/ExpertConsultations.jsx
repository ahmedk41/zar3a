import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClipboard, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function ExpertConsultations() {
  const { t } = useLanguage();
  const { user, getConversations } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      // Direct guard clause if user hasn't loaded or isn't an expert
      if (!user || user.role !== "AGRO_EXPERT") {
        setLoading(false);
        return;
      }

      try {
        const { conversations } = await getConversations();
        setConversations(conversations || []);
      } catch (err) {
        console.error("Unable to load consultations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, getConversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Security check: If they somehow landed here but aren't approved
  if (!user?.isApproved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-secondary p-4">
        <p className="text-xl font-bold text-red-600 mb-4">{t("track.denied")}</p>
        <p className="text-text-subtle mb-4">{t("profile.pendingApp")}</p>
        <Link to="/profile" className="text-purple-600 font-semibold flex items-center gap-2">
          <FiArrowLeft /> {t("profile.backProfile")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back to Profile Link */}
        <Link 
          to="/profile" 
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-6 hover:underline"
        >
          <FiArrowLeft /> {t("profile.backProfile")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-card dark:bg-slate-900 rounded-3xl shadow-lg border border-border-default dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-text-muted dark:text-text-disabled">{t("profile.consultationRequests")}</p>
              <h2 className="text-2xl font-black text-text-main dark:text-white flex items-center gap-2">
                <FiClipboard className="text-purple-600" /> {t("profile.recentConvs")}
              </h2>
            </div>
            <span className="text-sm text-text-muted dark:text-text-disabled">{conversations.length} {t("profile.contacts")}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-text-muted dark:text-text-disabled">
              {t("profile.noConsultations")}
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((item) => (
                <Link
                  key={item.user.id}
                  to={`/chat/${item.user.id}`}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-border-default dark:border-slate-800 p-4 hover:border-emerald-300 hover:bg-primary-light dark:hover:bg-emerald-900/20 transition"
                >
                  <div>
                    <p className="font-semibold text-text-main dark:text-white">{item.user.fullName}</p>
                    <p className="text-sm text-text-muted dark:text-text-disabled">{item.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-disabled dark:text-text-muted">{t("notif.filter.unread")}</p>
                    <p className="mt-1 text-lg font-black text-primary-base dark:text-emerald-400">{item.unreadCount || 0}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
