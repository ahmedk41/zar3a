import { useState, useRef, useEffect } from "react";
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
import { useLanguage } from "../../../context/LanguageContext";
import { useTheme } from "../../../context/ThemeContext";

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
    className={`absolute text-primary-base/10 dark:text-emerald-400/10 pointer-events-none hidden lg:block ${className}`}
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
              : "text-text-disabled group-focus-within:text-emerald-500"
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
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4(success)
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Step 1 data
  const [form1, setForm1] = useState({
    fullName: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors1, setErrors1] = useState({});
  const [errors3, setErrors3] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  // Sensor ID for farmers
  const [sensorId, setSensorId] = useState("");

  // Stored userId after step 1 succeeds
  const [userId, setUserId] = useState(null);



  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    const nameTrimmed = form1.fullName.trim();
    if (!nameTrimmed) {
      e.fullName = "Full name is required";
    } else if (nameTrimmed.length < 3) {
      e.fullName = "Full name must be at least 3 characters";
    } else if (nameTrimmed.length > 50) {
      e.fullName = "Full name must be at most 50 characters";
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(nameTrimmed)) {
      e.fullName = "Full name must contain only letters and spaces";
    }

    const usernameTrimmed = form1.username.trim();
    if (!usernameTrimmed) {
      e.username = "Username is required";
    } else if (usernameTrimmed.length < 3) {
      e.username = "Username must be at least 3 characters";
    } else if (usernameTrimmed.length > 20) {
      e.username = "Username must be at most 20 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(usernameTrimmed)) {
      e.username = "Only letters, numbers, underscores, or hyphens allowed";
    }

    const emailVal = form1.email.trim();
    if (!emailVal) {
      e.email = "Email is required";
    } else {
      const emailParts = emailVal.split('@');
      if (emailParts.length !== 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        e.email = "Please enter a valid email address";
      } else {
        const domain = emailParts[1].toLowerCase();
        const DISPOSABLE_DOMAINS = [
          'mailinator.com', 'yopmail.com', 'tempmail.com', 'temp-mail.org',
          'guerrillamail.com', 'trashmail.com', '10minutemail.com',
          'sharklasers.com', 'dispostable.com', 'getairmail.com',
          'maildrop.cc', 'tempmailaddress.com', 'burnermail.io'
        ];
        const COMMON_TYPOS = [
          'gamil.com', 'gmal.com', 'gmaill.com', 'gamil.co', 'gmal.co',
          'yaho.com', 'yahooo.com', 'yaho.co',
          'hotail.com', 'hotmale.com', 'hotmial.com',
          'iclod.com', 'icoud.com', 'iclud.com'
        ];
        if (DISPOSABLE_DOMAINS.includes(domain)) {
          e.email = "Temporary or disposable email domains are not allowed";
        } else if (COMMON_TYPOS.includes(domain)) {
          e.email = "Common email domain typos are not allowed (check your domain name spelling)";
        }
      }
    }

    // Auto-normalize 11-digit Egyptian phone (01…) → 12-digit (201…)
    let phoneCleaned = form1.phone.trim().replace(/^\+/, "");
    if (/^01\d{9}$/.test(phoneCleaned)) {
      phoneCleaned = "2" + phoneCleaned;
      setForm1((prev) => ({ ...prev, phone: phoneCleaned }));
    }
    if (!phoneCleaned) {
      e.phone = "Phone number is required";
    } else if (!/^\d{12}$/.test(phoneCleaned)) {
      e.phone = "Phone must be exactly 12 digits (e.g. 201012345678)";
    }

    // Password: ≥ 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    if (!form1.password) {
      e.password = "Password is required";
    } else if (form1.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|;':",./<>?]).{8,}$/.test(form1.password)) {
      e.password = "Must include uppercase, lowercase, number & special character";
    }

    if (!form1.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (form1.password !== form1.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors1(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (selectedRole === "FARMER") {
      const fsTrimmed = farmSize.trim();
      if (!fsTrimmed) {
        e.farmSize = "Farm size is required";
      } else if (isNaN(Number(fsTrimmed)) || Number(fsTrimmed) <= 0) {
        e.farmSize = "Farm size must be a positive number";
      }
      if (!soilType.trim()) {
        e.soilType = "Soil type is required";
      } else if (soilType.trim().length < 3) {
        e.soilType = "Soil type must be at least 3 characters";
      } else if (soilType.trim().length > 50) {
        e.soilType = "Soil type must be at most 50 characters";
      }
      if (!location.trim()) {
        e.location = "Location is required";
      } else if (location.trim().length < 3) {
        e.location = "Location must be at least 3 characters";
      } else if (location.trim().length > 100) {
        e.location = "Location must be at most 100 characters";
      }
      if (!sensorId.trim()) {
        e.sensorId = "Sensor ID is required for Farmer registration";
      } else if (sensorId.trim().length < 3) {
        e.sensorId = "Sensor ID must be at least 3 characters";
      }
    } else if (selectedRole === "SUPPLIER") {
      const tlTrimmed = tradeLicense.trim();
      if (!tlTrimmed) {
        e.tradeLicense = "Trade license number is required";
      } else if (tlTrimmed.length < 3 || tlTrimmed.length > 50) {
        e.tradeLicense = "Trade license must be between 3 and 50 characters";
      }
      if (!location.trim()) {
        e.location = "Business location is required";
      } else if (location.trim().length < 3) {
        e.location = "Business location must be at least 3 characters";
      } else if (location.trim().length > 100) {
        e.location = "Business location must be at most 100 characters";
      }
    } else if (selectedRole === "AGRO_EXPERT") {
      if (!academicDegree.trim()) {
        e.academicDegree = "Academic degree is required";
      } else if (academicDegree.trim().length < 3) {
        e.academicDegree = "Academic degree must be at least 3 characters";
      } else if (academicDegree.trim().length > 100) {
        e.academicDegree = "Academic degree must be at most 100 characters";
      }
      const expStr = typeof experienceYears === "string" ? experienceYears : String(experienceYears);
      const exp = Number(expStr);
      if (!expStr.trim()) {
        e.experienceYears = "Experience years is required";
      } else if (isNaN(exp) || !Number.isInteger(exp) || exp < 0 || exp > 60) {
        e.experienceYears = "Must be a whole number between 0 and 60";
      }
      if (!bio.trim()) {
        e.bio = "Biography description is required";
      } else if (bio.trim().length < 15) {
        e.bio = "Bio must be at least 15 characters long";
      } else if (bio.trim().length > 1000) {
        e.bio = "Bio must be at most 1000 characters";
      }
      if (!cvFilePath) {
        e.cv = "Please upload your credentials (PDF, Word, or Image) to verify your expert status";
      }
    }
    setErrors3(e);
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
    if (!validateStep3()) return;
    setLoading(true);
    setApiError("");
    try {
      if (selectedRole === "FARMER") {
        await completeFarmerProfile(userId, { farmSize, soilType, location, sensorId });
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
  const STEPS = [t("reg.step.account"), t("reg.step.role"), t("reg.step.profile")];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#fdfcf8] dark:bg-[#020617] font-sans transition-colors duration-700" dir="auto">

      {/* Navigation bar */}
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex justify-between items-center">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-surface-card/80 dark:bg-slate-800/80 backdrop-blur-md border border-border-default dark:border-slate-700 rounded-2xl shadow-sm text-text-subtle dark:text-slate-300 font-bold hover:text-primary-base transition-all"
        >
          <FiHome /> <span className="hidden sm:inline">{t("reg.home")}</span>
        </motion.button>
        <div className="flex gap-3 items-center">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-emerald-500/20 text-primary-base dark:text-emerald-400 font-black rounded-2xl transition-all"
            >
              <FiLogIn /> {t("reg.signIn")}
            </motion.button>
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center bg-surface-card/80 dark:bg-slate-800/80 backdrop-blur-md border border-border-default dark:border-slate-700 rounded-2xl shadow-sm text-yellow-500 transition-all"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} className="text-text-subtle" />}
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
        className="w-full max-w-2xl z-10 mt-24 sm:mt-20"
      >
        <div className="bg-surface-card/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl p-6 sm:p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-green-500 to-lime-400" />

          {/* Header */}
          <header className="mb-8 text-center">
            <h2 className="text-5xl font-[1000] text-text-main dark:text-white tracking-tighter">
              {t("reg.title")} <span className="text-primary-base dark:text-emerald-500">Zar3a</span>
            </h2>
            <p className="text-text-disabled dark:text-text-muted mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              {t("reg.subtitle")}
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
                  <div key={label} className="flex items-center gap-1 sm:gap-2">
                    <div className={`flex shrink-0 items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-black transition-all ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-primary-base text-white shadow-lg shadow-emerald-500/30"
                        : "bg-surface-secondary dark:bg-slate-800 text-text-disabled"
                    }`}>
                      {done ? <FiCheckCircle size={14} /> : num}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black hidden sm:block ${
                      active ? "text-primary-base dark:text-emerald-400" : "text-text-disabled"
                    }`}>{label}</span>
                    {i < STEPS.length - 1 && (
                      <div className={`w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 ${step > num ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
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
                      placeholder={t("reg.fullName")}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiAtSign} error={errors1.username}>
                    <input
                      value={form1.username}
                      onChange={(e) => setForm1({ ...form1, username: e.target.value })}
                      placeholder={t("reg.username")}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiMail} error={errors1.email}>
                    <input
                      value={form1.email}
                      onChange={(e) => setForm1({ ...form1, email: e.target.value })}
                      type="email"
                      placeholder={t("reg.email")}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiPhone} error={errors1.phone}>
                    <input
                      value={form1.phone}
                      onChange={(e) => setForm1({ ...form1, phone: e.target.value })}
                      type="tel"
                      placeholder={t("reg.phone")}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                  </Field>
                  <Field icon={FiLock} error={errors1.password}>
                    <input
                      value={form1.password}
                      onChange={(e) => setForm1({ ...form1, password: e.target.value })}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("reg.password")}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-primary-base transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </Field>
                  <Field icon={FiLock} error={errors1.confirmPassword}>
                    <input
                      value={form1.confirmPassword}
                      onChange={(e) => setForm1({ ...form1, confirmPassword: e.target.value })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("reg.confirmPassword")}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-primary-base transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </Field>
                </div>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleStep1}
                  className="w-full bg-primary-base hover:bg-primary-hover text-white py-5 rounded-4xl font-black text-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                >
                  {loading ? t("reg.creating") : <>{t("reg.continue")} <FiArrowRight size={22} /></>}
                </motion.button>

                <p className="text-center text-text-disabled text-sm font-bold">
                  {t("reg.hasAccount")}{" "}
                  <Link to="/login" className="text-primary-base font-black hover:underline">{t("reg.signIn")}</Link>
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
                <p className="text-center text-text-muted dark:text-text-disabled font-bold text-sm mb-2">
                  {t("reg.whatDescribes")}
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
                          ? "border-emerald-500 bg-primary-light/50 dark:bg-emerald-500/10 shadow-lg"
                          : "border-border-default dark:border-slate-800 hover:border-primary-light dark:hover:border-emerald-900 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="text-3xl mb-2">{role.emoji}</div>
                      <div className={`font-black text-sm mb-1 ${selectedRole === role.id ? "text-emerald-700 dark:text-emerald-400" : "text-text-subtle dark:text-slate-300"}`}>
                        {role.label}
                      </div>
                      <p className="text-[11px] text-text-disabled font-bold">{role.desc}</p>
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
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !selectedRole}
                    onClick={handleStep2}
                    className="flex-1 bg-primary-base hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                  >
                    {loading ? t("reg.saving") : <>{t("reg.continue")} <FiArrowRight /></>}
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
                <p className="text-center text-text-muted dark:text-text-disabled font-bold text-sm">
                  {t("reg.completeProfile")} <span className="text-primary-base">{ROLES.find(r => r.id === selectedRole)?.label}</span> {t("reg.profile")}
                </p>

                {/* FARMER fields */}
                {selectedRole === "FARMER" && (
                  <>
                    <Field icon={FiFileText} error={errors3.farmSize}>
                      <input value={farmSize} onChange={e => setFarmSize(e.target.value)} placeholder={t("reg.farmSize")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText} error={errors3.soilType}>
                      <input value={soilType} onChange={e => setSoilType(e.target.value)} placeholder={t("reg.soilType")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiMapPin} error={errors3.location}>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder={t("reg.location")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText} error={errors3.sensorId}>
                      <input value={sensorId} onChange={e => setSensorId(e.target.value)} placeholder={t("profile.sensorId") || "Sensor ID"} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                  </>
                )}

                {/* BUYER — no extra fields needed */}
                {selectedRole === "BUYER" && (
                  <div className="text-center py-8 text-text-muted dark:text-text-disabled font-bold">
                    <div className="text-5xl mb-4">🛒</div>
                    <p>{t("reg.buyerReady")}</p>
                    <p className="text-sm mt-2 text-text-disabled">{t("reg.buyerContinue")}</p>
                  </div>
                )}

                {/* SUPPLIER fields */}
                {selectedRole === "SUPPLIER" && (
                  <>
                    <Field icon={FiFileText} error={errors3.tradeLicense}>
                      <input value={tradeLicense} onChange={e => setTradeLicense(e.target.value)} placeholder={t("reg.tradeLicense")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiMapPin} error={errors3.location}>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder={t("reg.bizLocation")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                  </>
                )}

                {/* AGRO_EXPERT fields */}
                {selectedRole === "AGRO_EXPERT" && (
                  <>
                    <Field icon={FiBriefcase} error={errors3.academicDegree}>
                      <input value={academicDegree} onChange={e => setAcademicDegree(e.target.value)} placeholder={t("reg.degree")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText} error={errors3.experienceYears}>
                      <input value={experienceYears} onChange={e => setExperienceYears(e.target.value)} type="number" min="0" placeholder={t("reg.experience")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field icon={FiFileText} error={errors3.bio}>
                      <input value={bio} onChange={e => setBio(e.target.value)} placeholder={t("reg.bio")} className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 bg-surface-secondary/30 dark:bg-slate-950/50 dark:text-white border-border-default dark:border-slate-800 focus:border-emerald-500 outline-none font-semibold" />
                    </Field>
                    <Field error={errors3.cv}>
                      <div
                        onClick={() => cvInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-primary-light dark:border-emerald-900/50 rounded-2xl p-6 text-center hover:bg-primary-light/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group"
                      >
                        <input
                          ref={cvInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif"
                          className="hidden"
                          onChange={e => setCvFile(e.target.files[0])}
                        />
                        <FiUploadCloud className="text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" size={28} />
                        <p className="text-[11px] font-black text-text-subtle dark:text-text-disabled uppercase">
                          {cvFilePath ? `✅ ${cvFilePath.name}` : t("reg.uploadCv")}
                        </p>
                      </div>
                    </Field>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2">
                      {t("reg.expertWarning")}
                    </p>
                  </>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleStep3}
                    className="w-full bg-primary-base hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                  >
                    {loading ? t("reg.finishing") : <>{t("reg.finishSetup")} <FiArrowRight /></>}
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
                  <h3 className="text-3xl font-black text-text-main dark:text-white">{t("reg.accountCreated")}</h3>
                  <p className="text-text-muted dark:text-text-disabled mt-2 font-semibold">
                    {selectedRole === "AGRO_EXPERT" ? t("reg.expertPending") : t("reg.welcome")}
                  </p>
                </div>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary-base hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all"
                >
                  {t("reg.goToLogin")} <FiArrowRight />
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
