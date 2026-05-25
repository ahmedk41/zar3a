import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuMessageSquare,
  LuStar,
  LuBadgeCheck,
  LuX,
  LuBriefcase,
  LuGraduationCap,
  LuAward,
  LuSearch,
  LuPlus,
  LuCheck,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FALLBACK_EXPERTS = [
  {
    id: 1,
    title: "Soil & Irrigation Specialist",
    specialty: "Soil & Irrigation Specialist",
    rating: 4.9,
    reviews: 124,
    hourlyRate: 220,
    location: "Cairo",
    description: "Specializes in smart irrigation systems and soil salinity management for desert environments.",
    education: "PhD in Agricultural Science - Cairo University",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    owner: "Dr. Ahmed Salem",
  },
  {
    id: 2,
    title: "Plant Pathology Expert",
    specialty: "Plant Pathology Expert",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 180,
    location: "Alexandria",
    description: "Expert in identifying and treating fungal and viral diseases in greenhouse crops.",
    education: "MSc in Plant Protection - Alexandria University",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    owner: "Eng. Sarah Younis",
  },
  {
    id: 3,
    title: "Hydroponics Consultant",
    specialty: "Hydroponics Consultant",
    rating: 5.0,
    reviews: 210,
    hourlyRate: 300,
    location: "Giza",
    description: "Pioneer in vertical farming and nutrient film technique (NFT) systems in Egypt.",
    education: "Post-Doc in Modern Farming - Wageningen University",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed",
    owner: "Prof. Mohamed Ali",
  },
];

const normalizeListing = (listing) => ({
  id: listing.id,
  userId: listing.userId,
  title: listing.title,
  specialty: listing.specialty,
  description: listing.description,
  hourlyRate: listing.hourlyRate,
  location: listing.location || "-",
  image: listing.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Expert",
  rating: listing.rating || 4.8,
  reviews: listing.reviews || 24,
  owner: listing.User?.fullName || listing.User?.username || "Expert",
});

