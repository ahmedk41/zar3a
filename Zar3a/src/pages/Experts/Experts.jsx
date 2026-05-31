import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuMessageSquare, LuStar, LuBadgeCheck, LuX, LuBriefcase,
  LuGraduationCap, LuAward, LuSearch, LuPlus, LuMapPin,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const normalizeListing = (listing) => {
  let imgUrl = listing.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Expert";
  if (imgUrl && !imgUrl.startsWith("http://") && !imgUrl.startsWith("https://")) {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
    imgUrl = imgUrl.startsWith("/") ? `${backendUrl}${imgUrl}` : `${backendUrl}/${imgUrl}`;
  }
  return {
    id: listing.id,
    userId: listing.userId,
    title: listing.title,
    name: listing.name || listing.User?.fullName || listing.User?.username || "Expert",
    specialization: listing.specialization || listing.specialty,
    description: listing.description,
    hourlyRate: listing.hourlyRate,
    location: listing.location || "-",
    image: imgUrl,
    rating: listing.rating || 4.8,
    reviews: listing.reviews || 24,
    owner: listing.name || listing.User?.fullName || listing.User?.username || "Expert",
    specialty: listing.specialization || listing.specialty,
    academicDegree: listing.academicDegree || listing.User?.AgroExpertProfile?.academicDegree || "",
    experienceYears: listing.experienceYears || listing.User?.AgroExpertProfile?.experienceYears || 0,
  };
};

