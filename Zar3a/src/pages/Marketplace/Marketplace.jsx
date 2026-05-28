import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../hooks/useCart";
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
} from "react-icons/lu";

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
      marketplaceType === "AGRI_MARKET"
        ? "shop"
        : marketplaceType === "CROP_MARKET"
        ? "market"
        : TO_SHOP_CATEGORIES.includes(product.category)
        ? "shop"
        : "market",
  };
};

const Marketplace = () => {
  const { user, getProducts, createProduct } = useAuth();
  const { cart, addToCart: hookAddToCart, removeFromCart, updateQuantity } = useCart(user?.id);
  const navigate = useNavigate();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("shop");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Top Rated");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
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
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      return setFormError("Please complete all required fields.");
    }

    try {
      const newProduct = await createProduct({
        ...createForm,
        price: Number(createForm.price),
        marketplaceType: createForm.marketplaceType || 'CROP_MARKET',
        productSource: createForm.productSource || 'MANUAL',
        status: createForm.status || 'AVAILABLE',
      });
      setProducts((prev) => [normalizeProduct(newProduct), ...prev]);
      setSuccessMessage("Product added successfully.");
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", category: "", price: "", unit: "unit", region: "", imageUrl: "", marketplaceType: "CROP_MARKET", productSource: "MANUAL", status: "AVAILABLE" });
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Could not create product.");
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
            Agri-Shop
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
            Crop Market
            {activeTab === "market" && (
              <motion.div
                layoutId="tabBg"
                className="absolute inset-0 bg-green-600 rounded-full -z-10 shadow-lg shadow-green-200 dark:shadow-none"
              />
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {user && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center gap-3 bg-gray-900 dark:bg-slate-800 text-white px-8 py-4 rounded-full font-black hover:scale-105 transition-transform shadow-xl w-full sm:w-auto"
            >
              <LuShoppingCart size={22} />
              <span>EGP {cart.reduce((t, i) => t + i.price * i.quantity, 0).toLocaleString()}</span>
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
              <LuPlus size={20} /> Add Product
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
            placeholder="Search by title, region..."
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
          <span className="text-sm tracking-wide">{isFilterOpen ? "Close Filters" : "Open Filters"}</span>
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
                <LuLayoutGrid /> Category
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
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <LuSlidersHorizontal /> Sort By
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option>Top Rated</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-end mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <LuDollarSign /> Max Price
                </p>
                <span className="text-sm font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                  EGP {Number(maxPrice).toLocaleString()}
                </span>
              </div>
              {/* <input
                type="range"
                min="0"
                max={activeTab === "shop" ? "2000" : "50000"}
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              /> */}
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
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      EGP {item.price.toLocaleString()} <span className="text-[10px] text-gray-400">/ {item.unit}</span>
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
                    className="w-12 h-12 bg-gray-900 dark:bg-green-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-md hover:shadow-lg hover:bg-green-500 active:scale-95 transition-all"
                  >
                    <LuPlus size={22} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredData.length === 0 && !loadingProducts && (
          <div className="col-span-full py-20 text-center">
            <LuSearch size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">No items found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setMaxPrice(50000);
                setSelectedCategory("All");
                setIsFilterOpen(false);
              }}
              className="mt-4 text-green-600 font-bold hover:underline"
            >
              Clear Filters
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
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</p>
                            <p className="text-2xl font-black dark:text-white leading-none">
                              EGP {selectedProduct.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              handleAddToCart(selectedProduct);
                              setSelectedProduct(null);
                            }}
                            className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <LuPlus size={18} /> Add to Cart
                          </button>
                        </div>
                      </div>
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
                      Cart
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
                        <p className="font-black text-xl">Your cart is empty</p>
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
                            <p className="text-xs font-black text-green-600">EGP {(item.price * item.quantity).toLocaleString()}</p>
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
                      <span className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] mb-1">Total Estimate</span>
                      <span className="font-black text-3xl dark:text-white leading-none">
                        EGP {cart.reduce((t, i) => t + i.price * i.quantity, 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      className="w-full py-5 bg-gray-900 dark:bg-green-600 disabled:bg-gray-200 disabled:dark:bg-slate-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-4xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95"
                    >
                      Checkout Securely
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
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black dark:text-white">Add Marketplace Product</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Suppliers and farmers can list products directly in the marketplace.</p>
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
                    placeholder="Product title"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateInput}
                    placeholder="Product description"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none h-32 resize-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="category"
                      value={createForm.category}
                      onChange={handleCreateInput}
                      placeholder="Category"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="number"
                      name="price"
                      value={createForm.price}
                      onChange={handleCreateInput}
                      placeholder="Price"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select
                      name="marketplaceType"
                      value={createForm.marketplaceType}
                      onChange={handleCreateInput}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="CROP_MARKET">Crop Market</option>
                      <option value="AGRI_MARKET">Agri Market</option>
                    </select>
                    <select
                      name="productSource"
                      value={createForm.productSource}
                      onChange={handleCreateInput}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="SENSED">Sensed</option>
                    </select>
                    <select
                      name="status"
                      value={createForm.status}
                      onChange={handleCreateInput}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="SOLD">Sold</option>
                      <option value="DELETED">Deleted</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="unit"
                      value={createForm.unit}
                      onChange={handleCreateInput}
                      placeholder="Unit (e.g. kg, Ton)"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      name="region"
                      value={createForm.region}
                      onChange={handleCreateInput}
                      placeholder="Region"
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
                    onClick={handleCreateProduct}
                    className="w-full py-4 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-green-700 transition"
                  >
                    Create Listing
                  </button>
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