const Experts = () => {
  const navigate = useNavigate();
  const { user, getExpertListings, createExpertListing } = useAuth();
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expertCards, setExpertCards] = useState(FALLBACK_EXPERTS);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    specialty: "",
    description: "",
    hourlyRate: "",
    location: "",
    imageUrl: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await getExpertListings();
        if (Array.isArray(data) && data.length > 0) {
          setExpertCards(data.map(normalizeListing));
        }
      } catch (err) {
        console.error("Failed to load expert listings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [getExpertListings]);

  const expertType = user?.role === "AGRO_EXPERT" && user?.isApproved;
  const canCreate = expertType || user?.role === "ADMIN";

  const handleCreateInput = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleCreateListing = async () => {
    if (!createForm.title || !createForm.specialty || !createForm.description || !createForm.hourlyRate) {
      return setFormError("Please complete all required fields.");
    }

    try {
      const newListing = await createExpertListing({
        ...createForm,
        hourlyRate: Number(createForm.hourlyRate),
      });
      setExpertCards((prev) => [normalizeListing(newListing), ...prev]);
      setSuccessMessage("Expert card created successfully.");
      setShowCreateModal(false);
      setCreateForm({ title: "", specialty: "", description: "", hourlyRate: "", location: "", imageUrl: "" });
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Could not create expert card.");
    }
  };

  const filteredExperts = expertCards.filter(
    (expert) =>
      expert.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Consult our <span className="text-green-600">Experts</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Connect with certified agricultural specialists and expert advisors.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by specialty or name..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 transition-all shadow-sm shadow-gray-100 dark:shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-3xl bg-green-600 px-6 py-4 text-white font-black hover:bg-green-700 transition-shadow shadow-xl"
            >
              <LuPlus size={20} /> Create Expert Card
            </button>
          )}
        </div>
      </section>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperts.map((expert) => (
          <motion.div
            key={`${expert.id}-${expert.owner}`}
            layoutId={`expert-container-${expert.id}`}
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col items-center text-center group cursor-pointer"
            onClick={() => setSelectedExpert(expert)}
          >
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-green-50 dark:bg-green-900/20 p-1">
                <img src={expert.image} className="w-full h-full rounded-full" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg border border-gray-50 dark:border-slate-800">
                <LuAward className="text-yellow-500" size={20} />
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-center space-x-1">
                <h3 className="text-2xl font-bold dark:text-white">{expert.owner}</h3>
                <LuBadgeCheck className="text-blue-500" size={20} />
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide">{expert.specialty}</p>

              <div className="flex items-center justify-center space-x-2 mt-3 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full w-fit mx-auto">
                <LuStar className="text-yellow-500" fill="currentColor" size={14} />
                <span className="font-bold text-sm dark:text-white">{expert.rating}</span>
                <span className="text-gray-400 text-xs">({expert.reviews} reviews)</span>
              </div>
            </div>

            <div className="mt-8 w-full text-left">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Hourly Rate</p>
              <p className="text-2xl font-black dark:text-white mb-4">EGP {expert.hourlyRate.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{expert.description}</p>
            </div>

            <button className="mt-8 w-full py-4 bg-gray-900 dark:bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg">
              View Profile
            </button>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedExpert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExpert(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-60"
            />
            <motion.div
              layoutId={`expert-container-${selectedExpert.id}`}
              className="fixed inset-0 m-auto w-[95%] max-w-2xl h-fit max-h-[90vh] bg-white dark:bg-slate-900 z-70 rounded-[3rem] p-10 overflow-y-auto border border-gray-100 dark:border-slate-800 shadow-2xl"
            >
              <button
                onClick={() => setSelectedExpert(null)}
                className="absolute top-8 right-8 p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"
              >
                <LuX size={24} />
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <img
                  src={selectedExpert.image}
                  className="w-40 h-40 rounded-[2.5rem] bg-green-50 dark:bg-green-900/20"
                  alt=""
                />
                <div className="flex-1 space-y-4 pt-4">
                  <div>
                    <h2 className="text-3xl font-black dark:text-white">{selectedExpert.owner}</h2>
                    <p className="text-green-600 font-bold text-lg">{selectedExpert.specialty}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{selectedExpert.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <LuBriefcase className="text-green-600" size={24} />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Hourly Rate</p>
                        <p className="font-bold dark:text-white">EGP {selectedExpert.hourlyRate.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <LuGraduationCap className="text-blue-600" size={24} />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                        <p className="font-bold dark:text-white">{selectedExpert.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={() => navigate(`/chat/${selectedExpert.userId || selectedExpert.id}`)}
                      className="flex-1 py-5 bg-green-600 text-white rounded-3xl font-black text-xl hover:bg-green-700 transition-all transform hover:scale-[1.02]"
                    >
                      Start Free Consultation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showCreateModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black dark:text-white">Create Expert Listing</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Approved experts can publish their profile card in the Experts marketplace.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-500 dark:text-slate-300 hover:text-red-500 transition"
                >
                  <LuX size={26} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="title"
                  value={createForm.title}
                  onChange={handleCreateInput}
                  placeholder="Listing title"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="text"
                  name="specialty"
                  value={createForm.specialty}
                  onChange={handleCreateInput}
                  placeholder="Specialty"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                />
                <textarea
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateInput}
                  placeholder="Describe your expertise and services"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none h-32 resize-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="hourlyRate"
                    value={createForm.hourlyRate}
                    onChange={handleCreateInput}
                    placeholder="Hourly rate"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    name="location"
                    value={createForm.location}
                    onChange={handleCreateInput}
                    placeholder="Location"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <input
                  type="text"
                  name="imageUrl"
                  value={createForm.imageUrl}
                  onChange={handleCreateInput}
                  placeholder="Image URL (optional)"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                />
                {formError && <p className="text-red-600 font-bold">{formError}</p>}
                {successMessage && <p className="text-green-600 font-bold">{successMessage}</p>}
                <button
                  onClick={handleCreateListing}
                  className="w-full py-4 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-green-700 transition"
                >
                  Publish Expert Card
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