const Experts = () => {
  const navigate = useNavigate();
  const { user, getExpertListings, createExpertListing } = useAuth();
  const { t } = useLanguage();
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expertCards, setExpertCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", specialty: "", description: "", hourlyRate: "", location: "", imageUrl: "" });
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const loadListings = async () => {
      try {
        const data = await getExpertListings();
        if (Array.isArray(data)) setExpertCards(data.map(normalizeListing));
      } catch (err) {
        console.error("Failed to load expert listings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, [user, navigate, getExpertListings]);

  const expertType = user?.role === "AGRO_EXPERT" && user?.isApproved;
  const canCreate = expertType || user?.role === "ADMIN";

  const handleCreateInput = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
    setSuccessMessage("");
  };

  const validateCreateForm = () => {
    const fe = {};
    const t_ = createForm.title.trim();
    if (!t_) fe.title = "Title is required";
    else if (t_.length < 5) fe.title = "Title must be at least 5 characters";
    else if (t_.length > 50) fe.title = "Title must be at most 50 characters";

    const s_ = createForm.specialty.trim();
    if (!s_) fe.specialty = "Specialty is required";
    else if (s_.length < 3) fe.specialty = "Specialty must be at least 3 characters";
    else if (s_.length > 30) fe.specialty = "Specialty must be at most 30 characters";

    const d_ = createForm.description.trim();
    if (!d_) fe.description = "Description is required";
    else if (d_.length < 15) fe.description = "Description must be at least 15 characters";
    else if (d_.length > 500) fe.description = "Description must be at most 500 characters";

    const rate = Number(createForm.hourlyRate);
    if (!createForm.hourlyRate) fe.hourlyRate = "Hourly rate is required";
    else if (isNaN(rate) || rate <= 0) fe.hourlyRate = "Hourly rate must be a positive number";

    const l_ = createForm.location.trim();
    if (!l_) fe.location = "Location is required";
    else if (l_.length < 3) fe.location = "Location must be at least 3 characters";
    else if (l_.length > 50) fe.location = "Location must be at most 50 characters";

    const img_ = createForm.imageUrl.trim();
    if (img_ && !/^https?:\/\/.+/.test(img_)) {
      fe.imageUrl = "Image URL must start with http:// or https://";
    }

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleCreateListing = async () => {
    if (!validateCreateForm()) return;
    try {
      const newListing = await createExpertListing({ ...createForm, hourlyRate: Number(createForm.hourlyRate) });
      setExpertCards((prev) => [normalizeListing(newListing), ...prev]);
      setSuccessMessage(t("experts.created"));
      setShowCreateModal(false);
      setCreateForm({ title: "", specialty: "", description: "", hourlyRate: "", location: "", imageUrl: "" });
      setFieldErrors({});
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || t("common.error"));
    }
  };

  const filteredExperts = expertCards.filter(
    (expert) =>
      expert.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold">{t("experts.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t("experts.title")} <span className="text-green-600">{t("experts.titleAccent")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t("experts.subtitle")}</p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <LuSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder={t("experts.search")}
              className="w-full ps-12 pe-4 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {canCreate && (
            <button onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-3xl bg-green-600 px-6 py-4 text-white font-black hover:bg-green-700 transition-shadow shadow-xl">
              <LuPlus size={20} /> {t("experts.createCard")}
            </button>
          )}
        </div>
      </section>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperts.map((expert) => (
          <motion.div key={`${expert.id}-${expert.title}`} layoutId={`expert-container-${expert.id}`}
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col items-center text-center group cursor-pointer"
            onClick={() => setSelectedExpert(expert)}>
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-green-50 dark:bg-green-900/20 p-1">
                <img src={expert.image} className="w-full h-full rounded-full" alt="" />
              </div>
              <div className="absolute -bottom-2 -end-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg border border-gray-50 dark:border-slate-800">
                <LuAward className="text-yellow-500" size={20} />
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-center gap-1">
                <h3 className="text-2xl font-bold dark:text-white">{expert.title}</h3>
                <LuBadgeCheck className="text-blue-500" size={20} />
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide">{expert.specialization}</p>
              <div className="flex items-center justify-center gap-2 mt-3 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full w-fit mx-auto">
                <LuStar className="text-yellow-500" fill="currentColor" size={14} />
                <span className="font-bold text-sm dark:text-white">{expert.rating}</span>
                <span className="text-gray-400 text-xs">({expert.reviews} {t("experts.reviews")})</span>
              </div>
            </div>

            <div className="mt-8 w-full text-start">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t("experts.hourlyRate")}</p>
              <p className="text-2xl font-black dark:text-white mb-4">{t("common.egp")} {expert.hourlyRate.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{expert.description}</p>
            </div>

            <button className="mt-8 w-full py-4 bg-gray-900 dark:bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg">
              {t("experts.viewProfile")}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Expert Detail Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedExpert(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[60]" />
            <motion.div layoutId={`expert-container-${selectedExpert.id}`}
              className="fixed inset-0 m-auto w-[95%] max-w-2xl h-fit max-h-[90vh] bg-white dark:bg-slate-900 z-[70] rounded-[3rem] p-10 overflow-y-auto border border-gray-100 dark:border-slate-800 shadow-2xl">
              <button onClick={() => setSelectedExpert(null)}
                className="absolute top-8 end-8 p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white">
                <LuX size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-start">
                <img src={selectedExpert.image} className="w-40 h-40 rounded-[2.5rem] bg-green-50 dark:bg-green-900/20" alt="" />
                <div className="flex-1 space-y-4 pt-4">
                  <div>
                    <h2 className="text-3xl font-black dark:text-white">{selectedExpert.title}</h2>
                    <p className="text-green-600 font-bold text-lg">{selectedExpert.specialization}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{selectedExpert.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <LuBriefcase className="text-green-600" size={24} />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t("experts.hourlyRate")}</p>
                        <p className="font-bold dark:text-white">{t("common.egp")} {selectedExpert.hourlyRate.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <LuMapPin className="text-emerald-600" size={24} />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{t("experts.location")}</p>
                        <p className="font-bold dark:text-white">{selectedExpert.location || "-"}</p>
                      </div>
                    </div>
                    {selectedExpert.academicDegree && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                        <LuGraduationCap className="text-blue-600" size={24} />
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">{t("experts.degree")}</p>
                          <p className="font-bold dark:text-white">{selectedExpert.academicDegree}</p>
                        </div>
                      </div>
                    )}
                    {selectedExpert.experienceYears > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                        <LuAward className="text-yellow-500" size={24} />
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">{t("experts.experience")}</p>
                          <p className="font-bold dark:text-white">{selectedExpert.experienceYears} {t("experts.years")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button onClick={() => navigate(`/chat/${selectedExpert.userId || selectedExpert.id}`)}
                      className="flex-1 py-5 bg-green-600 text-white rounded-3xl font-black text-xl hover:bg-green-700 transition-all transform hover:scale-[1.02]">
                      {t("experts.consult")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      {showCreateModal && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black dark:text-white">{t("experts.createTitle")}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("experts.createSub")}</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 dark:text-slate-300 hover:text-red-500 transition">
                  <LuX size={26} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input type="text" name="title" value={createForm.title} onChange={handleCreateInput}
                    placeholder={t("experts.listingTitle")}
                    className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.title ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none`} />
                  {fieldErrors.title && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.title}</p>}
                </div>
                <div>
                  <input type="text" name="specialty" value={createForm.specialty} onChange={handleCreateInput}
                    placeholder={t("experts.specialty")}
                    className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.specialty ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none`} />
                  {fieldErrors.specialty && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.specialty}</p>}
                </div>
                <div>
                  <textarea name="description" value={createForm.description} onChange={handleCreateInput}
                    placeholder={t("experts.descPlaceholder")}
                    className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.description ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none h-32 resize-none`} />
                  {fieldErrors.description && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.description}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input type="number" name="hourlyRate" value={createForm.hourlyRate} onChange={handleCreateInput}
                      placeholder={t("experts.hourlyPlaceholder")}
                      className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.hourlyRate ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none`} />
                    {fieldErrors.hourlyRate && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.hourlyRate}</p>}
                  </div>
                  <div>
                    <input type="text" name="location" value={createForm.location} onChange={handleCreateInput}
                      placeholder={t("experts.locationPlaceholder")}
                      className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.location ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none`} />
                    {fieldErrors.location && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.location}</p>}
                  </div>
                </div>
                <div>
                  <input type="text" name="imageUrl" value={createForm.imageUrl} onChange={handleCreateInput}
                    placeholder={t("experts.imageUrl")}
                    className={`w-full bg-gray-50 dark:bg-slate-800 border ${fieldErrors.imageUrl ? 'border-red-400 dark:border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none`} />
                  {fieldErrors.imageUrl && <p className="text-xs text-red-500 font-semibold mt-1 ml-2">{fieldErrors.imageUrl}</p>}
                </div>
                {formError && <p className="text-red-600 font-bold">{formError}</p>}
                {successMessage && <p className="text-green-600 font-bold">{successMessage}</p>}
                <button onClick={handleCreateListing}
                  className="w-full py-4 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-green-700 transition">
                  {t("experts.publish")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Experts;
