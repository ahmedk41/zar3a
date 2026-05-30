import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../API/axiosInstance";
import DualImageUpload from "../../components/DualImageUpload";
import {
  LuSearch,
  LuShoppingCart,
  LuStar,
  LuX,
  LuFilter,
  LuPlus,
  LuMinus,
  LuCheck,
  LuMapPin,
  LuDollarSign,
  LuSlidersHorizontal,
  LuLayoutGrid,
  LuTrash2,
} from "react-icons/lu";
import { FiEdit } from "react-icons/fi";

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    title: "NPK Fertilizer 20-20-20",
    category: "Fertilizers",
    price: 450,
    rating: 4.8,
    owner: "AgroChem Egypt",
    isVerified: true,
    region: "Cairo",
    image: "🧪",
    description: "Balanced nutrient mix for all vegetative growth stages.",
    marketType: "shop",
  },
  {
    id: 2,
    title: "Smart Soil Sensor V2",
    category: "IoT Devices",
    price: 1200,
    rating: 4.9,
    owner: "Zar3a Tech",
    isVerified: true,
    region: "Giza",
    image: "📡",
    description: "Real-time moisture, temperature, and pH monitoring.",
    marketType: "shop",
  },
  {
    id: 101,
    title: "Export-Grade Cotton",
    category: "Fibers",
    price: 45000,
    unit: "Ton",
    rating: 4.9,
    owner: "Ahmed Mansour",
    isVerified: true,
    region: "Assiut",
    image: "☁️",
    description: "Premium long-staple Egyptian cotton.",
    marketType: "market",
  },
  {
    id: 102,
    title: "Organic Wheat",
    category: "Grains",
    price: 13000,
    unit: "Ton",
    rating: 4.6,
    owner: "Hassan El-Delta",
    isVerified: true,
    region: "Sharqia",
    image: "🌾",
    description: "High-quality wheat, strictly organic.",
    marketType: "market",
  },
];

const TO_SHOP_CATEGORIES = [
  "Fertilizers",
  "IoT Devices",
  "Irrigation",
  "Seeds",
  "Tools",
  "Chemicals",
  "Equipment",
];

const renderProductImage = (imageSrc, title, className = "w-full h-full object-cover rounded-4xl", textClassName = "text-7xl") => {
  if (!imageSrc) return <span className={textClassName}>🛒</span>;
  const srcStr = imageSrc.toString().trim();
  if (srcStr.startsWith("http://") || srcStr.startsWith("https://")) {
    return <img src={srcStr} className={className} alt={title} />;
  }
  if (srcStr.startsWith("/uploads/") || srcStr.startsWith("uploads/")) {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
    const fullUrl = srcStr.startsWith("/") ? `${backendUrl}${srcStr}` : `${backendUrl}/${srcStr}`;
    return <img src={fullUrl} className={className} alt={title} />;
  }
  return <span className={textClassName}>{srcStr}</span>;
};

const normalizeProduct = (product) => {
  const marketplaceType = product.marketplaceType || product.type || "CROP_MARKET";
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    price: product.price,
    description: product.description,
    region: product.region || "-",
    image: product.imageUrl || "🛒",
    owner: product.User?.fullName || product.User?.username || "Unknown",
    isVerified: product.isVerified,
    unit: product.unit || "unit",
    rating: product.rating || 4.5,
    marketplaceType,
    marketType:
      marketplaceType === "SENSOR_MARKET"
        ? "sensors"
        : marketplaceType === "AGRI_MARKET"
        ? "shop"
        : marketplaceType === "CROP_MARKET"
        ? "market"
        : TO_SHOP_CATEGORIES.includes(product.category)
        ? "shop"
        : "market",
  };
};


