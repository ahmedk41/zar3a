import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiHome,
  FiSun,
  FiMoon,
  FiUserPlus,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Logo2 from "../../../assets/logo2.png";
import { useAuth } from "../../../context/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email or username is required" })
    .refine((value) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/;
      return emailPattern.test(value) || usernamePattern.test(value);
    }, { message: "Enter a valid email or username" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    if (newTheme) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      const user = await login(data.email, data.password);

      const redirectMap = {
        'FARMER': '/profile/farmer',
        'BUYER': '/profile/buyer',
        'SUPPLIER': '/profile/supplier',
        'AGRO_EXPERT': '/profile/expert',
        'ADMIN': '/admin',
      };

      const redirectPath =
        user.pendingRole === 'AGRO_EXPERT'
          ? '/profile/expert'
          : redirectMap[user.role] || '/dashboard';

      navigate(redirectPath);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Login failed. Please check your credentials.";
      setApiError(msg);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth — coming soon
    setIsGoogleLoading(true);
    setTimeout(() => setIsGoogleLoading(false), 1000);
  };

  const FloatingLeaf = ({ className, delay, size = "140" }) => (
    <motion.div
      animate={{ y: [0, -25, 0], rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: 10 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`absolute text-emerald-600/10 dark:text-emerald-400/5 hidden lg:block pointer-events-none ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,3 14,3.5 9,9C8.44,9.62 8,10.3 7.65,11C11.3,7.64 15.5,6.11 15.5,6.11C15.5,6.11 11,8.5 7.65,12.3C7.2,13.2 6.88,14.23 6.7,15.3C6.1,13.6 5.33,12.14 4.54,11.26C4.06,10.71 3.56,10.23 3,9.81C3,9.81 7,2 14,2C17,2 20,3 22,3C22,3 20.19,6.03 17,8Z" />
      </svg>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#fdfcf8] dark:bg-[#020617] font-sans transition-colors duration-500">
      
      {/* 🏠 Home Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300 font-bold hover:text-emerald-600 transition-all"
      >
        <FiHome /> Home
      </motion.button>

      {/* 🌗 Right Side Controls (Theme & Register) */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        {/* ✨ زر التسجيل الجديد */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/register")}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
        >
          <FiUserPlus /> Register
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-yellow-400 transition-all"
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </motion.button>
      </div>

      {/* 🍃 The Floating Leaves */}
      <FloatingLeaf className="top-20 right-[10%]" delay={0} size="160" />
      <FloatingLeaf className="bottom-20 left-[8%] -scale-x-100" delay={2} size="130" />
      <FloatingLeaf className="top-1/2 left-[5%] opacity-50" delay={4} size="100" />

      {/* Background Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-200/20 dark:bg-green-900/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-120 z-10"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white dark:border-slate-800 rounded-[3rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-green-500 to-lime-400" />

          <header className="text-center mb-10">
            <div
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl mb-6 shadow-inner border border-emerald-100 dark:border-emerald-800 cursor-pointer"
            >
              <img
                src={Logo2}
                alt="Logo"
                className="object-contain transform scale-400 w-full h-6"
              />
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              Welcome <span className="text-emerald-600">Back</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm">
              Access your agriculture hub
            </p>
          </header>

          {/* 🌈 Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all mb-8 group disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  className="w-5 h-5 group-hover:rotate-12 transition-transform"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Or Sign In
            </span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
          </div>

          {/* API Error */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold"
              >
                <FiAlertCircle className="shrink-0" />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email or Username
              </label>
              <div className="relative group">
                <FiMail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errors.email ? "text-red-400" : "text-slate-400 group-focus-within:text-emerald-500"}`}
                />
                <input
                  {...register("email")}
                  type="text"
                  placeholder="farmer@zar3a.com or username"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-slate-50 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <FiLock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-emerald-500"}`}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-slate-50 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-transparent"
                />
                <span className="text-slate-500 dark:text-slate-400 font-bold">
                  Keep me signed in
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-emerald-600 font-black hover:underline"
              >
                Forgot?
              </button>
            </div>

            <motion.button
              disabled={isSubmitting || isGoogleLoading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all mt-4"
            >
              {isSubmitting ? (
                "Loading..."
              ) : (
                <>
                  Sign In <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <footer className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
            <p className="text-slate-400 text-sm font-bold">
              New here?{" "}
              <Link
                to="/register"
                className="text-emerald-600 font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

// 🌱
