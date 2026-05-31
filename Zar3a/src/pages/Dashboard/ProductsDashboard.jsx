import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch,
  LuTrash2,
  LuSlidersHorizontal,
  LuSprout,
  LuPackage,
  LuCheck,
  LuLayoutGrid,
  LuX,
  LuPlus
} from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle, FiEdit } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductsDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [boostedProducts, setBoostedProducts] = useState(() => {
    const saved = localStorage.getItem("boosted_products");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL"); // "ALL" | "CROP" | "AGRI"
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit Product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    unit: "",
    region: "",
    category: "",
    status: "",
    imageUrl: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Enforce access: Admin, Supplier, and Farmer only
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const allowed = ["ADMIN", "SUPPLIER", "FARMER"];
    if (!allowed.includes(user.role)) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let fetchedProducts = [];
      if (user.role === "ADMIN") {
        const [cropRes, agriRes] = await Promise.all([
          api.get("/marketplace/crop-products"),
          api.get("/marketplace/agri-products")
        ]);
        fetchedProducts = [
          ...(Array.isArray(cropRes.data) ? cropRes.data : []),
          ...(Array.isArray(agriRes.data) ? agriRes.data : [])
        ];
      } else if (user.role === "FARMER") {
        const cropRes = await api.get("/marketplace/crop-products");
        fetchedProducts = Array.isArray(cropRes.data) ? cropRes.data : [];
      } else if (user.role === "SUPPLIER") {
        const agriRes = await api.get("/marketplace/agri-products");
        fetchedProducts = Array.isArray(agriRes.data) ? agriRes.data : [];
      }
      
      // Filter products to ONLY show those belonging to the logged-in user
      const userProducts = fetchedProducts.filter(
        p => p.userId === user.id || p.User?.id === user.id
      );
      setProducts(userProducts);
    } catch (err) {
      console.error("Failed to load products in dashboard:", err);
      setErrorMsg(t("prodDash.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t("prodDash.confirmDelete"))) return;
    
    try {
      await api.delete(`/marketplace/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setMessage(t("prodDash.deleteSuccess"));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || t("prodDash.deleteFailed"));
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      unit: product.unit || "unit",
      region: product.region || "",
      category: product.category || "",
      status: product.status || "AVAILABLE",
      imageUrl: product.imageUrl || "",
    });
    setEditImageFile(null);
    let preview = "";
    if (product.imageUrl) {
      preview = product.imageUrl.startsWith("http") ? product.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`;
    }
    setEditImagePreview(preview);
    setEditError("");
    setEditSuccess("");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditError("");
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setEditError("Only images (PNG, JPG, JPEG, WEBP) are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError("Maximum image size is 5MB.");
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setEditError("");
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.price) {
      setEditError("Title, description, and price are required.");
      return;
    }

    try {
      setEditError("");
      setEditSuccess("");
      const formData = new FormData();
      formData.append("title", editForm.title.trim());
      formData.append("description", editForm.description.trim());
      formData.append("price", Number(editForm.price));
      formData.append("unit", editForm.unit);
      formData.append("region", editForm.region);
      formData.append("category", editForm.category);
      formData.append("status", editForm.status);
      
      if (editForm.imageUrl && !editImageFile) {
        formData.append("imageUrl", editForm.imageUrl);
      }

      if (editImageFile) {
        formData.append("imageFile", editImageFile);
      }

      const res = await api.put(`/marketplace/products/${editingProduct.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state list
      const updatedProduct = res.data.product;
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updatedProduct } : p))
      );

      setEditSuccess("Product updated successfully!");
      setTimeout(() => {
        handleCloseEditModal();
      }, 1500);
    } catch (err) {
      console.error(err);
      setEditError(err?.response?.data?.message || "Failed to update product.");
    }
  };


  // Helper to check if a user is permitted to delete this product
  const canDeleteProduct = (product) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    // Supplier can delete only AGRI_MARKET (type = "agri")
    if (user.role === "SUPPLIER") {
      return product.marketplaceType === "AGRI_MARKET";
    }

    // Farmer can delete only CROP_MARKET (type = "crop")
    if (user.role === "FARMER") {
      return product.marketplaceType === "CROP_MARKET";
    }

    return false;
  };

  // Filter products by query and type
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.region && p.region.toLowerCase().includes(searchQuery.toLowerCase()));

      if (activeTypeFilter === "ALL") return matchesSearch;
      if (activeTypeFilter === "CROP") return matchesSearch && p.marketplaceType === "CROP_MARKET";
      if (activeTypeFilter === "AGRI") return matchesSearch && p.marketplaceType === "AGRI_MARKET";
      return matchesSearch;
    });

  const handleBoostAll = () => {
    setBoostedProducts((prev) => {
      const allProductIds = filteredProducts.map(p => p.id);
      const newBoosted = [...new Set([...prev, ...allProductIds])];
      localStorage.setItem("boosted_products", JSON.stringify(newBoosted));
      alert("✨ Success! Your products have been Premium Boosted and are now at the top of the Marketplace.");
      return newBoosted;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4 md:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-card/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-border-default dark:border-slate-800 shadow-sm relative z-10">
          <div>
            <h1 className="text-4xl font-[1000] text-text-main dark:text-white tracking-tighter uppercase flex items-center gap-3">
              <LuPackage className="text-primary-base" /> {t("prodDash.title")}
            </h1>
            <p className="text-sm font-bold text-primary-base dark:text-emerald-400 mt-1 uppercase tracking-widest">
              {t("prodDash.manageOffer")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {filteredProducts.length > 0 && (
              <button
                onClick={handleBoostAll}
                className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-black text-[11px] text-white bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
              >
                Premium Boost by 500 EGP ✨
              </button>
            )}
            <button
              onClick={loadProducts}
              className="flex-1 md:flex-none px-6 py-3 bg-surface-secondary dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs hover:bg-gray-200 transition"
            >
              {t("prodDash.refresh")}
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="flex-1 md:flex-none px-6 py-3 bg-primary-base text-white rounded-2xl font-black text-xs hover:bg-primary-hover transition shadow-lg shadow-green-200 dark:shadow-none"
            >
              {t("prodDash.browseMarket")}
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-6 py-4 bg-primary-light dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl text-primary-base dark:text-green-400 font-semibold"
            >
              <FiCheckCircle className="shrink-0" /> {message}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-semibold"
            >
              <FiAlertCircle className="shrink-0" /> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative bg-surface-card dark:bg-slate-900 rounded-[2rem] border border-border-default dark:border-slate-800 flex items-center p-2">
            <div className="p-3 text-text-disabled bg-surface-secondary dark:bg-slate-800 rounded-2xl">
              <LuSearch size={20} />
            </div>
            <input
              type="text"
              placeholder={t("prodDash.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-gray-700 dark:text-white w-full px-4 text-sm"
            />
          </div>

          {user && user.role === "ADMIN" && (
            <div className="flex bg-surface-card dark:bg-slate-900 p-1.5 rounded-full border border-border-default dark:border-slate-800 w-full lg:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTypeFilter("ALL")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "ALL"
                    ? "bg-primary-base text-white shadow-md"
                    : "text-text-muted hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                {t("prodDash.allItems")}
              </button>
              <button
                onClick={() => setActiveTypeFilter("CROP")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "CROP"
                    ? "bg-primary-base text-white shadow-md"
                    : "text-text-muted hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                {t("prodDash.cropProd")}
              </button>
              <button
                onClick={() => setActiveTypeFilter("AGRI")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "AGRI"
                    ? "bg-primary-base text-white shadow-md"
                    : "text-text-muted hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                {t("prodDash.agriShop")}
              </button>
            </div>
          )}
        </div>

        {/* Product List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-text-muted font-bold dark:text-text-disabled">{t("prodDash.loading")}</p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isCrop = product.marketplaceType === "CROP_MARKET";
                const isDeletable = canDeleteProduct(product);
                const isBoosted = boostedProducts.includes(product.id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id}
                    className={`bg-surface-card dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${
                      isBoosted
                        ? "border-[3px] border-amber-400 dark:border-amber-500 shadow-amber-400/20"
                        : "border border-border-default dark:border-slate-800/80"
                    }`}
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-2">
                          <span className={`text-[9px] w-fit font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                            isCrop
                              ? "bg-primary-light dark:bg-emerald-950/40 text-primary-base dark:text-emerald-400"
                              : "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
                          }`}>
                            {isCrop ? `🌾 ${t("nav.cropMarket")}` : `📦 ${t("prodDash.agriShop")}`}
                          </span>
                          {isBoosted && (
                            <span className="text-[9px] font-black w-fit uppercase tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20">
                              ✨ PREMIUM BOOSTED
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-text-disabled uppercase tracking-widest bg-surface-secondary dark:bg-slate-800/60 px-3 py-1 rounded-lg">
                          {t("market.category." + product.category) || product.category || "OTHER"}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-xl font-black text-text-main dark:text-white group-hover:text-primary-base transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-text-disabled font-bold">{t("prodDash.seller")}: {product.User?.fullName || "Zar3a Member"}</span>
                        {product.isVerified && (
                          <span className="bg-blue-500 rounded-full p-0.5 flex items-center justify-center shrink-0">
                            <LuCheck size={8} className="text-white" strokeWidth={4} />
                          </span>
                        )}
                      </div>

                      <p className="text-text-muted dark:text-text-disabled text-xs mt-3 leading-relaxed line-clamp-3 font-medium">
                        {product.description || t("track.noDesc")}
                      </p>

                      {/* Metadata fields */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                        <div>
                          <p className="text-[9px] font-bold text-text-disabled uppercase tracking-wider">{t("prodDash.region")}</p>
                          <p className="text-xs font-black text-text-main dark:text-gray-200">{t("loc." + product.region) || product.region || t("market.all")}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-text-disabled uppercase tracking-wider">{t("prodDash.status")}</p>
                          <p className="text-xs font-black text-primary-base dark:text-green-400">
                            {product.status === "AVAILABLE" ? t("market.available") :
                             product.status === "SOLD" ? t("market.sold") :
                             product.status === "DELETED" ? t("market.deleted") :
                             product.status || t("market.available")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info and Actions */}
                    <div className="mt-6 pt-5 border-t border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-text-disabled uppercase tracking-widest mb-0.5">{t("prodDash.price")}</p>
                        <p className="text-xl font-black text-text-main dark:text-white">
                          EGP {Number(product.price).toLocaleString()} <span className="text-xs font-normal text-text-disabled">/ {product.unit || "unit"}</span>
                        </p>
                      </div>

                      {isDeletable ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="w-12 h-12 bg-primary-light dark:bg-emerald-950/20 text-primary-base dark:text-emerald-400 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm"
                            title={t("common.edit")}
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                            title={t("common.delete")}
                          >
                            <LuTrash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-disabled dark:text-text-muted font-bold bg-surface-secondary dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                          {t("prodDash.viewOnly")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredProducts.length === 0 && !loading && (
              <div className="col-span-full py-28 bg-surface-card dark:bg-slate-900 rounded-[3rem] border border-border-default dark:border-slate-800 text-center flex flex-col items-center justify-center">
                <LuLayoutGrid size={50} className="text-gray-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-black text-text-main dark:text-white">{t("prodDash.noProductsFound")}</h3>
                <p className="text-xs text-text-disabled mt-1 max-w-sm">{t("prodDash.noProductsDesc")}</p>
              </div>
            )}
          </div>

        )}
      </div>

      {/* --- EDIT PRODUCT MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEditModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-surface-card dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] p-8 md:p-10 relative shadow-2xl z-10 overflow-y-auto max-h-[90vh] custom-scrollbar text-left"
            >
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="absolute top-6 right-6 p-3 bg-surface-secondary dark:bg-slate-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <LuX size={20} className="text-text-muted hover:text-red-500" />
              </button>

              <h2 className="text-2xl font-black dark:text-white mb-2 tracking-tight">
                {t("prodDash.editProductTitle") || "Edit Product Details"}
              </h2>
              <p className="text-xs text-text-disabled font-bold mb-6 uppercase tracking-wider">
                {t("prodDash.editProductDesc") || "Update your product offerings in the marketplace."}
              </p>

              {editError && (
                <div className="mb-4 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="mb-4 text-xs font-bold text-emerald-500 bg-primary-light dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProduct} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.prodTitle") || "Product Title"}</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      required
                      placeholder="e.g. Premium Nitrates"
                      className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.price") || "Price (EGP)"}</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditFormChange}
                      required
                      min="1"
                      placeholder="e.g. 500"
                      className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.unit") || "Unit"}</label>
                    <input
                      type="text"
                      name="unit"
                      value={editForm.unit}
                      onChange={handleEditFormChange}
                      placeholder="e.g. Bag, Ton, kg"
                      className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.region") || "Region"}</label>
                    <input
                      type="text"
                      name="region"
                      value={editForm.region}
                      onChange={handleEditFormChange}
                      placeholder="e.g. Cairo, assiot"
                      className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.status") || "Status"}</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                      className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="SOLD">SOLD</option>
                      <option value="DELETED">DELETED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.category") || "Category"}</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="SEEDS">SEEDS</option>
                    <option value="FERTILIZERS">FERTILIZERS</option>
                    <option value="TOOLS">TOOLS</option>
                    <option value="PRODUCE">PRODUCE</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.description") || "Description"}</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    required
                    rows={4}
                    placeholder="Provide details about nutrient values, size, and uses..."
                    className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl p-4 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-disabled uppercase tracking-widest mb-1.5">{t("prodDash.productImage") || "Product Image"}</label>
                  <div className="mt-2 flex flex-col md:flex-row items-center gap-4">
                    {(editImagePreview || editForm.imageUrl) && (
                      <div className="w-24 h-24 rounded-2xl border border-border-default dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center bg-surface-secondary dark:bg-slate-800">
                        <img src={editImagePreview || editForm.imageUrl} alt="Preview" className="w-full h-full object-cover animate-fade-in" />
                      </div>
                    )}
                    <div className="flex-1 w-full space-y-3">
                      <input
                        type="text"
                        name="imageUrl"
                        value={editForm.imageUrl}
                        onChange={(e) => { handleEditFormChange(e); setEditImageFile(null); setEditImagePreview(""); }}
                        placeholder="Paste External Image URL"
                        className="w-full bg-surface-secondary dark:bg-slate-800 border border-border-default dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
                      />
                      <div className="relative h-12 flex items-center justify-center border-2 border-dashed border-border-default dark:border-slate-700 rounded-2xl hover:bg-surface-secondary dark:hover:bg-slate-800/50 transition">
                        <span className="absolute text-[10px] font-bold text-text-disabled pointer-events-none">
                          OR UPLOAD FILE (.JPG/.PNG)
                        </span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setEditImageFile(file);
                              setEditImagePreview(URL.createObjectURL(file));
                              setEditForm(prev => ({ ...prev, imageUrl: "" }));
                            }
                          }}
                          className="w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary-base text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover transition shadow-lg shadow-green-200 dark:shadow-none"
                  >
                    {t("prodDash.saveChanges") || "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-6 py-4 bg-surface-secondary dark:bg-slate-800 text-text-subtle dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    {t("prodDash.cancel") || "Cancel"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
