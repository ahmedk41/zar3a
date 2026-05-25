import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiBriefcase,
  FiUploadCloud,
  FiHome,
  FiSun,
  FiMoon,
  FiLogIn,
  FiAlertCircle,
  FiCheckCircle,
  FiPhone,
  FiAtSign,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "FARMER",
    label: "Farmer",
    desc: "Grow crops & manage land",
    color: "emerald",
    emoji: "🌾",
  },
  {
    id: "BUYER",
    label: "Buyer",
    desc: "Purchase agricultural products",
    color: "sky",
    emoji: "🛒",
  },
  {
    id: "SUPPLIER",
    label: "Supplier",
    desc: "Supply tools & materials",
    color: "violet",
    emoji: "📦",
  },
  {
    id: "AGRO_EXPERT",
    label: "Agro-Expert",
    desc: "Specialist / Consultant",
    color: "amber",
    emoji: "🎓",
  },
];

// ── Floating leaf decoration ──────────────────────────────────────────────────
const Leaf = ({ className, delay, size, rotate }) => (
  <motion.div
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      rotate: [rotate, rotate + 15, rotate - 15, rotate],
    }}
    transition={{
      duration: 12 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
    className={`absolute text-emerald-600/10 dark:text-emerald-400/10 pointer-events-none hidden lg:block ${className}`}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,3 14,3.5 9,9C8.44,9.62 8,10.3 7.65,11C11.3,7.64 15.5,6.11 15.5,6.11C15.5,6.11 11,8.5 7.65,12.3C7.2,13.2 6.88,14.23 6.7,15.3C6.1,13.6 5.33,12.14 4.54,11.26C4.06,10.71 3.56,10.23 3,9.81C3,9.81 7,2 14,2C17,2 20,3 22,3C22,3 20.19,6.03 17,8Z" />
    </svg>
  </motion.div>
);

// ── Input wrapper ─────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, error, children }) => (
  <div className="space-y-1">
    <div className="relative group">
      {Icon && (
        <Icon
          className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
            error
              ? "text-red-400"
              : "text-slate-400 group-focus-within:text-emerald-500"
          }`}
        />
      )}
      {children}
    </div>
    {error && (
      <p className="text-xs text-red-500 font-semibold ml-2">{error}</p>
    )}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, chooseRole, completeFarmerProfile, completeBuyerProfile, completeSupplierProfile, completeExpertProfile } = useAuth();

  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4(success)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Step 1 data
  const [form1, setForm1] = useState({
    fullName: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors1, setErrors1] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 data
  const [selectedRole, setSelectedRole] = useState("");

  // Step 3 data (profile-specific)
  const [farmSize, setFarmSize]       = useState("");
  const [soilType, setSoilType]       = useState("");
  const [location, setLocation]       = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [cvFilePath, setCvFile]           = useState(null);
  const cvInputRef = useRef();

  // Stored userId after step 1 succeeds
  const [userId, setUserId] = useState(null);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!form1.fullName.trim()) e.fullName = "Full name is required";
    if (!form1.username.trim()) e.username = "Username is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form1.email)) e.email = "Valid email required";
    if (!form1.phone.trim()) e.phone = "Phone number is required";
    if (form1.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form1.password !== form1.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors1(e);
    return Object.keys(e).length === 0;
  };

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleStep1 = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await registerUser(form1);
      setUserId(data.userId);
      setStep(2);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!selectedRole) { setApiError("Please select a role"); return; }
    setLoading(true);
    setApiError("");
    try {
      await chooseRole(userId, selectedRole);
      setStep(3);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        "Failed to set role. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setLoading(true);
    setApiError("");
    try {
      if (selectedRole === "FARMER") {
        await completeFarmerProfile(userId, { farmSize, soilType, location });
      } else if (selectedRole === "BUYER") {
        await completeBuyerProfile(userId);
      } else if (selectedRole === "SUPPLIER") {
        await completeSupplierProfile(userId, { tradeLicense, location });
      } else if (selectedRole === "AGRO_EXPERT") {
        const fd = new FormData();
        fd.append("academicDegree", academicDegree);
        fd.append("experienceYears", experienceYears);
        fd.append("bio", bio);
        if (cvFilePath) fd.append("cv", cvFilePath);
        await completeExpertProfile(userId, fd);
      }
      setStep(4);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Profile completion failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step labels ───────────────────────────────────────────────────────────
  const STEPS = ["Account", "Role", "Profile"];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#fdfcf8] dark:bg-[#020617] font-sans transition-colors duration-700">

      {/* Navigation bar */}
      <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-center">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300 font-bold hover:text-emerald-600 transition-all"
        >
          <FiHome /> <span className="hidden sm:inline">Home</span>
        </motion.button>
        <div className="flex gap-3 items-center">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl transition-all"
            >
              <FiLogIn /> Sign In
            </motion.button>
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-yellow-500 transition-all"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} className="text-slate-600" />}
          </motion.button>
        </div>
      </div>

      {/* Background leaves */}
      <Leaf className="top-[10%] left-[5%]" size="180" delay={0} rotate={20} />
      <Leaf className="top-[5%] right-[10%]" size="140" delay={2} rotate={-15} />
      <Leaf className="bottom-[10%] left-[10%]" size="160" delay={4} rotate={140} />
      <Leaf className="bottom-[15%] right-[5%]" size="200" delay={1} rotate={-110} />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-100/40 dark:bg-emerald-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-200/20 dark:bg-emerald-900/10 blur-[140px] pointer-events-none" />

      {/* Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10 mt-20"
      >
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-[3.5rem] shadow-2xl p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-green-500 to-lime-400" />

          {/* Header */}
          <header className="mb-8 text-center">
            <h2 className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter">
              Join <span className="text-emerald-600 dark:text-emerald-500">Zar3a</span>
            </h2>
            <p className="text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              The Future of Agricultural Intelligence
            </p>
          </header>

          {/* Step indicator */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-10">
              {STEPS.map((label, i) => {
                const num = i + 1;
                const active = step === num;
                const done = step > num;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {done ? <FiCheckCircle size={14} /> : num}
                    </div>
                    <span className={`text-xs font-black hidden sm:block ${
                      active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    }`}>{label}</span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${step > num ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* API Error */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold"
              >
                <FiAlertCircle className="shrink-0" /> {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Basic Info ─────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field icon={FiUser} error={errors1.fullName}>
                    <input
                      value={form1.fullName}
                      onChange={(e) => setForm1({ ...form1, fullName: e.target.value })}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiAtSign} error={errors1.username}>
                    <input
                      value={form1.username}
                      onChange={(e) => setForm1({ ...form1, username: e.target.value })}
                      placeholder="Username"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiMail} error={errors1.email}>
                    <input
                      value={form1.email}
                      onChange={(e) => setForm1({ ...form1, email: e.target.value })}
                      type="email"
                      placeholder="Email Address"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiPhone} error={errors1.phone}>
                    <input
                      value={form1.phone}
                      onChange={(e) => setForm1({ ...form1, phone: e.target.value })}
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiLock} error={errors1.password}>
                    <input
                      value={form1.password}
                      onChange={(e) => setForm1({ ...form1, password: e.target.value })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (min 8 chars)"
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </Field>
                  <Field icon={FiLock} error={errors1.confirmPassword}>
                    <input
                      value={form1.confirmPassword}
                      onChange={(e) => setForm1({ ...form1, confirmPassword: e.target.value })}
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                </div>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleStep1}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-4xl font-black text-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                >
                  {loading ? "Creating account..." : <>Continue <FiArrowRight size={22} /></>}
                </motion.button>

                <p className="text-center text-slate-400 text-sm font-bold">
                  Already have an account?{" "}
                  <Link to="/login" className="text-emerald-600 font-black hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Choose Role ───────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-6"
              >
                <p className="text-center text-slate-500 dark:text-slate-400 font-bold text-sm mb-2">
                  What best describes you?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ROLES.map((role) => (
                    <motion.div
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedRole(role.id); setApiError(""); }}
                      className={`p-5 rounded-3xl border-2 cursor-pointer transition-all relative ${
                        selectedRole === role.id
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg"
                          : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="text-3xl mb-2">{role.emoji}</div>
                      <div className={`font-black text-sm mb-1 ${selectedRole === role.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                        {role.label}
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">{role.desc}</p>
                      {selectedRole === role.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="text-white" size={12} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ x: -2 }}
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:border-slate-300 transition-all"
                  >
                    <FiArrowLeft /> Back
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !selectedRole}
                    onClick={handleStep2}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                  >
                    {loading ? "Saving..." : <>Continue <FiArrowRight /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Complete Profile ──────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-5"
              >
                <p className="text-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                  Complete your <span className="text-emerald-600">{ROLES.find(r => r.id === selectedRole)?.label}</span> profile
                </p>

                {/* FARMER fields */}
                {selectedRole === "FARMER" && (
                  <>
                    <Field icon={FiFileText}>
                      <input value={farmSize} onChange={e => setFarmSize(e.target.value)} placeholder="Farm Size (e.g. 5 acres)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText}>
                      <input value={soilType} onChange={e => setSoilType(e.target.value)} placeholder="Soil Type (optional)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiMapPin}>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                  </>
                )}

                {/* BUYER — no extra fields needed */}
                {selectedRole === "BUYER" && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="text-5xl mb-4">🛒</div>
                    <p>Your buyer account is ready to be activated!</p>
                    <p className="text-sm mt-2 text-slate-400">Click Continue to finish setup.</p>
                  </div>
                )}

                {/* SUPPLIER fields */}
                {selectedRole === "SUPPLIER" && (
                  <>
                    <Field icon={FiFileText}>
                      <input value={tradeLicense} onChange={e => setTradeLicense(e.target.value)} placeholder="Trade License (optional)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiMapPin}>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Business Location (optional)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                  </>
                )}

                {/* AGRO_EXPERT fields */}
                {selectedRole === "AGRO_EXPERT" && (
                  <>
                    <Field icon={FiBriefcase}>
                      <input value={academicDegree} onChange={e => setAcademicDegree(e.target.value)} placeholder="Academic Degree (required)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText}>
                      <input value={experienceYears} onChange={e => setExperienceYears(e.target.value)} type="number" min="0" placeholder="Years of Experience (required)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText}>
                      <input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio (required)" className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-slate-50/30 dark:bg-slate-950/50 dark:text-white border-slate-100 dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <div
                      onClick={() => cvInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 text-center hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group"
                    >
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={e => setCvFile(e.target.files[0])}
                      />
                      <FiUploadCloud className="text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" size={28} />
                      <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase">
                        {cvFilePath ? `✅ ${cvFilePath.name}` : "Upload CV / Credentials (optional)"}
                      </p>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2">
                      ⚠️ Expert accounts require admin approval before activation.
                    </p>
                  </>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ x: -2 }}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:border-slate-300 transition-all"
                  >
                    <FiArrowLeft /> Back
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleStep3}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                  >
                    {loading ? "Finishing setup..." : <>Finish Setup <FiArrowRight /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Success ───────────────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-4xl"
                >
                  🌱
                </motion.div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">Account Created!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                    {selectedRole === "AGRO_EXPERT"
                      ? "Your expert application is pending admin approval. We'll notify you soon."
                      : "Welcome to Zar3a — your account is ready."}
                  </p>
                </div>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all"
                >
                  Go to Login <FiArrowRight />
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