const CustomSelect = ({ value, onChange, options, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || "Select...";

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={dropdownRef}>
      <div
        className="w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer flex justify-between items-center focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg className={`w-4 h-4 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-1"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`mx-2 my-1 px-4 py-3 text-sm font-bold rounded-xl cursor-pointer transition-colors ${value === opt.value ? 'bg-green-500 text-white dark:bg-green-600' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/80'}`}
                onClick={() => {
                  onChange({ target: { name: opt.name, value: opt.value } });
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Marketplace = () => {
  const { user, getProducts, createProduct } = useAuth();
  const { cart, addToCart: hookAddToCart, removeFromCart, updateQuantity } = useCart(user?.id);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("shop");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [quoteLocation, setQuoteLocation] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Top Rated");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
    
  useEffect(() => {
    if (activeTab === "sensors" && user && !["FARMER", "BUYER", "ADMIN"].includes(user.role)) {
      setActiveTab("shop");
    }
  }, [activeTab, user]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    unit: "unit",
    region: "",
    imageUrl: "",
    marketplaceType: "CROP_MARKET",
    productSource: "MANUAL",
    status: "AVAILABLE",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Product Reviews states & handlers
  const [reviewsData, setReviewsData] = useState({ reviews: [], totalReviews: 0, averageRating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id);
    } else {
      setReviewsData({ reviews: [], totalReviews: 0, averageRating: 0 });
      setEditingReviewId(null);
      setNewComment("");
      setNewRating(5);
      setReviewError("");
      setReviewSuccess("");
    }
  }, [selectedProduct]);

  const fetchReviews = async (productId) => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/marketplace/products/${productId}/reviews`);
      setReviewsData(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError(t("market.loginToReview") || "Please login to leave feedback");
      return;
    }
    if (!newComment.trim()) {
      setReviewError(t("market.commentRequired") || "Comment is required");
      return;
    }

    try {
      setReviewError("");
      setReviewSuccess("");
      const apiEndpoint = editingReviewId
        ? `/marketplace/products/${selectedProduct.id}/reviews/${editingReviewId}`
        : `/marketplace/products/${selectedProduct.id}/reviews`;

      if (editingReviewId) {
        await api.put(apiEndpoint, {
          rating: newRating,
          comment: newComment,
        });
        setReviewSuccess(t("market.reviewUpdated") || "Review updated successfully!");
        setEditingReviewId(null);
      } else {
        await api.post(apiEndpoint, {
          rating: newRating,
          comment: newComment,
        });
        setReviewSuccess(t("market.reviewAdded") || "Review submitted successfully!");
      }
      setNewComment("");
      setNewRating(5);
      fetchReviews(selectedProduct.id);
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Failed to submit review.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setNewRating(review.rating);
    setNewComment(review.comment);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t("market.confirmDeleteReview") || "Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/marketplace/products/${selectedProduct.id}/reviews/${reviewId}`);
      fetchReviews(selectedProduct.id);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete review");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map(normalizeProduct));
      }
    } catch (err) {
      console.error("Failed to load marketplace products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateInput = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleCreateProduct = async () => {
    if (!createForm.title || !createForm.description || !createForm.category || !createForm.price) {
      return setFormError(t("experts.requiredFields") || "All fields are required");
    }

    try {
      let type = createForm.marketplaceType;
      if (user?.role === "FARMER") type = "CROP_MARKET";
      if (user?.role === "SUPPLIER") type = "AGRI_MARKET";

      let productData;
      if (imageFile) {
        productData = new FormData();
        productData.append("title", createForm.title);
        productData.append("description", createForm.description);
        productData.append("category", createForm.category);
        productData.append("price", Number(createForm.price));
        productData.append("unit", createForm.unit);
        productData.append("region", createForm.region);
        productData.append("marketplaceType", type);
        productData.append("productSource", createForm.productSource);
        productData.append("status", createForm.status);
        productData.append("imageFile", imageFile);
      } else {
        productData = {
          ...createForm,
          price: Number(createForm.price),
          marketplaceType: type,
          status: createForm.status || 'AVAILABLE',
        };
      }

      const newProduct = await createProduct(productData);
      setProducts((prev) => [normalizeProduct(newProduct), ...prev]);
      setSuccessMessage(t("experts.created") || "Product created successfully");
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", category: "", price: "", unit: "unit", region: "", imageUrl: "", marketplaceType: "CROP_MARKET", productSource: "MANUAL", status: "AVAILABLE" });
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || t("common.error") || "An error occurred");
    }
  };

  const addToCart = (product) => {
    // Determine the type based on marketplaceType
    const type = product.marketplaceType === 'AGRI_MARKET' ? 'agri' : 'crop';
    hookAddToCart(product, type);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;
    navigate('/payment');
  };

  const updateQty = (productId, type, delta) => {
    const item = cart.find((i) => i.productId === productId && i.type === type);
    if (item) {
      updateQuantity(productId, type, Math.max(1, item.quantity + delta));
    }
  };

  const removeFromCartByProductId = (productId, type) => {
    removeFromCart(productId, type);
  };

  const activeData = products.filter((item) => item.marketType === activeTab);
  const categories = ["All", ...new Set(activeData.map((item) => item.category))];

  const filteredData = activeData
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((item) => item.price <= maxPrice)
    .filter((item) => (selectedCategory === "All" ? true : item.category === selectedCategory))
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Top Rated") return b.rating - a.rating;
      return 0;
    });

  const canCreate = user?.role === "SUPPLIER" || user?.role === "FARMER" || user?.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 text-left">

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && quoteProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowQuoteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black dark:text-white">Request Quote</h3>
                <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-red-500">
                  <LuX size={24} />
                </button>
              </div>
              <div className="mb-4 p-4 bg-green-50 dark:bg-slate-800 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={quoteProduct.image} alt={quoteProduct.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold dark:text-white">{quoteProduct.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quoteProduct.owner}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantity Required</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                    className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Farm Location</label>
                  <input
                    type="text"
                    value={quoteLocation}
                    onChange={(e) => setQuoteLocation(e.target.value)}
                    placeholder="Enter full address or region..."
                    className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Additional Message</label>
                  <textarea
                    rows="3"
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    placeholder="Specify any installation requirements or questions..."
                    className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white resize-none outline-none"
                  ></textarea>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await api.post('/api/market/inquiries', {
                        productId: quoteProduct.id,
                        quantity: quoteQuantity,
                        location: quoteLocation,
                        message: quoteMessage
                      });
                      alert(res.data.message || 'Quote requested successfully!');
                      setShowQuoteModal(false);
                    } catch (err) {
                      alert('Failed to request quote.');
                      console.error(err);
                    }
                  }}
                  className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg mt-2"
                >
                  Submit Inquiry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex w-full md:w-auto bg-gray-50 dark:bg-slate-800 p-1.5 rounded-full relative">
          <button
            onClick={() => {
              setActiveTab("shop");
              setSelectedCategory("All");
              setIsFilterOpen(false);
            }}
            className={`relative flex-1 md:flex-none px-6 py-3 rounded-full font-black text-sm transition-all z-10 ${
              activeTab === "shop"
                ? "text-white"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t("nav.agriShop")}
            {activeTab === "shop" && (
              <motion.div
                layoutId="tabBg"
                className="absolute inset-0 bg-green-600 rounded-full -z-10 shadow-lg shadow-green-200 dark:shadow-none"
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("market");
              setSelectedCategory("All");
              setIsFilterOpen(false);
            }}
            className={`relative flex-1 md:flex-none px-6 py-3 rounded-full font-black text-sm transition-all z-10 ${
              activeTab === "market"
                ? "text-white"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t("nav.cropMarket")}
            {activeTab === "market" && (
              <motion.div
                layoutId="tabBg"
                className="absolute inset-0 bg-green-600 rounded-full -z-10 shadow-lg shadow-green-200 dark:shadow-none"
              />
            )}
          </button>
          {(user?.role === "FARMER" || user?.role === "BUYER" || user?.role === "ADMIN") && (
            <button
              onClick={() => {
                setActiveTab("sensors");
                setSelectedCategory("All");
                setIsFilterOpen(false);
              }}
              className={`relative flex-1 md:flex-none px-6 py-3 rounded-full font-black text-sm transition-all z-10 ${
                activeTab === "sensors"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Our Sensors
              {activeTab === "sensors" && (
                <motion.div
                  layoutId="tabBg"
                  className="absolute inset-0 bg-green-600 rounded-full -z-10 shadow-lg shadow-green-200 dark:shadow-none"
                />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {user && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center gap-3 bg-gray-900 dark:bg-slate-800 text-white px-8 py-4 rounded-full font-black hover:scale-105 transition-transform shadow-xl w-full sm:w-auto"
            >
              <LuShoppingCart size={22} />
              <span>{t("common.egp")} {cart.reduce((t, i) => t + i.price * i.quantity, 0).toLocaleString()}</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full text-[10px] flex items-center justify-center animate-bounce border-2 border-white dark:border-slate-800">
                  {cart.length}
                </span>
              )}
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-black hover:bg-green-700 transition-transform shadow-xl w-full sm:w-auto"
            >
              <LuPlus size={20} /> {t("market.addProduct")}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-40">
        <div className="flex-1 relative bg-white dark:bg-slate-900 rounded-4xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center p-2 focus-within:ring-2 ring-green-500/50 transition-all">
          <div className="p-3 text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            <LuSearch size={22} />
          </div>
          <input
            type="text"
            placeholder={t("market.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-gray-700 dark:text-white w-full px-4"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-4 px-6 rounded-4xl shadow-sm border transition-all flex items-center justify-center gap-3 font-bold ${
            isFilterOpen
              ? "bg-green-600 border-green-600 text-white shadow-lg"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-600 hover:text-green-600"
          }`}
        >
          <LuFilter size={24} />
          <span className="text-sm tracking-wide">{isFilterOpen ? t("market.closeFilters") : t("market.openFilters")}</span>
        </button>
      </div>

      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl p-8 relative z-30"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <LuLayoutGrid /> {t("market.category")}
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat === "All" ? t("market.all") : cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <LuSlidersHorizontal /> {t("market.sortBy")}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option>{t("experts.reviews") === "reviews" ? "Top Rated" : "Top Rated"}</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-end mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <LuDollarSign /> {t("market.maxPrice")}
                </p>
                <span className="text-sm font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                  {t("common.egp")} {Number(maxPrice).toLocaleString()}
                </span>
              </div>
              <input type="range" min="0" max="100000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 dark:bg-slate-700" />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={`${item.id}-${item.title}`}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
            >
              <div
                onClick={() => {
                  setSelectedProduct(item);
                }}
                className="bg-gray-50 dark:bg-slate-800 h-48 rounded-4xl mb-5 flex items-center justify-center text-7xl cursor-pointer group-hover:scale-[1.02] transition-transform relative overflow-hidden"
              >
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-600 dark:text-gray-300 flex items-center gap-1 shadow-sm">
                  <LuMapPin size={12} className="text-green-600" /> {item.region}
                </div>
                {renderProductImage(item.image, item.title)}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold dark:text-gray-300">
                    <LuStar className="text-yellow-400 fill-yellow-400" /> {item.rating}
                  </div>
                </div>

                <h3
                  onClick={() => {
                    setSelectedProduct(item);
                  }}
                  className="text-lg font-black dark:text-white cursor-pointer hover:text-green-600 transition-colors leading-tight line-clamp-2 mt-1"
                >
                  {item.title}
                </h3>

                <div className="flex items-center gap-1.5 mt-2">
                  <p className="text-[11px] font-bold text-gray-400 truncate">{item.owner}</p>
                  {item.isVerified && (
                    <div className="bg-blue-500 rounded-full p-0.5 flex items-center justify-center shrink-0" title="Verified Provider">
                      <LuCheck size={10} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-5 flex items-end justify-between">
                  {item.marketType !== "sensors" ? (
                    <>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t("market.price")}</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">
                          {t("common.egp")} {item.price.toLocaleString()} <span className="text-[10px] text-gray-400">/ {item.unit === "unit" ? t("market.unit") : item.unit}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          addToCart(item);
                        }}
                        className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white dark:hover:bg-green-500 transition-colors shadow-sm"
                        title={t("market.addToCart")}
                      >
                        <LuShoppingCart size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            navigate('/login');
                            return;
                          }
                          setQuoteProduct(item);
                          setShowQuoteModal(true);
                        }}
                        className="w-full bg-gray-900 dark:bg-green-600 text-white px-4 py-3 rounded-2xl font-black hover:bg-gray-800 dark:hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        Request Quote
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredData.length === 0 && !loadingProducts && (
          <div className="col-span-full py-20 text-center">
            <LuSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">{t("market.noItemsFound")}</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setMaxPrice(50000);
                setSelectedCategory("All");
                setIsFilterOpen(false);
              }}
              className="mt-4 text-green-600 font-bold hover:underline"
            >
              {t("market.clearFilters")}
            </button>
          </div>
        )}
      </div>

      {isMounted && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedProduct && (
              <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedProduct(null)}
                  className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 50, opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3.5rem] p-8 md:p-12 relative shadow-2xl z-10 overflow-y-auto max-h-[95vh] custom-scrollbar"
                >
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <LuX size={24} />
                  </button>

                  <div className="flex flex-col md:flex-row gap-10 mt-4">
                    <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-9xl relative overflow-hidden">
                      <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-gray-600 dark:text-gray-300 flex items-center gap-1 shadow-sm">
                        <LuMapPin size={14} className="text-green-600" /> {selectedProduct.region}
                      </div>
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-full h-full flex items-center justify-center">
                        {renderProductImage(selectedProduct.image, selectedProduct.title, "w-full h-full object-cover rounded-4xl", "text-9xl")}
                      </motion.div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full mb-3 inline-block">
                          {selectedProduct.category}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black dark:text-white leading-tight">
                          {selectedProduct.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl w-fit border border-gray-100 dark:border-slate-700/50">
                          <span className="font-bold text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                            {selectedProduct.owner}
                            {selectedProduct.isVerified && (
                              <div className="bg-blue-500 rounded-full p-1 flex items-center justify-center" title="Verified Provider">
                                <LuCheck size={12} className="text-white" strokeWidth={4} />
                              </div>
                            )}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="font-bold text-gray-500 text-sm flex items-center gap-1">
                            <LuStar className="text-yellow-400 fill-yellow-400" /> {selectedProduct.rating}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-8">
                          {selectedProduct.description}
                        </p>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-4 rounded-4xl border border-gray-100 dark:border-slate-700/50">
                          <div className="px-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("market.unitPrice")}</p>
                            <p className="text-2xl font-black dark:text-white leading-none">
                              {t("common.egp")} {selectedProduct.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              handleAddToCart(selectedProduct);
                              setSelectedProduct(null);
                            }}
                            className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <LuPlus size={18} /> {t("market.addToCart")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- REVIEWS & FEEDBACK SYSTEM --- */}
                  <div className="mt-12 pt-10 border-t border-gray-100 dark:border-slate-800 text-left">
                    <h3 className="text-2xl font-black dark:text-white tracking-tight mb-2">
                      {t("market.reviewsTitle") || "Product Reviews"}
                    </h3>
                    <div className="flex items-center gap-6 mb-8 bg-gray-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80">
                      <div>
                        <p className="text-4xl font-black text-slate-800 dark:text-white">
                          {reviewsData.averageRating || "0.0"}
                        </p>
                        <div className="flex items-center gap-0.5 text-yellow-400 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <LuStar
                              key={s}
                              className={s <= Math.round(reviewsData.averageRating || 0) ? "fill-yellow-400" : "text-gray-300 dark:text-slate-700"}
                              size={16}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                          {reviewsData.totalReviews || 0} {t("market.reviews") || "Reviews"}
                        </p>
                      </div>
                      <div className="w-px h-16 bg-gray-200 dark:bg-slate-800" />
                      <div className="flex-1 text-xs font-semibold text-gray-500 leading-relaxed">
                        {t("market.averageRatingDesc") || "Ratings are collected from verified buyers who purchased this product on the platform."}
                      </div>
                    </div>

                    {/* Review submission form */}
                    {user ? (
                      <form onSubmit={handleSubmitReview} className="mb-10 space-y-4 bg-gray-50/50 dark:bg-slate-800/20 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800/50">
                        <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">
                          {editingReviewId ? (t("market.editReview") || "Edit Your Review") : (t("market.leaveReview") || "Leave a Review")}
                        </h4>
                        
                        {reviewError && (
                          <div className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/30">
                            {reviewError}
                          </div>
                        )}
                        {reviewSuccess && (
                          <div className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            {reviewSuccess}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-400 uppercase mr-2">{t("market.yourRating") || "Rating"}:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="text-yellow-400 hover:scale-110 transition-transform active:scale-95"
                            >
                              <LuStar
                                className={star <= newRating ? "fill-yellow-400" : "text-gray-300 dark:text-slate-700"}
                                size={22}
                              />
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t("market.writeCommentPlaceholder") || "Share your feedback about the product..."}
                            rows={3}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 text-xs font-semibold dark:text-white outline-none focus:border-green-500 transition-colors"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition"
                          >
                            {editingReviewId ? (t("market.update") || "Update") : (t("market.submit") || "Submit")}
                          </button>
                          {editingReviewId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(null);
                                setNewComment("");
                                setNewRating(5);
                              }}
                              className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-300 transition"
                            >
                              {t("market.cancel") || "Cancel"}
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 text-center text-xs font-bold text-gray-400 bg-gray-50 dark:bg-slate-800/40 rounded-2xl mb-8">
                        {t("market.pleaseLoginToReview") || "Please login to write a review for this product."}
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full" />
                        </div>
                      ) : reviewsData.reviews.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic py-4 text-center">
                          {t("market.noReviewsYet") || "No reviews yet. Be the first to review!"}
                        </p>
                      ) : (
                        reviewsData.reviews.map((rev) => {
                          const isOwn = user && rev.userId === user.id;
                          const isAdmin = user && user.role === "ADMIN";

                          return (
                            <div key={rev.id} className="bg-gray-50/50 dark:bg-slate-800/20 p-5 rounded-3xl border border-gray-100/50 dark:border-slate-800/30 flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black dark:text-white">
                                    {rev.User?.fullName || "Zar3a Member"}
                                  </span>
                                  <div className="flex items-center text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <LuStar
                                        key={s}
                                        className={s <= rev.rating ? "fill-yellow-400" : "text-gray-200 dark:text-slate-800"}
                                        size={12}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {rev.comment}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </p>
                              </div>

                              {(isOwn || isAdmin) && (
                                <div className="flex gap-1">
                                  {isOwn && (
                                    <button
                                      onClick={() => handleEditReview(rev)}
                                      className="p-2 bg-gray-100 hover:bg-green-50 hover:text-green-600 dark:bg-slate-800 dark:hover:bg-green-950/20 dark:text-slate-400 rounded-xl transition-all"
                                      title="Edit Review"
                                    >
                                      <FiEdit size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/20 dark:text-slate-400 rounded-xl transition-all"
                                    title="Delete Review"
                                  >
                                    <LuTrash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {isCartOpen && (
              <div className="fixed inset-0 flex justify-end" style={{ zIndex: 999999 }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCartOpen(false)}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="relative h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col z-10 border-l border-gray-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                        <LuShoppingCart size={20} />
                      </div>
                      {t("market.cart")}
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <LuX size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                        <LuShoppingCart size={80} strokeWidth={1} />
                        <p className="font-black text-xl">{t("market.cartEmpty")}</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={`${item.productId}-${item.type}`}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-4xl border border-gray-100 dark:border-slate-700/50 group hover:border-green-200 dark:hover:border-green-900 transition-colors"
                        >
                          <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm overflow-hidden">
                            {renderProductImage(item.imageUrl || '🛒', item.title, "w-full h-full object-cover rounded-2xl", "text-3xl")}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm dark:text-white leading-tight mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-xs font-black text-green-600">{t("common.egp")} {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm">
                            <button
                              onClick={() => updateQty(item.productId, item.type, -1)}
                              className="w-7 h-7 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            >
                              <LuMinus size={12} />
                            </button>
                            <span className="font-black text-xs w-3 text-center dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.type, 1)}
                              className="w-7 h-7 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                            >
                              <LuPlus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCartByProductId(item.productId, item.type)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <LuX size={18} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-4 space-y-6 bg-white dark:bg-slate-900 relative z-20">
                    <div className="flex justify-between items-end bg-gray-50 dark:bg-slate-800 p-6 rounded-4xl border border-gray-100 dark:border-slate-700/50">
                      <span className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] mb-1">{t("market.totalEstimate")}</span>
                      <span className="font-black text-3xl dark:text-white leading-none">
                        {t("common.egp")} {cart.reduce((t, i) => t + i.price * i.quantity, 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      className="w-full py-5 bg-gray-900 dark:bg-green-600 disabled:bg-gray-200 disabled:dark:bg-slate-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-4xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95"
                    >
                      {t("market.checkoutSecure")}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {showCreateModal && isMounted && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div
                initial={{ y: 25, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 25, opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl shadow-green-900/5 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black dark:text-white">{t("market.addMarketProd")}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t("market.addMarketDesc")}</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-500 dark:text-slate-300 hover:text-red-500 transition"
                  >
                    <LuX size={26} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <input
                    type="text"
                    name="title"
                    value={createForm.title}
                    onChange={handleCreateInput}
                    placeholder={t("market.prodTitle")}
                    className="md:col-span-2 w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm placeholder:text-gray-400"
                  />
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateInput}
                    placeholder={t("market.prodDesc")}
                    className="md:col-span-2 w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm placeholder:text-gray-400 h-28 resize-none"
                  />
                  
                  <CustomSelect
                    value={createForm.category}
                    onChange={handleCreateInput}
                    placeholder={t("market.category") || "Category"}
                    options={[
                      ...(user?.role !== "SUPPLIER" ? [{ label: "PRODUCE", value: "PRODUCE", name: "category" }] : []),
                      ...(user?.role !== "FARMER" ? [
                        { label: "SEEDS", value: "SEEDS", name: "category" },
                        { label: "FERTILIZERS", value: "FERTILIZERS", name: "category" },
                        { label: "TOOLS", value: "TOOLS", name: "category" },
                        { label: "EQUIPMENT", value: "EQUIPMENT", name: "category" }
                      ] : []),
                      { label: "OTHER", value: "OTHER", name: "category" }
                    ]}
                  />
                  
                  <input
                    type="number"
                    name="price"
                    value={createForm.price}
                    onChange={handleCreateInput}
                    placeholder={t("market.price")}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm placeholder:text-gray-400"
                  />
                  
                  <CustomSelect
                    value={user?.role === "FARMER" ? "CROP_MARKET" : user?.role === "SUPPLIER" ? "AGRI_MARKET" : createForm.marketplaceType}
                    onChange={handleCreateInput}
                    disabled={user?.role === "FARMER" || user?.role === "SUPPLIER"}
                    options={[
                      { label: t("nav.cropMarket") || "Crop Market", value: "CROP_MARKET", name: "marketplaceType" },
                      { label: t("nav.agriShop") || "Agri Shop", value: "AGRI_MARKET", name: "marketplaceType" },
                      ...(user?.role === "ADMIN" ? [{ label: "Our Sensors", value: "SENSOR_MARKET", name: "marketplaceType" }] : [])
                    ]}
                    placeholder="Select Market"
                  />
                  
                  <CustomSelect
                    value={createForm.productSource}
                    onChange={handleCreateInput}
                    options={[
                      { label: t("market.manual") || "Manual", value: "MANUAL", name: "productSource" },
                      { label: t("market.sensed") || "Sensed", value: "SENSED", name: "productSource" }
                    ]}
                    placeholder="Product Source"
                  />
                  
                  <CustomSelect
                    value={createForm.status}
                    onChange={handleCreateInput}
                    options={[
                      { label: t("market.available") || "Available", value: "AVAILABLE", name: "status" },
                      { label: t("market.sold") || "Sold", value: "SOLD", name: "status" },
                      { label: t("market.deleted") || "Deleted", value: "DELETED", name: "status" }
                    ]}
                    placeholder="Availability"
                  />
                  
                  <CustomSelect
                    value={createForm.unit}
                    onChange={handleCreateInput}
                    options={[
                      { label: "Liter (L)", value: "liter", name: "unit" },
                      { label: "Kilogram (Kg)", value: "kg", name: "unit" },
                      { label: "Ton", value: "ton", name: "unit" },
                      { label: "Unit", value: "unit", name: "unit" }
                    ]}
                    placeholder="Select Unit"
                  />
                  
                  <input
                    type="text"
                    name="region"
                    value={createForm.region}
                    onChange={handleCreateInput}
                    placeholder={t("market.region") || "Region"}
                    className="md:col-span-2 w-full bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm placeholder:text-gray-400"
                  />

                  <div className="md:col-span-2 mt-2">
                    <DualImageUpload
                      label={t("market.imageSource") === "market.imageSource" ? "Image Source" : t("market.imageSource")}
                      value={createForm.imageUrl}
                      onChange={(e) => { handleCreateInput(e); setImageFile(null); setImagePreview(""); }}
                      previewImage={imagePreview}
                      onFileChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                          setCreateForm(prev => ({ ...prev, imageUrl: "" }));
                        }
                      }}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-4 mt-2">
                    {formError && <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100">{formError}</p>}
                    {successMessage && <p className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-xl border border-green-100">{successMessage}</p>}
                    <button
                      onClick={handleCreateProduct}
                      className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/30 active:scale-[0.98] transition-all duration-200"
                    >
                      {t("market.createListing")}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default Marketplace;
