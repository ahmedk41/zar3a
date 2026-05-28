import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch,
  LuTrash2,
  LuSlidersHorizontal,
  LuSprout,
  LuPackage,
  LuCheck,
  LuLayoutGrid
} from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../API/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ProductsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL"); // "ALL" | "CROP" | "AGRI"
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
      if (user.role === "ADMIN") {
        // Fetch crop products & agri products in parallel
        const [cropRes, agriRes] = await Promise.all([
          api.get("/marketplace/crop-products"),
          api.get("/marketplace/agri-products")
        ]);
        const crops = Array.isArray(cropRes.data) ? cropRes.data : [];
        const agris = Array.isArray(agriRes.data) ? agriRes.data : [];
        setProducts([...crops, ...agris]);
      } else if (user.role === "FARMER") {
        // Farmer sees only crop market products
        const cropRes = await api.get("/marketplace/crop-products");
        const crops = Array.isArray(cropRes.data) ? cropRes.data : [];
        setProducts(crops);
      } else if (user.role === "SUPPLIER") {
        // Supplier sees only agri shop products
        const agriRes = await api.get("/marketplace/agri-products");
        const agris = Array.isArray(agriRes.data) ? agriRes.data : [];
        setProducts(agris);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products in dashboard:", err);
      setErrorMsg("Failed to retrieve marketplace products.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await api.delete(`/marketplace/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setMessage("Product deleted successfully.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Failed to delete product.");
      setTimeout(() => setErrorMsg(null), 4000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4 md:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase">
              Product Dashboard
            </h1>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-widest">
              Manage & Monitor Marketplace Offerings
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadProducts}
              className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs hover:bg-gray-200 transition"
            >
              REFRESH
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition shadow-lg shadow-green-200 dark:shadow-none"
            >
              BROWSE MARKETPLACE
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
              className="flex items-center gap-3 px-6 py-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-600 dark:text-green-400 font-semibold"
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
          <div className="flex-1 w-full relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex items-center p-2">
            <div className="p-3 text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-2xl">
              <LuSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Search products by title, category, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-gray-700 dark:text-white w-full px-4 text-sm"
            />
          </div>

          {user && user.role === "ADMIN" && (
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-100 dark:border-slate-800 w-full lg:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTypeFilter("ALL")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "ALL"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setActiveTypeFilter("CROP")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "CROP"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                Crop Products
              </button>
              <button
                onClick={() => setActiveTypeFilter("AGRI")}
                className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  activeTypeFilter === "AGRI"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-950 dark:hover:text-white"
                }`}
              >
                Agri Shop
              </button>
            </div>
          )}
        </div>

        {/* Product List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 font-bold dark:text-gray-400">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isCrop = product.marketplaceType === "CROP_MARKET";
                const isDeletable = canDeleteProduct(product);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                          isCrop
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
                        }`}>
                          {isCrop ? "🌾 Crop Market" : "📦 Agri Shop"}
                        </span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-slate-800/60 px-3 py-1 rounded-lg">
                          {product.category || "OTHER"}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-green-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400 font-bold">Seller: {product.User?.fullName || "Zar3a Member"}</span>
                        {product.isVerified && (
                          <span className="bg-blue-500 rounded-full p-0.5 flex items-center justify-center shrink-0">
                            <LuCheck size={8} className="text-white" strokeWidth={4} />
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed line-clamp-3 font-medium">
                        {product.description || "No description provided."}
                      </p>

                      {/* Metadata fields */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Region</p>
                          <p className="text-xs font-black text-slate-800 dark:text-gray-200">{product.region || "All Regions"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                          <p className="text-xs font-black text-green-600 dark:text-green-400">{product.status || "AVAILABLE"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info and Actions */}
                    <div className="mt-6 pt-5 border-t border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          EGP {Number(product.price).toLocaleString()} <span className="text-xs font-normal text-gray-400">/ {product.unit || "unit"}</span>
                        </p>
                      </div>

                      {isDeletable ? (
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Delete Product"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold bg-gray-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                          VIEW ONLY
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredProducts.length === 0 && !loading && (
              <div className="col-span-full py-28 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                <LuLayoutGrid size={50} className="text-gray-300 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">No products found</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">No products matched the search query or filters currently selected.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
